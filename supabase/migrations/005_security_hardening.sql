-- ============================================================
-- 005_security_hardening.sql — RLS & RPC security hardening
-- ============================================================

-- ──────────────────────────────────────────────────────────────
-- 1. APPLICATIONS — drop the over-permissive UPDATE policy.
--
--    The original "Service role can update applications" used
--    `using (true)`, which grants UPDATE on every application row
--    to ANY authenticated user — not just the service role.
--    The service role already bypasses RLS by default (it uses a
--    JWT signed with the service_role secret, which Supabase
--    treats as a superuser context). No explicit UPDATE policy is
--    needed; removing it closes the privilege escalation hole.
-- ──────────────────────────────────────────────────────────────
drop policy if exists "Service role can update applications" on public.applications;


-- ──────────────────────────────────────────────────────────────
-- 2. APPLICATIONS — tighten the public INSERT check.
--
--    `with check (true)` allowed an insert with any property_id
--    value — including IDs of inactive or non-existent properties.
--    The foreign key constraint blocks truly nonexistent IDs, but
--    would not block inserts against soft-deleted (is_active=false)
--    properties. The new policy enforces active status at the DB
--    layer as a second line of defence behind the API route check.
-- ──────────────────────────────────────────────────────────────
drop policy if exists "Anyone can submit an application" on public.applications;

create policy "Anyone can submit an application for an active property"
  on public.applications for insert
  with check (
    exists (
      select 1 from public.properties
      where properties.id  = applications.property_id
        and properties.is_active = true
    )
  );


-- ──────────────────────────────────────────────────────────────
-- 3. STORAGE — scope income-document reads to the owning landlord.
--
--    The old policy:
--      using (bucket_id = 'income-documents' and auth.uid() is not null)
--    allowed any authenticated user to read any file in the bucket.
--    A landlord with a valid session could access another landlord's
--    tenant pay stubs by guessing the storage path.
--
--    The replacement joins through applications → properties to
--    confirm the requesting user owns the property whose application
--    produced this document.
--
--    Note: storage.objects.name is the full storage path (e.g.
--    "prop-uuid/timestamp.pdf") which matches income_document_path.
-- ──────────────────────────────────────────────────────────────
drop policy if exists "Landlords can read income documents" on storage.objects;

create policy "Landlords can read own income documents"
  on storage.objects for select
  using (
    bucket_id = 'income-documents'
    and auth.uid() is not null
    and exists (
      select 1
      from   public.applications  a
      join   public.properties    p on p.id = a.property_id
      where  a.income_document_path = storage.objects.name
        and  p.landlord_id          = auth.uid()
    )
  );


-- ──────────────────────────────────────────────────────────────
-- 4. RPC — downgrade reset_screening_count to SECURITY INVOKER.
--
--    SECURITY DEFINER means the function runs with the privileges
--    of the *defining* role (postgres/owner), regardless of who
--    calls it.  That elevation is unnecessary here: the function
--    is granted exclusively to service_role, which already bypasses
--    RLS when it connects.  Switching to SECURITY INVOKER means the
--    function runs with the caller's own privilege level — if a
--    lower-privilege caller ever gains EXECUTE through a config
--    mistake, the RLS on profiles still protects the data.
-- ──────────────────────────────────────────────────────────────
create or replace function public.reset_screening_count(p_email text)
returns void
language plpgsql
security invoker          -- was: security definer
as $$
begin
  update public.profiles
  set    screenings_used = 0
  where  email = p_email;

  if not found then
    raise exception 'No profile found for email: %', p_email;
  end if;
end;
$$;

-- Re-apply the grant — CREATE OR REPLACE resets privilege grants.
grant execute on function public.reset_screening_count(text) to service_role;

-- ──────────────────────────────────────────────────────────────
-- 5. Verify every table still has RLS enabled (idempotent).
-- ──────────────────────────────────────────────────────────────
alter table public.profiles      enable row level security;
alter table public.properties    enable row level security;
alter table public.applications  enable row level security;
