-- ============================================================
-- 006_rls_hardening.sql — RLS completeness audit & hardening
-- ============================================================
-- Run in the Supabase SQL editor (Dashboard → SQL Editor).
-- All statements are idempotent: safe to re-run.
-- ============================================================


-- ──────────────────────────────────────────────────────────────
-- SECTION 1: PROPERTIES — remove over-permissive SELECT policy
--
-- PROBLEM (MEDIUM severity):
--   "Anyone can view active properties by token" used:
--     using (is_active = true)
--   This allowed ANY holder of the public anon key to query
--   the Supabase REST API and enumerate ALL active properties
--   across all landlords:
--     GET /rest/v1/properties?is_active=eq.true
--   This leaks property names, addresses, monthly rents, and
--   landlord UUIDs to unauthenticated third parties.
--
-- WHY IT'S SAFE TO REMOVE:
--   The only place that needs to read a property without a
--   landlord session is the public /apply/[token] page.
--   That page uses createServiceClient() which sends the
--   service_role key — the service role bypasses RLS entirely,
--   so no SELECT policy is needed for it to work.
--
-- AFTER: only landlords can SELECT their own properties.
--   Unauthenticated/anon REST API calls return 0 rows.
-- ──────────────────────────────────────────────────────────────
drop policy if exists "Anyone can view active properties by token" on public.properties;


-- ──────────────────────────────────────────────────────────────
-- SECTION 2: PROFILES — verify all required policies exist
--
-- SELECT: ✓  "Users can view own profile"
--            using (auth.uid() = id)
--
-- UPDATE: ✓  "Users can update own profile"
--            using (auth.uid() = id)
--
-- INSERT: No explicit policy — correct.
--   RLS enabled + no INSERT policy = INSERT denied for
--   anon/authenticated roles. The only legitimate INSERT
--   is via the handle_new_user() trigger which runs as
--   SECURITY DEFINER (postgres role, bypasses RLS).
--
-- DELETE: No explicit policy — correct.
--   Deleting a profile cascades to all properties and
--   applications. We do not allow self-deletion from the
--   client; account deletion must go through a support
--   workflow so we can handle Stripe/data cleanup properly.
--
-- Re-assert RLS is enabled (idempotent):
-- ──────────────────────────────────────────────────────────────
alter table public.profiles enable row level security;

-- Ensure service_role is never blocked by RLS on profiles
-- (service role bypasses RLS by default in Supabase, but
-- making it explicit via a policy is clearer for audits):
drop policy if exists "Service role bypass on profiles" on public.profiles;

create policy "Service role bypass on profiles"
  on public.profiles
  for all
  using (auth.jwt() ->> 'role' = 'service_role')
  with check (auth.jwt() ->> 'role' = 'service_role');


-- ──────────────────────────────────────────────────────────────
-- SECTION 3: PROPERTIES — verify all required policies exist
--
-- ALL (SELECT/INSERT/UPDATE/DELETE) for owner:
--   ✓ "Landlords can manage own properties"
--     using (auth.uid() = landlord_id)
--   PostgreSQL applies the using clause as WITH CHECK for
--   INSERT, so a client cannot insert a property with
--   landlord_id = someone_else's_id.
--
-- Re-assert RLS is enabled (idempotent):
-- ──────────────────────────────────────────────────────────────
alter table public.properties enable row level security;


-- ──────────────────────────────────────────────────────────────
-- SECTION 4: APPLICATIONS — verify all required policies exist
--
-- SELECT: ✓ "Landlords can view applications for their properties"
--   Joins through properties to verify landlord_id = auth.uid()
--
-- INSERT: ✓ "Anyone can submit an application for an active property" (from 005)
--   WITH CHECK verifies property.is_active = true
--
-- UPDATE: No client-facing UPDATE policy — correct.
--   Only the service role (runAnalysis) updates applications.
--   The service role bypasses RLS, so no explicit policy needed.
--   The old over-permissive "Service role can update applications"
--   was dropped in migration 005.
--
-- DELETE: No explicit policy — correct.
--   Applications should not be deletable from the client.
--   If needed in future, a landlord-scoped DELETE policy can
--   be added via a new migration.
--
-- Re-assert RLS is enabled (idempotent):
-- ──────────────────────────────────────────────────────────────
alter table public.applications enable row level security;


-- ──────────────────────────────────────────────────────────────
-- SECTION 5: STORAGE — verify income-documents policies
--
-- SELECT: ✓ "Landlords can read own income documents" (from 005)
--   Joins through applications → properties to verify ownership.
--
-- INSERT: "Anyone can upload income documents"
--   with check (bucket_id = 'income-documents')
--   This is intentional — tenants submit documents without a
--   session. The API route validates file type/size before
--   calling storage.upload(), so the RLS policy is the last
--   line of defence for bucket membership only.
--
-- UPDATE/DELETE: No policies — correct.
--   Documents should be immutable once uploaded.
--   Deletion can only happen via the service role.
-- ──────────────────────────────────────────────────────────────


-- ──────────────────────────────────────────────────────────────
-- SECTION 6: application_summaries VIEW — verify security invoker
--
-- The view is defined with (security_invoker = true), which means
-- queries against the view run under the CALLER's RLS context,
-- not the definer's. A landlord querying the view will only see
-- rows that their session's RLS policies on applications and
-- properties allow.
--
-- This is already set in 001_initial_schema.sql. Verify here:
-- ──────────────────────────────────────────────────────────────
create or replace view public.application_summaries
  with (security_invoker = true)
as
select
  a.id,
  a.property_id,
  a.full_name,
  a.email,
  a.phone,
  a.monthly_income_reported,
  a.income_verified,
  a.income_verification_status,
  a.score,
  a.recommendation,
  a.status,
  a.has_evictions,
  a.has_late_payments,
  a.created_at,
  p.name as property_name,
  p.monthly_rent,
  p.landlord_id,
  case
    when a.income_verified is not null then a.income_verified / nullif(p.monthly_rent, 0)
    else a.monthly_income_reported / nullif(p.monthly_rent, 0)
  end as income_ratio
from public.applications a
join public.properties p on p.id = a.property_id;


-- ──────────────────────────────────────────────────────────────
-- COMPLETE POLICY REFERENCE (post-migration state)
-- ──────────────────────────────────────────────────────────────
--
-- TABLE: profiles
--   SELECT  → "Users can view own profile"              auth.uid() = id
--   INSERT  → (none — blocked; trigger handles creation)
--   UPDATE  → "Users can update own profile"            auth.uid() = id
--   DELETE  → (none — blocked; requires support flow)
--   ALL     → "Service role bypass on profiles"         jwt role = service_role
--
-- TABLE: properties
--   ALL     → "Landlords can manage own properties"     auth.uid() = landlord_id
--   SELECT  → (public anonymous policy REMOVED — only landlords & service role)
--
-- TABLE: applications
--   SELECT  → "Landlords can view applications for their properties"
--               JOIN properties WHERE landlord_id = auth.uid()
--   INSERT  → "Anyone can submit an application for an active property"
--               WITH CHECK property.is_active = true
--   UPDATE  → (none — only service role, which bypasses RLS)
--   DELETE  → (none — blocked)
--
-- storage.objects (income-documents bucket)
--   SELECT  → "Landlords can read own income documents"
--               JOIN applications → properties WHERE landlord_id = auth.uid()
--   INSERT  → "Anyone can upload income documents"
--               WITH CHECK bucket_id = 'income-documents'
--   UPDATE  → (none — immutable)
--   DELETE  → (none — service role only)
-- ──────────────────────────────────────────────────────────────
