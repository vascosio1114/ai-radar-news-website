-- ============================================================
-- AI Radar — Full Schema Migration (consolidated, idempotent)
-- Run once in Supabase SQL Editor (Dashboard → SQL Editor)
-- Run again anytime — it safely skips already-existing objects.
-- ============================================================

-- ============ Extensions ============
create extension if not exists "pgcrypto";

-- ============ Types ============
do $$ begin
  create type source_kind as enum (
    'rss', 'reddit', 'hn', 'arxiv', 'github_trending', 'scrape'
  );
exception when duplicate_object then null;
end $$;

do $$ begin
  create type tool_pricing as enum ('free', 'freemium', 'paid');
exception when duplicate_object then null;
end $$;

do $$ begin
  create type tool_category as enum ('video', 'image', 'coding', 'writing', 'productivity');
exception when duplicate_object then null;
end $$;

-- ============ Tables ============

-- sources
do $$ begin
  create table public.sources (
    id              uuid primary key default gen_random_uuid(),
    name            text not null unique,
    kind            source_kind not null,
    url             text not null,
    authority       int default 50 check (authority between 0 and 100),
    language        text default 'en',
    tags            text[] default '{}',
    is_enabled      boolean default true,
    config          jsonb default '{}'::jsonb,
    last_fetched_at timestamptz,
    last_error      text,
    created_at      timestamptz default now()
  );
exception when duplicate_table then null;
end $$;

do $$ begin
  insert into public.sources (name, kind, url, authority, tags) values
    ('OpenAI Blog',        'scrape',         'https://openai.com/news/', 95, '{lab,llm}'),
    ('Anthropic News',     'scrape',         'https://www.anthropic.com/news', 95, '{lab,llm}'),
    ('Google AI Blog',    'rss',            'https://blog.google/technology/ai/rss/', 90, '{lab}'),
    ('Hugging Face Blog', 'rss',            'https://huggingface.co/blog/feed.xml', 85, '{community,oss}'),
    ('TechCrunch AI',    'rss',            'https://techcrunch.com/category/artificial-intelligence/feed/', 75, '{news}'),
    ('arXiv cs.AI',       'arxiv',          'http://export.arxiv.org/api/query?search_query=cat:cs.AI&sortBy=submittedDate&sortOrder=descending&max_results=30', 80, '{paper}'),
    ('Reddit r/MachineLearning', 'reddit', 'https://www.reddit.com/r/MachineLearning/.json?limit=50', 70, '{community}'),
    ('Reddit r/LocalLLaMA',       'reddit', 'https://www.reddit.com/r/LocalLLaMA/.json?limit=50',      65, '{community,oss}'),
    ('Hacker News AI',    'hn',             'https://hn.algolia.com/api/v1/search?query=AI&tags=story', 80, '{news}'),
    ('GitHub Trending AI','github_trending','https://github.com/trending?since=daily&spoken_language_code=en', 70, '{oss}')
  on conflict (name) do nothing;
exception when undefined_table then null;
end $$;

-- raw_items
do $$ begin
  create table public.raw_items (
    id              uuid primary key default gen_random_uuid(),
    source_id       uuid references public.sources(id) on delete cascade,
    external_id     text,
    url             text not null,
    title           text not null,
    summary         text,
    author          text,
    published_at    timestamptz,
    fetched_at      timestamptz default now(),
    language        text default 'en',
    raw_metadata    jsonb default '{}'::jsonb,
    status          text default 'new'
                    check (status in ('new', 'scored', 'drafted', 'skipped')),
    unique (source_id, external_id)
  );
exception when duplicate_table then null;
end $$;

do $$ begin
  create index raw_items_published_idx on public.raw_items (published_at desc);
exception when duplicate_index then null;
end $$;
do $$ begin
  create index raw_items_source_idx on public.raw_items (source_id, fetched_at desc);
exception when duplicate_index then null;
end $$;

-- audit_logs
do $$ begin
  create table public.audit_logs (
    id          uuid primary key default gen_random_uuid(),
    ts          timestamptz default now(),
    actor       text,
    action      text not null,
    target_type text,
    target_id   uuid,
    payload     jsonb default '{}'::jsonb
  );
exception when duplicate_table then null;
end $$;
do $$ begin
  create index audit_logs_ts_idx on public.audit_logs (ts desc);
exception when duplicate_index then null;
end $$;

