create extension if not exists pgcrypto;

create table if not exists public.app_users (
  id uuid primary key default gen_random_uuid(),
  email text not null unique,
  provider text not null default 'email',
  created_at timestamptz not null default now()
);

create table if not exists public.app_sessions (
  token text primary key,
  user_id uuid not null references public.app_users(id) on delete cascade,
  created_at timestamptz not null default now(),
  expires_at timestamptz
);

create table if not exists public.user_profiles (
  user_id uuid primary key references public.app_users(id) on delete cascade,
  profile jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

create table if not exists public.practice_sessions (
  id text primary key,
  user_id uuid not null references public.app_users(id) on delete cascade,
  task_id text not null,
  task_title text,
  category_label text,
  role text,
  expressions jsonb not null default '[]'::jsonb,
  transcript jsonb not null default '[]'::jsonb,
  score_range text,
  repeat_sentences jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists practice_sessions_user_created_idx
  on public.practice_sessions(user_id, created_at desc);

create table if not exists public.assessment_reports (
  session_id text primary key references public.practice_sessions(id) on delete cascade,
  user_id uuid not null references public.app_users(id) on delete cascade,
  report jsonb not null,
  created_at timestamptz not null default now()
);

create table if not exists public.user_memory (
  user_id uuid primary key references public.app_users(id) on delete cascade,
  memory jsonb not null,
  updated_at timestamptz not null default now()
);

create table if not exists public.memory_events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.app_users(id) on delete cascade,
  event_type text not null check (event_type in ('created', 'updated', 'cleared', 'deleted', 'rebuilt')),
  source_session_id text,
  reason text not null,
  created_at timestamptz not null default now()
);

create index if not exists memory_events_user_created_idx
  on public.memory_events(user_id, created_at desc);

create table if not exists public.saved_phrases (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.app_users(id) on delete cascade,
  phrase text not null,
  usage text,
  source_session_id text,
  created_at timestamptz not null default now(),
  unique (user_id, phrase)
);

alter table public.app_users enable row level security;
alter table public.app_sessions enable row level security;
alter table public.user_profiles enable row level security;
alter table public.practice_sessions enable row level security;
alter table public.assessment_reports enable row level security;
alter table public.user_memory enable row level security;
alter table public.memory_events enable row level security;
alter table public.saved_phrases enable row level security;

-- P1 server API uses the service role for all account/memory writes.
-- Public client access stays closed until Supabase Auth UI is enabled.
