-- Records three objects that were created by hand in the production database
-- before this file existed: the adopters table, the document_leads table and
-- the documents.require_email column. Every statement is idempotent, so running
-- this file against production changes nothing; a fresh database gets the
-- objects the code expects.
--
-- Run by hand in the Supabase SQL editor, like every other migration here.

create table if not exists public.adopters (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text,
  link text,
  type text not null default 'business' check (type in ('business', 'dapp')),
  created_at timestamptz not null default now()
);

create table if not exists public.document_leads (
  id uuid primary key default gen_random_uuid(),
  document_id uuid references public.documents (id) on delete cascade,
  email text not null,
  ip_address text,
  created_at timestamptz not null default now()
);

create index if not exists document_leads_document_id_idx on public.document_leads (document_id);

alter table public.documents
  add column if not exists require_email boolean not null default false;

-- The private storage bucket "investor-docs" holds the files. It was created in
-- the Supabase dashboard (Storage, New bucket, private) and is not a SQL object.
