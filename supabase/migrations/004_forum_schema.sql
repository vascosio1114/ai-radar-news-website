-- Migration: Forum tables (threads, thread_comments, thread_likes, comment_likes, bot_settings)
-- Run in Supabase SQL Editor after merging

-- 1. threads
create table if not exists public.threads (
  id              uuid primary key default gen_random_uuid(),
  author_id       uuid references auth.users on delete cascade not null,
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

create policy "Anyone can read threads"
  on public.threads for select using (true);

create policy "Authenticated users can create threads"
  on public.threads for insert with check (auth.uid() = author_id);

create policy "Authors can delete their own threads"
  on public.threads for delete using (auth.uid() = author_id);

-- Indexes for feed queries
create index if not exists idx_threads_author_id on public.threads (author_id);
create index if not exists idx_threads_created_at on public.threads (created_at desc);

-- 2. thread_comments
create table if not exists public.thread_comments (
  id                uuid primary key default gen_random_uuid(),
  thread_id         uuid references public.threads on delete cascade not null,
  parent_comment_id  uuid references public.thread_comments on delete cascade,
  author_id         uuid references auth.users on delete cascade not null,
  content           text not null check (char_length(content) <= 1000),
  is_bot_comment    boolean default false,
  like_count        integer default 0,
  created_at        timestamptz default now()
);

alter table public.thread_comments enable row level security;

create policy "Anyone can read thread comments"
  on public.thread_comments for select using (true);

create policy "Authenticated users can create thread comments"
  on public.thread_comments for insert with check (auth.uid() = author_id);

create policy "Authors can delete their own thread comments"
  on public.thread_comments for delete using (auth.uid() = author_id);

-- Indexes
create index if not exists idx_thread_comments_thread_id on public.thread_comments (thread_id);
create index if not exists idx_thread_comments_parent_comment_id on public.thread_comments (parent_comment_id);
create index if not exists idx_thread_comments_created_at on public.thread_comments (created_at desc);

-- 3. thread_likes
create table if not exists public.thread_likes (
  thread_id   uuid references public.threads on delete cascade not null,
  user_id     uuid references auth.users on delete cascade not null,
  created_at  timestamptz default now(),
  primary key (thread_id, user_id)
);

alter table public.thread_likes enable row level security;

create policy "Anyone can read thread likes"
  on public.thread_likes for select using (true);

create policy "Authenticated users can manage their own thread likes"
  on public.thread_likes for insert with check (auth.uid() = user_id);

create policy "Users can delete their own thread likes"
  on public.thread_likes for delete using (auth.uid() = user_id);

-- 4. comment_likes
create table if not exists public.comment_likes (
  comment_id  uuid references public.thread_comments on delete cascade not null,
  user_id     uuid references auth.users on delete cascade not null,
  created_at  timestamptz default now(),
  primary key (comment_id, user_id)
);

alter table public.comment_likes enable row level security;

create policy "Anyone can read comment likes"
  on public.comment_likes for select using (true);

create policy "Authenticated users can manage their own comment likes"
  on public.comment_likes for insert with check (auth.uid() = user_id);

create policy "Users can delete their own comment likes"
  on public.comment_likes for delete using (auth.uid() = user_id);

-- 5. bot_settings
create table if not exists public.bot_settings (
  id                uuid primary key default gen_random_uuid(),
  enabled           boolean default true,
  daily_post_time   time default '09:00',
  comment_enabled  boolean default true
);

alter table public.bot_settings enable row level security;

-- Only admins can read/write bot_settings
create policy "Only admins can read bot settings"
  on public.bot_settings for select
  using (auth.jwt() ->> 'role' = 'admin');

create policy "Only admins can manage bot settings"
  on public.bot_settings for all
  using (auth.jwt() ->> 'role' = 'admin')
  with check (auth.jwt() ->> 'role' = 'admin');