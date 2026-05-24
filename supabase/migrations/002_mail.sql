-- Migration: Mailing list tables (mail_subscribers + mail_settings)
-- Run in Supabase SQL Editor after merging
-- Note: Down migrations are not provided for this file.

-- 1. mail_subscribers
create table if not exists public.mail_subscribers (
  id              uuid primary key default gen_random_uuid(),
  email           text unique not null,
  opted_in        boolean default false,
  subscribed_at   timestamptz default now(),
  is_confirmed    boolean default false,
  confirmation_token text unique
);

alter table public.mail_subscribers enable row level security;

-- Index for efficient on conflict (email) do update lookups
create index if not exists mail_subscribers_email_idx on public.mail_subscribers(email);

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
  smtp_pass_encrypted     text, -- SMTP password stored as-is. Use Supabase Vault for encryption at rest.
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

-- Trigger function to auto-update updated_at
create or replace function public.update_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- Trigger on mail_settings
drop trigger if exists mail_settings_updated_at on public.mail_settings;
create trigger mail_settings_updated_at
  before update on public.mail_settings
  for each row execute function public.update_updated_at();

-- Only admins can read/write mail_settings
create policy "Only admins can read mail settings"
  on public.mail_settings for select
  using (auth.jwt() ->> 'role' = 'admin');

create policy "Only admins can write mail settings"
  on public.mail_settings for all
  using (auth.jwt() ->> 'role' = 'admin')
  with check (auth.jwt() ->> 'role' = 'admin');