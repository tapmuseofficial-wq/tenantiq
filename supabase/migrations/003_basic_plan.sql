-- Add screening_credits column for Basic plan (one-time purchase)
alter table public.profiles
  add column if not exists screening_credits integer not null default 0;

comment on column public.profiles.subscription_status is 'free | basic';
comment on column public.profiles.screening_credits is 'Remaining credits for Basic plan users (10 per purchase, decremented per screening)';
