-- Stabilize admin permissions and Auth/Profile sync.
-- Admin is accepted from either:
-- 1) auth.users.raw_app_meta_data.role = 'admin' (recommended), or
-- 2) public.profiles.is_admin = true (managed by /admin/users).

alter table public.profiles
  add column if not exists is_admin boolean not null default false;

create index if not exists profiles_is_admin_idx
  on public.profiles (is_admin)
  where is_admin = true;

-- Backfill profiles for Auth users that were created before the profile trigger existed.
insert into public.profiles (id, email, display_name, avatar_url, is_admin)
select
  u.id,
  u.email,
  coalesce(u.raw_user_meta_data->>'name', u.raw_user_meta_data->>'full_name', split_part(u.email, '@', 1)),
  u.raw_user_meta_data->>'avatar_url',
  coalesce((u.raw_app_meta_data->>'role') = 'admin', false)
from auth.users u
where u.email is not null
on conflict (id) do update
set
  email = excluded.email,
  display_name = coalesce(public.profiles.display_name, excluded.display_name),
  avatar_url = coalesce(public.profiles.avatar_url, excluded.avatar_url),
  is_admin = public.profiles.is_admin or excluded.is_admin,
  updated_at = now();

-- Make sure future signups always get a matching profile row.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, display_name, avatar_url, is_admin)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'name', new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)),
    new.raw_user_meta_data->>'avatar_url',
    coalesce((new.raw_app_meta_data->>'role') = 'admin', false)
  )
  on conflict (id) do update
  set
    email = excluded.email,
    display_name = coalesce(public.profiles.display_name, excluded.display_name),
    avatar_url = coalesce(public.profiles.avatar_url, excluded.avatar_url),
    is_admin = public.profiles.is_admin or excluded.is_admin,
    updated_at = now();

  insert into public.mail_subscribers (email, opted_in, is_confirmed, subscribed_at)
  values (new.email, true, true, now())
  on conflict (email) do update
  set opted_in = true, is_confirmed = true;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
