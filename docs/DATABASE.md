# Supabase Database Schema

Copy 落 Supabase Studio → SQL Editor → Run，就會建好所有 table 同 RLS。

## 1. `articles` 表

```sql
create table public.articles (
  id            uuid primary key default gen_random_uuid(),
  slug          text unique not null,
  title         text not null,
  excerpt       text,
  cover_image   text,
  content       text,                       -- Markdown
  category      text not null,
  tags          text[] default '{}',
  author        text default 'Editorial Team',
  published_at  timestamptz default now(),
  reading_time  int default 5,
  views         int default 0,
  is_featured   boolean default false,
  is_published  boolean default true,
  created_at    timestamptz default now(),
  updated_at    timestamptz default now()
);

create index articles_published_idx on public.articles (is_published, published_at desc);
create index articles_category_idx  on public.articles (category);
create index articles_featured_idx  on public.articles (is_featured) where is_featured;
```

## 2. `tools` 表

```sql
create type tool_pricing as enum ('free', 'freemium', 'paid');
create type tool_category as enum ('video', 'image', 'coding', 'writing', 'productivity');

create table public.tools (
  id            uuid primary key default gen_random_uuid(),
  slug          text unique not null,
  name          text not null,
  tagline       text,
  description   text,
  logo          text,
  website       text not null,
  category      tool_category not null,
  rating        numeric(2,1) default 0 check (rating >= 0 and rating <= 5),
  pricing       tool_pricing default 'freemium',
  is_trending   boolean default false,
  created_at    timestamptz default now()
);

create index tools_category_idx on public.tools (category);
create index tools_trending_idx on public.tools (is_trending) where is_trending;
```

## 3. `tutorials` 表

```sql
create table public.tutorials (
  id            uuid primary key default gen_random_uuid(),
  slug          text unique not null,
  title         text not null,
  level         text check (level in ('新手', '中級', '進階')),
  duration      text,
  cover_image   text,
  excerpt       text,
  content       text,                       -- Markdown
  is_published  boolean default true,
  created_at    timestamptz default now()
);
```

## 4. `newsletter_subscribers` 表

```sql
create table public.newsletter_subscribers (
  id              uuid primary key default gen_random_uuid(),
  email           text unique not null,
  subscribed_at   timestamptz default now(),
  is_confirmed    boolean default false
);
```

## 5. RLS（Row Level Security）

```sql
-- articles：任何人讀已 publish 嘅，只 admin 寫
alter table public.articles enable row level security;

create policy "Anyone can read published articles"
  on public.articles for select
  using (is_published = true);

create policy "Admins can do anything on articles"
  on public.articles for all
  using (auth.jwt() ->> 'role' = 'admin')
  with check (auth.jwt() ->> 'role' = 'admin');

-- tools：人人可讀，只 admin 寫
alter table public.tools enable row level security;
create policy "Anyone can read tools" on public.tools for select using (true);
create policy "Admins write tools"
  on public.tools for all
  using (auth.jwt() ->> 'role' = 'admin')
  with check (auth.jwt() ->> 'role' = 'admin');

-- tutorials：同上
alter table public.tutorials enable row level security;
create policy "Anyone can read published tutorials"
  on public.tutorials for select using (is_published = true);
create policy "Admins write tutorials"
  on public.tutorials for all
  using (auth.jwt() ->> 'role' = 'admin')
  with check (auth.jwt() ->> 'role' = 'admin');

-- newsletter：任何人都可以 insert（訂閱），但唔可以讀
alter table public.newsletter_subscribers enable row level security;
create policy "Anyone can subscribe"
  on public.newsletter_subscribers for insert with check (true);
create policy "Only admins can read subscribers"
  on public.newsletter_subscribers for select
  using (auth.jwt() ->> 'role' = 'admin');
```

## 6. 設定 admin 角色

喺 Supabase Auth → Users 揀你個 user → Edit user → 喺 `app_metadata` 加：

```json
{ "role": "admin" }
```

## 7. Storage bucket（圖片上傳）

```sql
-- Supabase Studio → Storage → New bucket → 名: covers, Public: true
-- 然後 SQL：
create policy "Public read covers"
  on storage.objects for select
  using (bucket_id = 'covers');

create policy "Admins upload covers"
  on storage.objects for insert
  with check (bucket_id = 'covers' and auth.jwt() ->> 'role' = 'admin');
```

## 8. Seed mock data（可選）

開發時想 quickly 灌啲假資料：

```sql
insert into public.articles (slug, title, excerpt, cover_image, category)
values
  ('openai-gpt-5-launch', 'OpenAI 正式發布 GPT-5...', 'GPT-5 喺 reasoning...', 'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=1200&q=80', 'AI 新聞'),
  ('anthropic-claude-opus-4-6', 'Anthropic 推 Claude Opus 4.6...', 'Opus 4.6 提升咗...', 'https://images.unsplash.com/photo-1620712943543-bcc4688e7485?w=1200&q=80', 'AI 新聞');
```
