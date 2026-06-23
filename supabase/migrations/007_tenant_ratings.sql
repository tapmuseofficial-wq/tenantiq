-- ============================================================
-- 007_tenant_ratings.sql — Community tenant history database
-- ============================================================
-- Run in Supabase → SQL Editor.  All statements are idempotent.
-- ============================================================


-- ── tenant_ratings table ─────────────────────────────────────
create table if not exists public.tenant_ratings (
  id                      uuid        primary key default gen_random_uuid(),
  reported_by_landlord_id uuid        not null references public.profiles(id) on delete cascade,

  -- Tenant identity (used for cross-landlord matching)
  tenant_full_name        text        not null,
  tenant_email            text,                        -- stored lowercase-trimmed
  tenant_phone            text,                        -- stored as-entered
  tenant_phone_normalized text,                        -- stripped of spaces/dashes/brackets for matching

  -- The rating
  rating                  text        not null check (rating in ('positive', 'negative')),
  description             text,                        -- required for negative, optional for positive

  -- Tenancy context (optional, for display)
  tenancy_start_date      date,
  tenancy_end_date        date,
  property_address        text,

  -- Audit trail
  ip_address              text,
  created_at              timestamptz not null default now(),

  -- Links back to the application that triggered the rating (nullable)
  application_id          uuid        references public.applications(id) on delete set null,

  -- Dispute state
  is_disputed             boolean     not null default false,
  dispute_flags           integer     not null default 0,   -- auto-hidden at 3
  dispute_reason          text,
  dispute_submitted_at    timestamptz
);

alter table public.tenant_ratings enable row level security;

-- Landlords can see and manage their own ratings
create policy "Landlords can view own ratings"
  on public.tenant_ratings for select
  using (auth.uid() = reported_by_landlord_id);

create policy "Landlords can insert ratings"
  on public.tenant_ratings for insert
  with check (auth.uid() = reported_by_landlord_id);

-- Landlords can update dispute state on any rating (for flagging inaccuracies)
create policy "Landlords can flag ratings"
  on public.tenant_ratings for update
  using (auth.uid() is not null)
  with check (auth.uid() is not null);

-- Indexes for matching queries
create index if not exists idx_tenant_ratings_email
  on public.tenant_ratings(tenant_email);

create index if not exists idx_tenant_ratings_phone_normalized
  on public.tenant_ratings(tenant_phone_normalized);

create index if not exists idx_tenant_ratings_full_name
  on public.tenant_ratings(lower(tenant_full_name));

create index if not exists idx_tenant_ratings_landlord
  on public.tenant_ratings(reported_by_landlord_id);

create index if not exists idx_tenant_ratings_application
  on public.tenant_ratings(application_id);


-- ── Extend applications table ─────────────────────────────────
-- community_history: matched ratings found at analysis time (JSONB snapshot)
alter table public.applications
  add column if not exists community_history jsonb;

-- is_rated: whether the landlord has submitted a rating for this applicant
alter table public.applications
  add column if not exists is_rated boolean not null default false;


-- ── Extend properties table for city-based name matching ──────
-- city already exists on properties from the initial schema.
-- No change needed.


-- ── Summary ───────────────────────────────────────────────────
--
-- TABLE: tenant_ratings
--   INSERT  → authenticated landlord, own report only
--   SELECT  → authenticated landlord, own reports only
--   UPDATE  → any authenticated landlord (for dispute flagging)
--   DELETE  → blocked (service role only — for moderation)
--   Service role bypasses RLS for cross-landlord matching during analysis.
--
-- TABLE: applications (new columns)
--   community_history  jsonb    — snapshot of matched community ratings
--   is_rated           boolean  — whether landlord submitted a rating
-- ============================================================
