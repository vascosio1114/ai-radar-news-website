alter table public.articles
  add column if not exists title_en text,
  add column if not exists excerpt_en text,
  add column if not exists content_en text;

update public.articles
set
  title_zh = coalesce(title_zh, title),
  excerpt_zh = coalesce(excerpt_zh, excerpt),
  content_zh = coalesce(content_zh, content)
where title_zh is null
   or excerpt_zh is null
   or content_zh is null;

do $$
begin
  if exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'articles'
      and column_name = 'locale'
  ) then
    with pairs as (
      select
        zh.id as zh_id,
        en.id as en_id,
        en.title as en_title,
        en.excerpt as en_excerpt,
        en.content as en_content,
        en.title_en,
        en.excerpt_en,
        en.content_en,
        en.summary_content as en_summary_content,
        en.tags as en_tags
      from public.articles zh
      join public.articles en
        on en.source_url = zh.source_url
       and en.id <> zh.id
      where zh.source_url is not null
        and zh.locale = 'zh'
        and en.locale = 'en'
    )
    update public.articles canonical
    set
      slug = case
        when canonical.slug like '%-zh'
         and not exists (
           select 1
           from public.articles slug_check
           where slug_check.slug = regexp_replace(canonical.slug, '-zh$', '')
             and slug_check.id <> canonical.id
         )
        then regexp_replace(canonical.slug, '-zh$', '')
        else canonical.slug
      end,
      title_zh = coalesce(canonical.title_zh, canonical.title),
      excerpt_zh = coalesce(canonical.excerpt_zh, canonical.excerpt),
      content_zh = coalesce(canonical.content_zh, canonical.content),
      title_en = coalesce(canonical.title_en, pairs.title_en, pairs.en_title),
      excerpt_en = coalesce(canonical.excerpt_en, pairs.excerpt_en, pairs.en_excerpt),
      content_en = coalesce(canonical.content_en, pairs.content_en, pairs.en_content),
      summary_content = coalesce(canonical.summary_content, pairs.en_summary_content, pairs.en_excerpt),
      tags = case
        when canonical.tags is null or cardinality(canonical.tags) = 0 then pairs.en_tags
        else canonical.tags
      end,
      language = 'zh-Hant,en',
      updated_at = now()
    from pairs
    where canonical.id = pairs.zh_id;

    delete from public.articles duplicate_en
    using public.articles canonical
    where duplicate_en.source_url = canonical.source_url
      and duplicate_en.id <> canonical.id
      and duplicate_en.source_url is not null
      and duplicate_en.locale = 'en'
      and canonical.locale = 'zh';

    update public.articles
    set
      slug = case
        when slug ~ '-(zh|en)$'
         and not exists (
           select 1
           from public.articles slug_check
           where slug_check.slug = regexp_replace(public.articles.slug, '-(zh|en)$', '')
             and slug_check.id <> public.articles.id
         )
        then regexp_replace(slug, '-(zh|en)$', '')
        else slug
      end,
      title_zh = case when locale = 'zh' then coalesce(title_zh, title) else title_zh end,
      excerpt_zh = case when locale = 'zh' then coalesce(excerpt_zh, excerpt) else excerpt_zh end,
      content_zh = case when locale = 'zh' then coalesce(content_zh, content) else content_zh end,
      title_en = case when locale = 'en' then coalesce(title_en, title) else title_en end,
      excerpt_en = case when locale = 'en' then coalesce(excerpt_en, excerpt) else excerpt_en end,
      content_en = case when locale = 'en' then coalesce(content_en, content) else content_en end,
      language = case
        when locale = 'en' then 'en'
        when locale = 'zh' then 'zh-Hant'
        else language
      end
    where locale in ('zh', 'en');
  end if;
end $$;

delete from public.articles duplicate
using public.articles canonical
where duplicate.source_url = canonical.source_url
  and duplicate.source_url is not null
  and duplicate.id <> canonical.id
  and (
    canonical.created_at < duplicate.created_at
    or (canonical.created_at = duplicate.created_at and canonical.id < duplicate.id)
  );

drop index if exists public.articles_source_url_locale_unique_idx;
drop index if exists public.articles_locale_idx;
drop index if exists public.articles_locale_is_published_idx;
drop index if exists public.articles_locale_published_at_idx;

create unique index if not exists articles_source_url_unique_idx
  on public.articles (source_url)
  where source_url is not null;

create index if not exists articles_title_zh_published_idx
  on public.articles (is_published, published_at desc)
  where title_zh is not null;

create index if not exists articles_title_en_published_idx
  on public.articles (is_published, published_at desc)
  where title_en is not null;

alter table public.articles
  drop constraint if exists articles_locale_check;

drop view if exists public.articles_public;

alter table public.articles
  drop column if exists locale;

create or replace function public.articles_search_trigger() returns trigger as $$
begin
  new.search_vector :=
    setweight(to_tsvector('english', coalesce(new.title, '') || ' ' || coalesce(new.title_en, '') || ' ' || coalesce(new.title_zh, '')), 'A') ||
    setweight(to_tsvector('english', coalesce(new.excerpt, '') || ' ' || coalesce(new.excerpt_en, '') || ' ' || coalesce(new.excerpt_zh, '')), 'B') ||
    setweight(to_tsvector('english', coalesce(new.content, '') || ' ' || coalesce(new.content_en, '') || ' ' || coalesce(new.content_zh, '')), 'C');
  return new;
end;
$$ language plpgsql;

drop trigger if exists articles_search_update on public.articles;
create trigger articles_search_update
  before insert or update on public.articles
  for each row execute function public.articles_search_trigger();

create view public.articles_public
with (security_invoker = true)
as
select
  id,
  slug,
  title,
  title_zh,
  title_en,
  excerpt,
  excerpt_zh,
  excerpt_en,
  cover_image,
  category,
  tags,
  author,
  published_at,
  reading_time,
  views,
  is_featured,
  is_published,
  is_premium,
  summary_content,
  summary_content_zh,
  content_html,
  source_url,
  source_name,
  is_ai_generated,
  language,
  created_at,
  updated_at
from public.articles
where is_published = true;

grant select on public.articles_public to anon, authenticated;
