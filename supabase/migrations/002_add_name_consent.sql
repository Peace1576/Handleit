-- Add display_name and marketing_consent to profiles (run if you already applied 001)
alter table public.profiles
  add column if not exists display_name      text,
  add column if not exists marketing_consent boolean not null default false;

-- Update trigger to capture name + consent from signup metadata
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
