alter table public.profiles
  drop constraint if exists profiles_plan_check;

alter table public.profiles
  add constraint profiles_plan_check
  check (plan in ('free', 'basic', 'pro', 'lifetime'));

alter table public.subscriptions
  drop constraint if exists subscriptions_plan_check;

alter table public.subscriptions
  add constraint subscriptions_plan_check
  check (plan in ('basic', 'pro', 'lifetime'));

alter table public.profiles
  alter column uses_remaining set default 3;
