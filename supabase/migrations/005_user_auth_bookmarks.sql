-- Migration: User auth + bookmarks + premium articles flag
-- Run in Supabase SQL Editor

-- 1. Add is_premium column to articles
alter table public.articles
  add column if not exists is_premium boolean default false;

create index if not exists articles_premium_idx
  on public.articles (is_premium) where is_premium;

-- 2. Bookmarks table (user-article many-to-many)
create table if not exists public.bookmarks (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references auth.users(id) on delete cascade,
  article_id  uuid not null references public.articles(id) on delete cascade,
  created_at  timestamptz default now(),
  unique (user_id, article_id)
);

create index if not exists bookmarks_user_idx on public.bookmarks (user_id, created_at desc);

-- 3. RLS for bookmarks
alter table public.bookmarks enable row level security;

drop policy if exists "users read own bookmarks" on public.bookmarks;
create policy "users read own bookmarks"
  on public.bookmarks for select
  using (auth.uid() = user_id);

drop policy if exists "users insert own bookmarks" on public.bookmarks;
create policy "users insert own bookmarks"
  on public.bookmarks for insert
  with check (auth.uid() = user_id);

drop policy if exists "users delete own bookmarks" on public.bookmarks;
create policy "users delete own bookmarks"
  on public.bookmarks for delete
  using (auth.uid() = user_id);

-- 4. Add newsletter_optin column to profiles (table already created by 004_profiles.sql)
alter table public.profiles add column if not exists newsletter_optin boolean default true;

-- 5. Trigger: on auth.users insert, create profile + auto-subscribe to newsletter
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  -- Insert profile
  insert into public.profiles (id, email, display_name)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'name', split_part(new.email, '@', 1))
  );

  -- Auto-subscribe to mail list (frd's table)
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
