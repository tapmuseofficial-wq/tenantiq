-- Add dedicated text column for storing the plain-text public records
-- check result so it can be displayed directly on the applicant page
-- without having to parse the social_media_analysis JSONB.

ALTER TABLE public.applications
  ADD COLUMN IF NOT EXISTS public_records_result TEXT;
