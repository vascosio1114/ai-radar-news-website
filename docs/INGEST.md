# Ingest Pipeline

> 最簡單版：每 2 小時自動由 10 個 source pull AI 新聞 → 入 Supabase。
> 冇 embedding、冇 LLM、冇 cost。淨係收集數據。

---

## Schema migration（喺 Supabase SQL Editor 跑一次）

```sql
-- 1. Extension
create extension if not exists "pgcrypto";

-- 2. Source kind enum
create type source_kind as enum (
  'rss', 'reddit', 'hn', 'arxiv', 'github_trending', 'scrape'
);

-- 3. sources
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

-- 4. Seed 10 sources
insert into public.sources (name, kind, url, authority, tags) values
  ('OpenAI Blog',       'rss',          'https://openai.com/blog/rss/',                            95, '{lab,llm}'),
  ('Anthropic News',    'scrape',       'https://www.anthropic.com/news',                          95, '{lab,llm}'),
  ('Google AI Blog',    'rss',          'https://blog.google/technology/ai/rss/',                  90, '{lab}'),
  ('Hugging Face Blog', 'rss',          'https://huggingface.co/blog/feed.xml',                    85, '{community,oss}'),
  ('TechCrunch AI',     'rss',          'https://techcrunch.com/category/artificial-intelligence/feed/', 75, '{news}'),
  ('arXiv cs.AI',       'arxiv',        'http://export.arxiv.org/api/query?search_query=cat:cs.AI&sortBy=submittedDate&sortOrder=descending&max_results=30', 80, '{paper}'),
  ('Reddit r/MachineLearning', 'reddit', 'https://www.reddit.com/r/MachineLearning/.json?limit=50',70, '{community}'),
  ('Reddit r/LocalLLaMA', 'reddit',     'https://www.reddit.com/r/LocalLLaMA/.json?limit=50',      65, '{community,oss}'),
  ('Hacker News AI',    'hn',           'https://hn.algolia.com/api/v1/search?query=AI&tags=story', 80, '{news}'),
  ('GitHub Trending AI','github_trending','https://github.com/trending?since=daily&spoken_language_code=en', 70, '{oss}');

-- 5. raw_items
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

create index raw_items_published_idx on public.raw_items (published_at desc);
create index raw_items_source_idx on public.raw_items (source_id, fetched_at desc);

-- 6. audit_logs
create table public.audit_logs (
  id          uuid primary key default gen_random_uuid(),
  ts          timestamptz default now(),
  actor       text,
  action      text not null,
  target_type text,
  target_id   uuid,
  payload     jsonb default '{}'::jsonb
);

create index audit_logs_ts_idx on public.audit_logs (ts desc);

-- 7. RLS — pipeline 用 service_role bypass，前端只能讀 sources
alter table public.sources       enable row level security;
alter table public.raw_items     enable row level security;
alter table public.audit_logs    enable row level security;

-- 用 service_role 嗰陣 RLS 自動 bypass，所以 pipeline 唔需要任何 policy
-- 公開讀（俾日後 admin / debug 用）：
create policy "admin read sources"   on public.sources   for select using (auth.jwt() ->> 'role' = 'admin');
create policy "admin read raw_items" on public.raw_items for select using (auth.jwt() ->> 'role' = 'admin');
create policy "admin read audit"     on public.audit_logs for select using (auth.jwt() ->> 'role' = 'admin');
```

驗證：

```sql
select count(*) from public.sources;  -- 應該係 10
```

---

## 本機 run 試一次

```bash
# 假設 .env.local 已填好 Supabase keys
npm run pipeline:ingest
```

預期 output：

```
[12:00:01] ▸ Fetching 10 sources
[12:00:03] → OpenAI Blog (rss)
[12:00:05] ✓ fetched 12, new 12
[12:00:07] → Anthropic News (scrape)
[12:00:09] ✓ fetched 8, new 8
...
[12:01:28] ✓ Done in 87.3s — sources ok 10, failed 0, fetched 152, new 152
```

第二次跑同一個 source、新 item 會係 0（因為 unique constraint dedupe）。

驗證入 Supabase：

```sql
select source_id, count(*) from raw_items group by source_id order by count(*) desc;
select title, url, published_at from raw_items
order by fetched_at desc limit 20;
```

---

## GitHub Actions secrets 設定

GitHub repo → Settings → Secrets and variables → Actions → New secret：

- `NEXT_PUBLIC_SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`

設好之後，去 Actions tab → 揀 `Ingest sources` → Run workflow → main → Run。
2-3 分鐘睇結果，成功嘅話 `raw_items` table 會多一批新 row。
之後每 2 小時自動跑。

---

## Troubleshooting

| 症狀                                          | 點解 / 點救                                                |
| --------------------------------------------- | ---------------------------------------------------------- |
| `Missing NEXT_PUBLIC_SUPABASE_URL`            | `.env.local` 未填，或者 GHA secret 未設                     |
| `Source X failed: 403/429`                    | 來源限速（特別係 Reddit / TechCrunch），下次 cron 自然補返 |
| `relation "sources" does not exist`           | Schema migration 未跑，或者跑錯 Supabase project           |
| Source `last_error` 顯示 timeout              | 試手動 trigger 重跑；如果 persistent 喺 admin disable      |
| 完全冇 row insert（new=0）                    | 第一次冇可能。check log 邊個 source error                  |

---

## 之後可以加咩

呢套 minimal ingest 已經寫得好彈性，下一階段加：

1. **embedding-based dedupe** — 加 `pgvector` extension + raw_items.embedding column + 一個 OpenAI API key
2. **Quality scoring** — 用 Claude Haiku 評分，篩走低質
3. **AI 寫 draft** — 用 Claude Sonnet/Opus 寫繁中文章
4. **Admin approve flow** — `/admin/drafts` 撳 publish

每步都係小改動，可以分批 commit / PR。
