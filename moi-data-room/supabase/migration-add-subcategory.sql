-- Add subcategory column to documents
ALTER TABLE public.documents ADD COLUMN IF NOT EXISTS subcategory text;
