-- Pin a document to a specific hero card on /home (foundation, paradigm, network, pitch-deck, two-pager, gtm-deck).
-- At most one published doc should occupy a slot; the API clears conflicts on assign.

ALTER TABLE public.documents
  ADD COLUMN IF NOT EXISTS home_hero_slot text;

COMMENT ON COLUMN public.documents.home_hero_slot IS 'Hero card id on /home; NULL = not pinned';
