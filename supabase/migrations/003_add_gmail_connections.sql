create table if not exists public.gmail_connections (
  id                      uuid primary key default uuid_generate_v4(),
  user_id                 uuid not null unique references auth.users(id) on delete cascade,
  google_email            text not null,
  google_name             text,
  encrypted_refresh_token text not null,
  scopes                  text,
  created_at              timestamptz not null default now(),
  updated_at              timestamptz not null default now()
);

alter table public.gmail_connections enable row level security;

-- No client-side policies on purpose: only the service role should read/write refresh tokens.