-- articles
do $$ begin
  create table public.articles (
    id                  uuid primary key default gen_random_uuid(),
    slug                text unique not null,
    title               text not null,
    excerpt             text,
    cover_image         text,
    content             text,
    category            text not null default 'AI 新聞',
    tags                text[] default '{}',
    author              text default 'AI Radar',
    source_url          text,
    source_name         text,
    is_ai_generated     boolean default false,
    is_published        boolean default false,
    is_featured         boolean default false,
    is_premium          boolean default false,
    published_at        timestamptz default now(),
    reading_time        int default 5,
    views               int default 0,
    summary_content     text,
    summary_content_zh  text,
    title_zh            text,
    excerpt_zh          text,
    content_zh          text,
    content_html        text,
    created_at          timestamptz default now(),
    updated_at          timestamptz default now()
  );
exception when duplicate_table then null;
end $$;
do $$ begin
  create index articles_published_idx on public.articles (is_published, published_at desc);
exception when duplicate_index then null;
end $$;
do $$ begin
  create index articles_featured_idx on public.articles (is_featured) where is_featured;
exception when duplicate_index then null;
end $$;
do $$ begin
  create index articles_premium_idx on public.articles (is_premium) where is_premium;
exception when duplicate_index then null;
end $$;

-- tools
do $$ begin
  create table public.tools (
    id            uuid primary key default gen_random_uuid(),
    slug          text unique not null,
    name          text not null,
    tagline       text,
    description   text,
    logo          text,
    website       text not null,
    category      tool_category not null default 'productivity',
    rating        numeric(2,1) default 0,
    pricing       tool_pricing default 'freemium',
    is_trending   boolean default false,
    created_at    timestamptz default now()
  );
exception when duplicate_table then null;
end $$;

-- tutorials
do $$ begin
  create table public.tutorials (
    id            uuid primary key default gen_random_uuid(),
    slug          text unique not null,
    title         text not null,
    level         text check (level in ('新手', '中級', '進階')),
    duration      text,
    cover_image   text,
    excerpt       text,
    content       text,
    is_published  boolean default true,
    created_at    timestamptz default now()
  );
exception when duplicate_table then null;
end $$;

-- newsletter_subscribers
do $$ begin
  create table public.newsletter_subscribers (
    id                uuid primary key default gen_random_uuid(),
    email             text unique not null,
    is_confirmed      boolean default false,
    confirmation_token text unique,
    source            text default 'website',
    subscribed_at     timestamptz default now(),
    confirmed_at      timestamptz,
    unsubscribed_at   timestamptz
  );
exception when duplicate_table then null;
end $$;

-- mail_subscribers
do $$ begin
  create table public.mail_subscribers (
    id              uuid primary key default gen_random_uuid(),
    email           text unique not null,
    opted_in        boolean default false,
    subscribed_at   timestamptz default now(),
    is_confirmed    boolean default false
  );
exception when duplicate_table then null;
end $$;
do $$ begin
  create index mail_subscribers_email_idx on public.mail_subscribers(email);
exception when duplicate_index then null;
end $$;

-- mail_settings
do $$ begin
  create table public.mail_settings (
    id                      uuid primary key default gen_random_uuid(),
    smtp_host               text,
    smtp_port               int default 587,
    smtp_user               text,
    smtp_pass_encrypted     text,
    smtp_from_address       text,
    smtp_from_name          text,
    daily_enabled           boolean default false,
    daily_hour              int default 9,
    daily_timezone          text default 'Asia/Hong_Kong',
    email_subject_template text default 'Your AI Radar Daily Digest',
    email_header_html       text,
    email_footer_html       text,
    updated_at              timestamptz default now()
  );
exception when duplicate_table then null;
end $$;

