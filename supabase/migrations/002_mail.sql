-- Migration: Mailing list tables (mail_subscribers + mail_settings)
-- Run in Supabase SQL Editor after merging

-- 1. mail_subscribers
create table if not exists public.mail_subscribers (
  id              uuid primary key default gen_random_uuid(),
  email           text unique not null,
  opted_in        boolean default false,
  subscribed_at   timestamptz default now(),
  is_confirmed    boolean default false
);

alter table public.mail_subscribers enable row level security;

-- Anyone can subscribe (insert), admins can read/update
create policy "Anyone can subscribe to mail list"
  on public.mail_subscribers for insert
  with check (true);

create policy "Only admins can read mail subscribers"
  on public.mail_subscribers for select
  using (auth.jwt() ->> 'role' = 'admin');

create policy "Only admins can update mail subscribers"
  on public.mail_subscribers for update
  using (auth.jwt() ->> 'role' = 'admin');

-- 2. mail_settings
create table if not exists public.mail_settings (
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

alter table public.mail_settings enable row level security;

-- Only admins can read/write mail_settings
create policy "Only admins can read mail settings"
  on public.mail_settings for select
  using (auth.jwt() ->> 'role' = 'admin');

create policy "Only admins can write mail settings"
  on public.mail_settings for all
  using (auth.jwt() ->> 'role' = 'admin')
  with check (auth.jwt() ->> 'role' = 'admin');