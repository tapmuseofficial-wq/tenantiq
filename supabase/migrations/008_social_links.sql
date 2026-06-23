-- ============================================================
-- 008_social_links.sql — Tenant-supplied social profile links
-- ============================================================
-- Run in Supabase → SQL Editor.
-- ============================================================

-- Raw links the tenant pasted into the form (one URL per line, stored as text)
alter table public.applications
  add column if not exists social_links text;

-- Claude's structured analysis of the fetched content (null until analyzed)
alter table public.applications
  add column if not exists social_media_analysis jsonb;
