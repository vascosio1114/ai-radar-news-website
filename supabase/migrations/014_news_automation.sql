-- Daily AI news automation support.

alter table public.raw_items
  add column if not exists processed_at timestamptz;

alter table public.articles
  add column if not exists source_url text,
  add column if not exists source_name text,
  add column if not exists is_ai_generated boolean default false;

delete from public.raw_items a
using public.raw_items b
where a.url = b.url
  and a.id > b.id;

delete from public.raw_items a
using public.raw_items b
where a.external_id is not null
  and b.external_id is not null
  and a.external_id = b.external_id
  and a.id > b.id;

create unique index if not exists raw_items_url_unique_idx
  on public.raw_items (url);

create unique index if not exists raw_items_external_id_unique_idx
  on public.raw_items (external_id)
  where external_id is not null;

create index if not exists raw_items_processed_idx
  on public.raw_items (processed_at, fetched_at desc);

create unique index if not exists articles_source_url_unique_idx
  on public.articles (source_url)
  where source_url is not null;

insert into public.sources (name, kind, url, authority, language, tags, is_enabled)
values
  ('OpenAI News RSS', 'rss', 'https://openai.com/news/rss.xml', 95, 'en', '{lab,llm}', true),
  ('Google AI Blog', 'rss', 'https://blog.google/technology/ai/rss/', 90, 'en', '{lab}', true),
  ('Hugging Face Blog', 'rss', 'https://huggingface.co/blog/feed.xml', 85, 'en', '{community,oss}', true),
  ('TechCrunch AI', 'rss', 'https://techcrunch.com/category/artificial-intelligence/feed/', 75, 'en', '{news}', true)
on conflict (name) do update set
  kind = excluded.kind,
  url = excluded.url,
  authority = excluded.authority,
  language = excluded.language,
  tags = excluded.tags,
  is_enabled = excluded.is_enabled;

grant select, insert, update on public.sources to service_role;
grant select, insert, update on public.raw_items to service_role;
grant select, insert, update on public.articles to service_role;
grant insert on public.audit_logs to service_role;
