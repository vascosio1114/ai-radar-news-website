alter table public.articles
  add column if not exists language text default 'zh-Hant',
  add column if not exists review_status text default 'pending';

alter table public.articles
  drop constraint if exists articles_review_status_check;

alter table public.articles
  add constraint articles_review_status_check
  check (review_status in ('pending', 'approved', 'rejected'));

alter table public.raw_items
  drop constraint if exists raw_items_status_check;

alter table public.raw_items
  add constraint raw_items_status_check
  check (status in ('new', 'scored', 'drafted', 'skipped', 'failed'));

create index if not exists articles_review_queue_idx
  on public.articles (is_published, review_status, created_at desc);

grant select, update, delete on public.articles to service_role;
grant select, update on public.raw_items to service_role;
