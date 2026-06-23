-- ============================================================
-- 009_ensure_columns.sql
-- Idempotent — safe to run even if individual migrations from
-- 004, 007, 008 were already applied.  Run this in Supabase →
-- SQL Editor if applications are failing to save.
-- ============================================================

-- From 004_add_pets.sql
alter table public.applications
  add column if not exists has_pets  boolean not null default false,
  add column if not exists pet_details text;

-- From 007_tenant_ratings.sql
alter table public.applications
  add column if not exists community_history    jsonb,
  add column if not exists is_rated            boolean not null default false;

-- From 008_social_links.sql
alter table public.applications
  add column if not exists social_links          text,
  add column if not exists social_media_analysis jsonb;

-- tenant_ratings table (from 007) — create if missing
create table if not exists public.tenant_ratings (
  id                      uuid        primary key default gen_random_uuid(),
  reported_by_landlord_id uuid        not null references public.profiles(id) on delete cascade,
  tenant_full_name        text        not null,
  tenant_email            text,
  tenant_phone            text,
  tenant_phone_normalized text,
  rating                  text        not null check (rating in ('positive', 'negative')),
  description             text,
  tenancy_start_date      date,
  tenancy_end_date        date,
  property_address        text,
  ip_address              text,
  created_at              timestamptz not null default now(),
  application_id          uuid        references public.applications(id) on delete set null,
  is_disputed             boolean     not null default false,
  dispute_flags           integer     not null default 0,
  dispute_reason          text,
  dispute_submitted_at    timestamptz
);

alter table public.tenant_ratings enable row level security;

-- Policies are idempotent via "if not exists" equivalent (create or replace not available for policies,
-- so we drop-and-recreate safely)
do $$ begin
  if not exists (
    select 1 from pg_policies
    where tablename = 'tenant_ratings' and policyname = 'Landlords can view own ratings'
  ) then
    execute $p$
      create policy "Landlords can view own ratings"
        on public.tenant_ratings for select
        using (auth.uid() = reported_by_landlord_id)
    $p$;
  end if;
end $$;

do $$ begin
  if not exists (
    select 1 from pg_policies
    where tablename = 'tenant_ratings' and policyname = 'Landlords can insert ratings'
  ) then
    execute $p$
      create policy "Landlords can insert ratings"
        on public.tenant_ratings for insert
        with check (auth.uid() = reported_by_landlord_id)
    $p$;
  end if;
end $$;

do $$ begin
  if not exists (
    select 1 from pg_policies
    where tablename = 'tenant_ratings' and policyname = 'Landlords can flag ratings'
  ) then
    execute $p$
      create policy "Landlords can flag ratings"
        on public.tenant_ratings for update
        using (auth.uid() is not null)
        with check (auth.uid() is not null)
    $p$;
  end if;
end $$;

create index if not exists idx_tenant_ratings_email
  on public.tenant_ratings(tenant_email);
create index if not exists idx_tenant_ratings_phone_normalized
  on public.tenant_ratings(tenant_phone_normalized);
create index if not exists idx_tenant_ratings_landlord
  on public.tenant_ratings(reported_by_landlord_id);