-- threads
do $$ begin
  create table public.threads (
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
exception when duplicate_table then null;
end $$;
do $$ begin
  create index threads_author_id_idx on public.threads(author_id);
exception when duplicate_index then null;
end $$;
do $$ begin
  create index threads_created_at_idx on public.threads(created_at desc);
exception when duplicate_index then null;
end $$;

-- thread_comments
do $$ begin
  create table public.thread_comments (
    id                uuid primary key default gen_random_uuid(),
    thread_id         uuid references public.threads(id) on delete cascade,
    parent_comment_id uuid references public.thread_comments(id) on delete cascade,
    author_id         uuid references auth.users(id) on delete cascade,
    content           text not null check (char_length(content) <= 1000),
    is_bot_comment    boolean default false,
    like_count        integer default 0,
    created_at        timestamptz default now()
  );
exception when duplicate_table then null;
end $$;
do $$ begin
  create index thread_comments_thread_id_idx on public.thread_comments(thread_id);
exception when duplicate_index then null;
end $$;
do $$ begin
  create index thread_comments_parent_comment_id_idx on public.thread_comments(parent_comment_id);
exception when duplicate_index then null;
end $$;

-- thread_likes
do $$ begin
  create table public.thread_likes (
    thread_id  uuid references public.threads(id) on delete cascade,
    user_id    uuid references auth.users(id) on delete cascade,
    created_at timestamptz default now(),
    primary key (thread_id, user_id)
  );
exception when duplicate_table then null;
end $$;

-- comment_likes
do $$ begin
  create table public.comment_likes (
    comment_id uuid references public.thread_comments(id) on delete cascade,
    user_id    uuid references auth.users(id) on delete cascade,
    created_at timestamptz default now(),
    primary key (comment_id, user_id)
  );
exception when duplicate_table then null;
end $$;

-- bot_settings
do $$ begin
  create table public.bot_settings (
    id               uuid primary key default gen_random_uuid(),
    enabled          boolean default true,
    daily_post_time  time default '09:00',
    comment_enabled  boolean default true
  );
exception when duplicate_table then null;
end $$;

do $$ begin
  insert into public.bot_settings (id, enabled, daily_post_time, comment_enabled)
  values ('00000000-0000-0000-0000-000000000001', true, '09:00', true)
  on conflict (id) do nothing;
exception when undefined_table then null;
end $$;

-- Storage bucket for thread images
do $$ begin
  insert into storage.buckets (id, name, public)
  values ('thread-images', 'thread-images', true)
  on conflict do nothing;
exception when undefined then null;
end $$;

-- profiles
do $$ begin
  create table public.profiles (
    id                uuid primary key references auth.users(id) on delete cascade,
    email             text not null,
    display_name      text,
    avatar_url        text,
    newsletter_optin  boolean default true,
    is_admin          boolean default false,
    plan              text default 'free' check (plan in ('free', 'premium')),
    created_at        timestamptz default now(),
    updated_at        timestamptz default now()
  );
exception when duplicate_table then null;
end $$;
do $$ begin
  create index profiles_email_idx on public.profiles (email);
exception when duplicate_index then null;
end $$;

-- bookmarks
do $$ begin
  create table public.bookmarks (
    id          uuid primary key default gen_random_uuid(),
    user_id     uuid not null references auth.users(id) on delete cascade,
    article_id  uuid not null references public.articles(id) on delete cascade,
    created_at  timestamptz default now(),
    unique (user_id, article_id)
  );
exception when duplicate_table then null;
end $$;
do $$ begin
  create index bookmarks_user_idx on public.bookmarks (user_id, created_at desc);
exception when duplicate_index then null;
end $$;

-- ============ RLS ============

do $$ begin
  alter table public.sources enable row level security;
exception when duplicate_object then null;
end $$;
do $$ begin
  alter table public.raw_items enable row level security;
exception when duplicate_object then null;
end $$;
do $$ begin
  alter table public.audit_logs enable row level security;
exception when duplicate_object then null;
end $$;
do $$ begin
  alter table public.articles enable row level security;
exception when duplicate_object then null;
end $$;
do $$ begin
  alter table public.tools enable row level security;
exception when duplicate_object then null;
end $$;
do $$ begin
  alter table public.tutorials enable row level security;
exception when duplicate_object then null;
end $$;
do $$ begin
  alter table public.newsletter_subscribers enable row level security;
exception when duplicate_object then null;
end $$;
do $$ begin
  alter table public.mail_subscribers enable row level security;
exception when duplicate_object then null;
end $$;
do $$ begin
  alter table public.mail_settings enable row level security;
exception when duplicate_object then null;
end $$;
do $$ begin
  alter table public.threads enable row level security;
exception when duplicate_object then null;
end $$;
do $$ begin
  alter table public.thread_comments enable row level security;
exception when duplicate_object then null;
end $$;
do $$ begin
  alter table public.thread_likes enable row level security;
exception when duplicate_object then null;
end $$;
do $$ begin
  alter table public.comment_likes enable row level security;
exception when duplicate_object then null;
end $$;
do $$ begin
  alter table public.bot_settings enable row level security;
exception when duplicate_object then null;
end $$;
do $$ begin
  alter table public.profiles enable row level security;
exception when duplicate_object then null;
end $$;
do $$ begin
  alter table public.bookmarks enable row level security;
exception when duplicate_object then null;
end $$;

-- ============ Policies ============

do $$ begin
  drop policy if exists "admin read sources" on public.sources;
  create policy "admin read sources" on public.sources for select using (auth.jwt() ->> 'role' = 'admin');
exception when duplicate_object then null;
end $$;

do $$ begin
  drop policy if exists "admin read raw_items" on public.raw_items;
  create policy "admin read raw_items" on public.raw_items for select using (auth.jwt() ->> 'role' = 'admin');
exception when duplicate_object then null;
end $$;

do $$ begin
  drop policy if exists "admin read audit" on public.audit_logs;
  create policy "admin read audit" on public.audit_logs for select using (auth.jwt() ->> 'role' = 'admin');
exception when duplicate_object then null;
end $$;

do $$ begin
  drop policy if exists "public read articles" on public.articles;
  create policy "public read articles" on public.articles for select using (is_published = true);
exception when duplicate_object then null;
end $$;

do $$ begin
  drop policy if exists "public read tools" on public.tools;
  create policy "public read tools" on public.tools for select using (true);
exception when duplicate_object then null;
end $$;

do $$ begin
  drop policy if exists "public read tutorials" on public.tutorials;
  create policy "public read tutorials" on public.tutorials for select using (is_published = true);
exception when duplicate_object then null;
end $$;

do $$ begin
  drop policy if exists "anyone subscribe" on public.newsletter_subscribers;
  create policy "anyone subscribe" on public.newsletter_subscribers for insert with check (true);
exception when duplicate_object then null;
end $$;
do $$ begin
  drop policy if exists "admin read newsletter" on public.newsletter_subscribers;
  create policy "admin read newsletter" on public.newsletter_subscribers for select using (auth.jwt() ->> 'role' = 'admin');
exception when duplicate_object then null;
end $$;

do $$ begin
  drop policy if exists "Anyone can subscribe to mail list" on public.mail_subscribers;
  create policy "Anyone can subscribe to mail list" on public.mail_subscribers for insert with check (true);
exception when duplicate_object then null;
end $$;
do $$ begin
  drop policy if exists "Only admins can read mail subscribers" on public.mail_subscribers;
  create policy "Only admins can read mail subscribers" on public.mail_subscribers for select using (auth.jwt() ->> 'role' = 'admin');
exception when duplicate_object then null;
end $$;
do $$ begin
  drop policy if exists "Only admins can update mail subscribers" on public.mail_subscribers;
  create policy "Only admins can update mail subscribers" on public.mail_subscribers for update using (auth.jwt() ->> 'role' = 'admin');
exception when duplicate_object then null;
end $$;

do $$ begin
  drop policy if exists "Only admins can read mail settings" on public.mail_settings;
  create policy "Only admins can read mail settings" on public.mail_settings for select using (auth.jwt() ->> 'role' = 'admin');
exception when duplicate_object then null;
end $$;
do $$ begin
  drop policy if exists "Only admins can write mail settings" on public.mail_settings;
  create policy "Only admins can write mail settings" on public.mail_settings for all using (auth.jwt() ->> 'role' = 'admin') with check (auth.jwt() ->> 'role' = 'admin');
exception when duplicate_object then null;
end $$;

do $$ begin
  drop policy if exists "Anyone can read threads" on public.threads;
  create policy "Anyone can read threads" on public.threads for select using (true);
exception when duplicate_object then null;
end $$;
do $$ begin
  drop policy if exists "Authenticated users can create threads" on public.threads;
  create policy "Authenticated users can create threads" on public.threads for insert with check (auth.role() = 'authenticated');
exception when duplicate_object then null;
end $$;
do $$ begin
  drop policy if exists "Authors can delete their own threads" on public.threads;
  create policy "Authors can delete their own threads" on public.threads for delete using (auth.uid() = author_id);
exception when duplicate_object then null;
end $$;

do $$ begin
  drop policy if exists "Anyone can read thread_comments" on public.thread_comments;
  create policy "Anyone can read thread_comments" on public.thread_comments for select using (true);
exception when duplicate_object then null;
end $$;
do $$ begin
  drop policy if exists "Authenticated users can create thread_comments" on public.thread_comments;
  create policy "Authenticated users can create thread_comments" on public.thread_comments for insert with check (auth.role() = 'authenticated');
exception when duplicate_object then null;
end $$;
do $$ begin
  drop policy if exists "Authors can delete their own thread_comments" on public.thread_comments;
  create policy "Authors can delete their own thread_comments" on public.thread_comments for delete using (auth.uid() = author_id);
exception when duplicate_object then null;
end $$;

do $$ begin
  drop policy if exists "Anyone can read thread_likes" on public.thread_likes;
  create policy "Anyone can read thread_likes" on public.thread_likes for select using (true);
exception when duplicate_object then null;
end $$;
do $$ begin
  drop policy if exists "Authenticated users can manage own thread_likes" on public.thread_likes;
  create policy "Authenticated users can manage own thread_likes" on public.thread_likes for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
exception when duplicate_object then null;
end $$;

do $$ begin
  drop policy if exists "Anyone can read comment_likes" on public.comment_likes;
  create policy "Anyone can read comment_likes" on public.comment_likes for select using (true);
exception when duplicate_object then null;
end $$;
do $$ begin
  drop policy if exists "Authenticated users can manage own comment_likes" on public.comment_likes;
  create policy "Authenticated users can manage own comment_likes" on public.comment_likes for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
exception when duplicate_object then null;
end $$;

do $$ begin
  drop policy if exists "Authenticated users can read bot_settings" on public.bot_settings;
  create policy "Authenticated users can read bot_settings" on public.bot_settings for select using (auth.role() = 'authenticated');
exception when duplicate_object then null;
end $$;
do $$ begin
  drop policy if exists "Admins can manage bot_settings" on public.bot_settings;
  create policy "Admins can manage bot_settings" on public.bot_settings for all using (auth.jwt() ->> 'role' = 'admin') with check (auth.jwt() ->> 'role' = 'admin');
exception when duplicate_object then null;
end $$;

do $$ begin
  drop policy if exists "Anyone can view thread images" on storage.objects;
  create policy "Anyone can view thread images" on storage.objects for select using (bucket_id = 'thread-images');
exception when duplicate_object then null;
end $$;
do $$ begin
  drop policy if exists "Authenticated users can upload thread images" on storage.objects;
  create policy "Authenticated users can upload thread images" on storage.objects for insert with check (bucket_id = 'thread-images' and auth.role() = 'authenticated');
exception when duplicate_object then null;
end $$;
do $$ begin
  drop policy if exists "Users can delete their own thread images" on storage.objects;
  create policy "Users can delete their own thread images" on storage.objects for delete using (bucket_id = 'thread-images' and auth.uid()::text = (storage.foldername(name))[1]);
exception when duplicate_object then null;
end $$;

do $$ begin
  drop policy if exists "Users can read own profile" on public.profiles;
  create policy "Users can read own profile" on public.profiles for select using (auth.uid() = id);
exception when duplicate_object then null;
end $$;
do $$ begin
  drop policy if exists "Users can update own profile" on public.profiles;
  create policy "Users can update own profile" on public.profiles for update using (auth.uid() = id) with check (auth.uid() = id);
exception when duplicate_object then null;
end $$;
do $$ begin
  drop policy if exists "Public can read display_name" on public.profiles;
  create policy "Public can read display_name" on public.profiles for select using (true);
exception when duplicate_object then null;
end $$;

do $$ begin
  drop policy if exists "users read own bookmarks" on public.bookmarks;
  create policy "users read own bookmarks" on public.bookmarks for select using (auth.uid() = user_id);
exception when duplicate_object then null;
end $$;
do $$ begin
  drop policy if exists "users insert own bookmarks" on public.bookmarks;
  create policy "users insert own bookmarks" on public.bookmarks for insert with check (auth.uid() = user_id);
exception when duplicate_object then null;
end $$;
do $$ begin
  drop policy if exists "users delete own bookmarks" on public.bookmarks;
  create policy "users delete own bookmarks" on public.bookmarks for delete using (auth.uid() = user_id);
exception when duplicate_object then null;
end $$;

-- ============ Triggers & Functions ============

-- Auto-update updated_at for mail_settings
create or replace function public.update_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists mail_settings_updated_at on public.mail_settings;
create trigger mail_settings_updated_at
  before update on public.mail_settings
  for each row execute function public.update_updated_at();

-- Auto-create profile + auto-subscribe on auth.users insert
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, display_name, avatar_url)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'name', new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)),
    new.raw_user_meta_data->>'avatar_url'
  )
  on conflict (id) do nothing;

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

-- Atomic like/comment count helpers
create or replace function public.increment_like_count(tid uuid, increment integer default 1)
returns void as $$
  update public.threads set like_count = like_count + increment where id = tid;
$$ language sql security definer;

create or replace function public.decrement_like_count(tid uuid, decrement integer default 1)
returns void as $$
  update public.threads set like_count = greatest(like_count - decrement, 0) where id = tid;
$$ language sql security definer;

create or replace function public.increment_comment_count(tid uuid)
returns void as $$
  update public.threads set comment_count = comment_count + 1 where id = tid;
$$ language sql security definer;

create or replace function public.increment_comment_like_count(cid uuid, increment integer default 1)
returns void as $$
  update public.thread_comments set like_count = like_count + increment where id = cid;
$$ language sql security definer;

create or replace function public.decrement_comment_like_count(cid uuid, decrement integer default 1)
returns void as $$
  update public.thread_comments set like_count = greatest(like_count - decrement, 0) where id = cid;
$$ language sql security definer;