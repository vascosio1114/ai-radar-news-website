-- Migration: Forum / Community Feature
-- Run in Supabase SQL Editor after merging
-- Note: Down migrations are not provided for this file.

-- 1. threads
create table if not exists public.threads (
  id              uuid primary key default gen_random_uuid(),
  author_id       uuid references auth.users(id) on delete cascade,
  content         text not null check (char_length(content) <= 2000),
  image_url       text,
  link_url        text,
  link_title      text,
  link_description text,
  link_image      text,
  is_bot_post     boolean default false,
  like_count      integer default 0,
  comment_count   integer default 0,
  created_at      timestamptz default now()
);

alter table public.threads enable row level security;

-- Anyone can read threads
create policy "Anyone can read threads"
  on public.threads for select
  using (true);

-- Authenticated users can create threads
create policy "Authenticated users can create threads"
  on public.threads for insert
  with check (auth.role() = 'authenticated');

-- Authors can delete their own threads
create policy "Authors can delete their own threads"
  on public.threads for delete
  using (auth.uid() = author_id);

-- 2. thread_comments
create table if not exists public.thread_comments (
  id                uuid primary key default gen_random_uuid(),
  thread_id         uuid references public.threads(id) on delete cascade,
  parent_comment_id uuid references public.thread_comments(id) on delete cascade,
  author_id         uuid references auth.users(id) on delete cascade,
  content           text not null check (char_length(content) <= 1000),
  is_bot_comment    boolean default false,
  like_count        integer default 0,
  created_at        timestamptz default now()
);

alter table public.thread_comments enable row level security;

-- Anyone can read comments
create policy "Anyone can read thread_comments"
  on public.thread_comments for select
  using (true);

-- Authenticated users can create comments
create policy "Authenticated users can create thread_comments"
  on public.thread_comments for insert
  with check (auth.role() = 'authenticated');

-- Authors can delete their own comments
create policy "Authors can delete their own thread_comments"
  on public.thread_comments for delete
  using (auth.uid() = author_id);

-- 3. thread_likes
create table if not exists public.thread_likes (
  thread_id  uuid references public.threads(id) on delete cascade,
  user_id    uuid references auth.users(id) on delete cascade,
  created_at timestamptz default now(),
  primary key (thread_id, user_id)
);

alter table public.thread_likes enable row level security;

-- Anyone can read likes
create policy "Anyone can read thread_likes"
  on public.thread_likes for select
  using (true);

-- Authenticated users can insert/delete their own likes
create policy "Authenticated users can manage own thread_likes"
  on public.thread_likes for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- 4. comment_likes
create table if not exists public.comment_likes (
  comment_id uuid references public.thread_comments(id) on delete cascade,
  user_id    uuid references auth.users(id) on delete cascade,
  created_at timestamptz default now(),
  primary key (comment_id, user_id)
);

alter table public.comment_likes enable row level security;

-- Anyone can read likes
create policy "Anyone can read comment_likes"
  on public.comment_likes for select
  using (true);

-- Authenticated users can insert/delete their own likes
create policy "Authenticated users can manage own comment_likes"
  on public.comment_likes for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- 5. bot_settings
create table if not exists public.bot_settings (
  id               uuid primary key default gen_random_uuid(),
  enabled          boolean default true,
  daily_post_time  time default '09:00',
  comment_enabled  boolean default true
);

alter table public.bot_settings enable row level security;

-- Only authenticated users can read bot_settings
create policy "Authenticated users can read bot_settings"
  on public.bot_settings for select
  using (auth.role() = 'authenticated');

-- Only admins can modify bot_settings
create policy "Admins can manage bot_settings"
  on public.bot_settings for all
  using (auth.jwt() ->> 'role' = 'admin')
  with check (auth.jwt() ->> 'role' = 'admin');

-- Insert default bot settings with fixed UUID (idempotent)
insert into public.bot_settings (id, enabled, daily_post_time, comment_enabled)
values ('00000000-0000-0000-0000-000000000001', true, '09:00', true)
on conflict (id) do nothing;

-- 6. Storage bucket for thread images
insert into storage.buckets (id, name, public)
values ('thread-images', 'thread-images', true)
on conflict do nothing;

-- Storage policies for thread-images bucket
create policy "Anyone can view thread images"
  on storage.objects for select
  using (bucket_id = 'thread-images');

create policy "Authenticated users can upload thread images"
  on storage.objects for insert
  with check (bucket_id = 'thread-images' and auth.role() = 'authenticated');

create policy "Users can delete their own thread images"
  on storage.objects for delete
  using (bucket_id = 'thread-images' and auth.uid()::text = (storage.foldername(name))[1]);

-- 7. Indexes for performance
create index if not exists threads_author_id_idx on public.threads(author_id);
create index if not exists threads_created_at_idx on public.threads(created_at desc);
create index if not exists thread_comments_thread_id_idx on public.thread_comments(thread_id);
create index if not exists thread_comments_parent_comment_id_idx on public.thread_comments(parent_comment_id);
-- Note: thread_likes_user_id_idx and comment_likes_user_id_idx omitted;
-- the composite PKs (thread_id, user_id) and (comment_id, user_id) already index user_id.

-- 8. RPC functions for atomic like count updates (not exposed via RLS to avoid permission errors)
create or replace function public.increment_like_count(thread_id uuid, increment integer default 1)
returns void as $$
  update public.threads set like_count = like_count + increment where id = thread_id;
$$ language sql security definer;

create or replace function public.decrement_like_count(thread_id uuid, decrement integer default 1)
returns void as $$
  update public.threads set like_count = greatest(like_count - decrement, 0) where id = thread_id;
$$ language sql security definer;

create or replace function public.increment_comment_count(thread_id uuid)
returns void as $$
  update public.threads set comment_count = comment_count + 1 where id = thread_id;
$$ language sql security definer;

create or replace function public.increment_comment_like_count(comment_id uuid, increment integer default 1)
returns void as $$
  update public.thread_comments set like_count = like_count + increment where id = comment_id;
$$ language sql security definer;

create or replace function public.decrement_comment_like_count(comment_id uuid, decrement integer default 1)
returns void as $$
  update public.thread_comments set like_count = greatest(like_count - decrement, 0) where id = comment_id;
$$ language sql security definer;