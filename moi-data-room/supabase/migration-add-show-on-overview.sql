-- Add show_on_overview flag so docs can be linked to the home page
-- while still belonging to a specific sub-tab category.
ALTER TABLE public.documents
  ADD COLUMN IF NOT EXISTS show_on_overview boolean NOT NULL DEFAULT false;

-- Migrate existing "overview" docs: flag them for the home page.
-- NOTE: After running this migration, manually re-categorize these docs
-- to their correct sub-tab via the admin panel (they still have category='overview').
UPDATE public.documents
  SET show_on_overview = true
  WHERE category = 'overview';
