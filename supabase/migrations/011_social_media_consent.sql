-- ============================================================
-- 011_social_media_consent.sql
-- Replaces free-text social link input with a consent flag.
-- Run in Supabase → SQL Editor.
-- ============================================================

alter table public.applications
  add column if not exists social_media_consent boolean not null default false;
