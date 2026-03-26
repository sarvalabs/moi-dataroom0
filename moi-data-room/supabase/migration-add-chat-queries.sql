-- Track chatbot questions for analytics
create table if not exists public.chat_queries (
  id uuid default gen_random_uuid() primary key,
  question text not null,
  chunks_found integer default 0,
  created_at timestamptz default now()
);

-- No RLS needed — only service_role writes to this table
alter table public.chat_queries enable row level security;

-- Allow service_role full access (bypass RLS anyway), but add a policy for admin reads
create policy "Service role full access" on public.chat_queries for all using (true);
