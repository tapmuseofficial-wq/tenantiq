-- ============================================================
-- 010_certn_background_check.sql
-- Adds Certn background check fields to applications table.
-- Run in Supabase → SQL Editor.
-- ============================================================

alter table public.applications
  add column if not exists certn_case_id                text,
  add column if not exists certn_status                 text,   -- 'pending' | 'complete' | 'failed'
  add column if not exists certn_report                 jsonb,
  add column if not exists background_check_requested_at timestamptz;

create index if not exists idx_applications_certn_case_id
  on public.applications(certn_case_id)
  where certn_case_id is not null;
