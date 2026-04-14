-- HandleIt initial schema — safe to re-run (uses IF NOT EXISTS + DROP/CREATE for policies)

create extension if not exists "uuid-ossp";

-- ── Tables ──────────────────────────────────────────────────────────────────

create table if not exists public.profiles (
  id                 uuid primary key default uuid_generate_v4(),
  user_id            uuid not null unique references auth.users(id) on delete cascade,
  display_name       text,
  plan               text not null default 'free' check (plan in ('free','pro','lifetime')),
  uses_remaining     int  not null default 3,
  stripe_customer_id text unique,
  marketing_consent  boolean not null default false,
  created_at         timestamptz not null default now(),
  updated_at         timestamptz not null default now()
);

-- add columns if table already existed without them
alter table public.profiles add column if not exists display_name      text;
alter table public.profiles add column if not exists marketing_consent boolean not null default false;

create table if not exists public.usage_logs (
  id         uuid primary key default uuid_generate_v4(),
  user_id    uuid not null references auth.users(id) on delete cascade,
  tool_id    text not null check (tool_id in ('form','letter','reply')),
  created_at timestamptz not null default now()
);

create table if not exists public.saved_results (
  id          uuid primary key default uuid_generate_v4(),
  user_id     uuid not null references auth.users(id) on delete cascade,
  tool_id     text not null check (tool_id in ('form','letter','reply')),
  input_text  text not null,
  result_text text not null,
  created_at  timestamptz not null default now()
);

create table if not exists public.subscriptions (
  id                     uuid primary key default uuid_generate_v4(),
  user_id                uuid not null references auth.users(id) on delete cascade,
  stripe_subscription_id text unique,
  status                 text not null,
  plan                   text not null check (plan in ('pro','lifetime')),
  current_period_end     timestamptz,
  created_at             timestamptz not null default now(),
  updated_at             timestamptz not null default now()
);

-- ── Trigger: auto-create profile on signup ───────────────────────────────────

create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (user_id, display_name, marketing_consent)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'name', null),
    coalesce((new.raw_user_meta_data->>'marketing_consent')::boolean, false)
  )
  on conflict (user_id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ── Row Level Security ───────────────────────────────────────────────────────

alter table public.profiles      enable row level security;
alter table public.usage_logs    enable row level security;
alter table public.saved_results enable row level security;
alter table public.subscriptions enable row level security;

-- Drop policies before recreating (safe on re-run)
drop policy if exists "own profile select"  on public.profiles;
drop policy if exists "own profile update"  on public.profiles;
drop policy if exists "own usage select"    on public.usage_logs;
drop policy if exists "own usage insert"    on public.usage_logs;
drop policy if exists "own results all"     on public.saved_results;
drop policy if exists "own subs select"     on public.subscriptions;

create policy "own profile select"  on public.profiles      for select using (auth.uid() = user_id);
create policy "own profile update"  on public.profiles      for update using (auth.uid() = user_id);
create policy "own usage select"    on public.usage_logs    for select using (auth.uid() = user_id);
create policy "own usage insert"    on public.usage_logs    for insert with check (auth.uid() = user_id);
create policy "own results all"     on public.saved_results for all    using (auth.uid() = user_id);
create policy "own subs select"     on public.subscriptions for select using (auth.uid() = user_id);
