-- ============================================================
-- TenantIQ Initial Schema
-- ============================================================

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- ============================================================
-- PROFILES (landlords — extends auth.users)
-- ============================================================
create table public.profiles (
  id uuid references auth.users(id) on delete cascade primary key,
  email text unique not null,
  full_name text,
  company_name text,
  subscription_status text not null default 'free', -- 'free' | 'pro'
  stripe_customer_id text unique,
  stripe_subscription_id text unique,
  screenings_used integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

create policy "Users can view own profile"
  on public.profiles for select
  using (auth.uid() = id);

create policy "Users can update own profile"
  on public.profiles for update
  using (auth.uid() = id);

-- Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, full_name)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', '')
  );
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ============================================================
-- PROPERTIES (rental listings with screening links)
-- ============================================================
create table public.properties (
  id uuid primary key default gen_random_uuid(),
  landlord_id uuid not null references public.profiles(id) on delete cascade,
  name text not null,
  address text,
  unit text,
  city text,
  province_state text,
  country text not null default 'CA', -- 'CA' | 'US'
  monthly_rent numeric(10, 2) not null,
  bedrooms integer,
  bathrooms numeric(3, 1),
  screening_token text unique not null,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

alter table public.properties enable row level security;

create policy "Landlords can manage own properties"
  on public.properties for all
  using (auth.uid() = landlord_id);

create policy "Anyone can view active properties by token"
  on public.properties for select
  using (is_active = true);

-- ============================================================
-- APPLICATIONS (tenant submissions)
-- ============================================================
create table public.applications (
  id uuid primary key default gen_random_uuid(),
  property_id uuid not null references public.properties(id) on delete cascade,

  -- Tenant personal info
  full_name text not null,
  email text not null,
  phone text not null,

  -- Employment & income
  monthly_income_reported numeric(10, 2) not null,
  employer_name text not null,
  time_at_job text not null, -- "3 years", "6 months", etc.
  reason_for_moving text not null,

  -- Rental history
  has_evictions boolean not null default false,
  eviction_explanation text,
  has_late_payments boolean not null default false,
  late_payment_explanation text,

  -- References
  reference_1_name text,
  reference_1_relationship text,
  reference_1_phone text,
  reference_2_name text,
  reference_2_relationship text,
  reference_2_phone text,

  -- Income document (stored in Supabase storage)
  income_document_path text,   -- storage path
  income_document_name text,   -- original filename

  -- AI income verification results
  income_verified numeric(10, 2),  -- extracted monthly income from document
  income_document_type text,       -- 'pay_stub' | 'bank_statement' | 'offer_letter' | 'other'
  income_extraction_confidence text, -- 'high' | 'medium' | 'low'
  income_verification_status text,   -- 'verified' | 'unverified' | 'discrepancy' | 'no_document'
  income_verification_notes text,

  -- AI screening results
  score integer,
  score_breakdown jsonb,       -- { income_ratio: {score, max, explanation}, ... }
  red_flags jsonb,             -- string[]
  positive_factors jsonb,      -- string[]
  interview_questions jsonb,   -- string[]
  recommendation text,         -- 'approve' | 'review' | 'decline'
  recommendation_reason text,
  ai_summary text,

  -- Processing status
  status text not null default 'pending', -- 'pending' | 'analyzing' | 'complete' | 'error'
  error_message text,

  created_at timestamptz not null default now(),
  analyzed_at timestamptz
);

alter table public.applications enable row level security;

-- Landlords see applications for their properties
create policy "Landlords can view applications for their properties"
  on public.applications for select
  using (
    exists (
      select 1 from public.properties
      where properties.id = applications.property_id
        and properties.landlord_id = auth.uid()
    )
  );

-- Anyone can insert an application (tenant submitting via public link)
create policy "Anyone can submit an application"
  on public.applications for insert
  with check (true);

-- Service role can update applications (AI analysis)
create policy "Service role can update applications"
  on public.applications for update
  using (true);

-- ============================================================
-- STORAGE BUCKET for income documents
-- ============================================================
insert into storage.buckets (id, name, public)
values ('income-documents', 'income-documents', false)
on conflict do nothing;

-- Landlords can read documents for their properties' applications
create policy "Landlords can read income documents"
  on storage.objects for select
  using (
    bucket_id = 'income-documents'
    and auth.uid() is not null
  );

-- Anyone can upload (tenant submitting)
create policy "Anyone can upload income documents"
  on storage.objects for insert
  with check (bucket_id = 'income-documents');

-- ============================================================
-- HELPER VIEWS
-- ============================================================

-- Application summary view for dashboard
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

-- ============================================================
-- INDEXES
-- ============================================================
create index idx_properties_landlord_id on public.properties(landlord_id);
create index idx_properties_screening_token on public.properties(screening_token);
create index idx_applications_property_id on public.applications(property_id);
create index idx_applications_status on public.applications(status);
create index idx_applications_created_at on public.applications(created_at desc);
create index idx_profiles_stripe_customer on public.profiles(stripe_customer_id);
