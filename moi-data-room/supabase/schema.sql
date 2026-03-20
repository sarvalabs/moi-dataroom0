-- MOI Data Room — Supabase schema
-- Run in Supabase SQL Editor (Dashboard > SQL Editor). Runs in order.

-- ============ STORAGE BUCKET (private) ============
-- Creates bucket "investor-docs". Limit file types/size in app or via Dashboard.
insert into storage.buckets (id, name, public)
values ('investor-docs', 'investor-docs', false)
on conflict (id) do update set public = false;

-- No storage.objects policy = only service_role (bypass RLS) can access. Anon/authenticated denied.

-- ============ EXTENSIONS ============

-- Enable pgvector
create extension if not exists vector;

-- Profiles (extends auth.users)
create table public.profiles (
  id uuid references auth.users on delete cascade primary key,
  email text not null,
  role text not null default 'investor' check (role in ('admin', 'investor', 'analyst', 'pending')),
  full_name text,
  company text,
  access_granted boolean default false,
  created_at timestamptz default now()
);

-- Documents
create table public.documents (
  id uuid default gen_random_uuid() primary key,
  title text not null,
  description text,
  category text not null check (category in ('overview', 'contextual_compute', 'engineering', 'business', 'tokenomics', 'research', 'usecases')),
  file_url text,
  file_type text default 'PDF',
  status text default 'published' check (status in ('published', 'draft', 'restricted')),
  embedding_status text default 'pending' check (embedding_status in ('pending', 'processing', 'completed', 'failed')),
  embedding_error text,
  uploaded_by uuid references public.profiles(id),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Analytics
create table public.analytics (
  id uuid default gen_random_uuid() primary key,
  document_id uuid references public.documents(id) on delete cascade,
  user_id uuid references public.profiles(id) on delete set null,
  action text not null default 'view' check (action in ('view', 'download')),
  viewed_at timestamptz default now()
);

-- Document embeddings for RAG
create table public.document_embeddings (
  id uuid default gen_random_uuid() primary key,
  document_id uuid references public.documents(id) on delete cascade,
  content text not null,
  embedding vector(1536),
  chunk_index integer,
  created_at timestamptz default now()
);

-- Indexes
create index on public.document_embeddings using hnsw (embedding vector_cosine_ops);
create index on public.analytics (document_id);
create index on public.analytics (user_id);

-- RLS
alter table public.profiles enable row level security;
alter table public.documents enable row level security;
alter table public.analytics enable row level security;
alter table public.document_embeddings enable row level security;

-- Profiles
create policy "Users read own profile" on public.profiles for select using (auth.uid() = id);
create policy "Admins read all profiles" on public.profiles for select using (
  exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
);
create policy "Admins update profiles" on public.profiles for update using (
  exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
);

-- Documents
create policy "Investors read published docs" on public.documents for select using (
  status = 'published' and exists (
    select 1 from public.profiles where id = auth.uid() and access_granted = true
  )
);
create policy "Admins full access docs" on public.documents for all using (
  exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
);

-- Analytics
create policy "Users insert own analytics" on public.analytics for insert with check (auth.uid() = user_id);
create policy "Admins read analytics" on public.analytics for select using (
  exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
);

-- Embeddings
create policy "Authenticated read embeddings" on public.document_embeddings for select using (auth.role() = 'authenticated');

-- Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, role, access_granted)
  values (new.id, new.email, 'pending', false);
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- RPC for RAG: match document embeddings by cosine similarity
create or replace function public.match_document_embeddings(
  query_embedding vector(1536),
  match_count int default 10
)
returns table (id uuid, document_id uuid, content text, chunk_index int, similarity float, document_title text)
language plpgsql
security definer
set search_path = public
as $$
begin
  return query
  select
    de.id,
    de.document_id,
    de.content,
    de.chunk_index,
    1 - (de.embedding <=> query_embedding) as similarity,
    d.title as document_title
  from public.document_embeddings de
  join public.documents d on d.id = de.document_id
  where de.embedding is not null
  order by de.embedding <=> query_embedding
  limit match_count;
end;
$$;
