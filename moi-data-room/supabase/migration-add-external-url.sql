-- External links (e.g. Zenodo) alongside uploaded files in storage.
-- Run in Supabase SQL Editor if the documents table already exists.

ALTER TABLE public.documents
  ADD COLUMN IF NOT EXISTS external_url text;

COMMENT ON COLUMN public.documents.external_url IS
  'Public HTTPS URL to open in a new tab (e.g. Zenodo). When set, file_url may be null.';
