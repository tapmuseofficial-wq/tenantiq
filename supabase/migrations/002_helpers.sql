-- ============================================================
-- TenantIQ Helper Functions & Test Overrides
-- ============================================================

-- Reset a landlord's screening count by email.
-- Run from the Supabase SQL editor:
--   SELECT reset_screening_count('landlord@example.com');
create or replace function public.reset_screening_count(p_email text)
returns void
language plpgsql
security definer
as $$
begin
  update public.profiles
  set screenings_used = 0
  where email = p_email;

  if not found then
    raise exception 'No profile found for email: %', p_email;
  end if;
end;
$$;

-- Grant execution to authenticated and service roles
grant execute on function public.reset_screening_count(text) to service_role;

-- ============================================================
-- Configure income-documents bucket: 10MB limit, PDF/JPG/PNG only
-- ============================================================
update storage.buckets
set
  file_size_limit  = 10485760,  -- 10MB in bytes
  allowed_mime_types = array['application/pdf', 'image/jpeg', 'image/png']
where id = 'income-documents';

-- ============================================================
-- Give the test account an effectively unlimited free quota
-- so it can screen without hitting the 3-screening cap.
-- ============================================================
update public.profiles
set screenings_used = 0
where email = 'rhehrj262@gmail.com';
