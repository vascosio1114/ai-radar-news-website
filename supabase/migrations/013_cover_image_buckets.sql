-- ============================================================
-- Cover Image Storage Buckets
-- Creates storage buckets for article and tutorial cover images.
-- Idempotent — safe to run multiple times.
-- ============================================================

-- Storage bucket for article covers
do $$ begin
  insert into storage.buckets (id, name, public)
  values ('article-covers', 'article-covers', true)
  on conflict do nothing;
exception when undefined then null;
end $$;

-- Storage bucket for tutorial covers
do $$ begin
  insert into storage.buckets (id, name, public)
  values ('tutorial-covers', 'tutorial-covers', true)
  on conflict do nothing;
exception when undefined then null;
end $$;

-- Storage policies for article-covers bucket
do $$ begin
  drop policy if exists "Anyone can view article covers" on storage.objects;
  create policy "Anyone can view article covers" on storage.objects for select using (bucket_id = 'article-covers');
exception when duplicate_object then null;
end $$;

do $$ begin
  drop policy if exists "Admins can upload article covers" on storage.objects;
  create policy "Admins can upload article covers" on storage.objects for insert with check (bucket_id = 'article-covers' and auth.jwt() ->> 'role' = 'admin');
exception when duplicate_object then null;
end $$;

-- Storage policies for tutorial-covers bucket
do $$ begin
  drop policy if exists "Anyone can view tutorial covers" on storage.objects;
  create policy "Anyone can view tutorial covers" on storage.objects for select using (bucket_id = 'tutorial-covers');
exception when duplicate_object then null;
end $$;

do $$ begin
  drop policy if exists "Admins can upload tutorial covers" on storage.objects;
  create policy "Admins can upload tutorial covers" on storage.objects for insert with check (bucket_id = 'tutorial-covers' and auth.jwt() ->> 'role' = 'admin');
exception when duplicate_object then null;
end $$;