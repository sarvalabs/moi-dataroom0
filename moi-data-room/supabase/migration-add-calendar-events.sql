-- Calendar events (public read via API; writes require admin)
create table public.calendar_events (
  id uuid default gen_random_uuid() primary key,
  title text not null,
  start_date date not null,
  end_date date,
  description text,
  href text,
  location text,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  constraint calendar_events_end_after_start check (
    end_date is null or end_date >= start_date
  )
);

create index calendar_events_start_date_idx on public.calendar_events (start_date);

alter table public.calendar_events enable row level security;
