create table if not exists public.rate_limits (
  identifier text not null,
  tier text not null,
  count integer not null default 0,
  reset_at timestamptz not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key (identifier, tier)
);

create index if not exists rate_limits_reset_at_idx on public.rate_limits (reset_at);
create index if not exists rate_limits_updated_at_idx on public.rate_limits (updated_at);

alter table public.rate_limits enable row level security;

create or replace function public.consume_rate_limit(
  p_identifier text,
  p_tier text,
  p_limit integer,
  p_window_seconds integer
)
returns table (
  allowed boolean,
  remaining integer,
  reset_at timestamptz
)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_count integer;
  v_reset_at timestamptz;
begin
  if p_limit <= 0 then
    raise exception 'p_limit must be greater than 0';
  end if;

  if p_window_seconds <= 0 then
    raise exception 'p_window_seconds must be greater than 0';
  end if;

  insert into public.rate_limits as rl (identifier, tier, count, reset_at)
  values (
    coalesce(nullif(trim(p_identifier), ''), 'anonymous'),
    coalesce(nullif(trim(p_tier), ''), 'api'),
    1,
    now() + make_interval(secs => p_window_seconds)
  )
  on conflict (identifier, tier) do update
  set
    count = case
      when rl.reset_at <= now() then 1
      else rl.count + 1
    end,
    reset_at = case
      when rl.reset_at <= now() then now() + make_interval(secs => p_window_seconds)
      else rl.reset_at
    end,
    updated_at = now()
  returning count, reset_at into v_count, v_reset_at;

  if random() < 0.01 then
    delete from public.rate_limits
    where updated_at < now() - interval '7 days';
  end if;

  allowed := v_count <= p_limit;
  remaining := greatest(p_limit - least(v_count, p_limit), 0);
  reset_at := v_reset_at;

  return next;
end;
$$;
