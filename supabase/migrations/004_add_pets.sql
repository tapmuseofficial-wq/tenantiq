alter table public.applications
  add column if not exists has_pets boolean not null default false,
  add column if not exists pet_details text;
