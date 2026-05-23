-- Add missing indexes on FK columns for performance
create index if not exists bookmarks_article_id_idx on public.bookmarks(article_id);
create index if not exists comment_likes_user_id_idx on public.comment_likes(user_id);
create index if not exists thread_comments_author_id_idx on public.thread_comments(author_id);
create index if not exists thread_comments_parent_comment_id_idx on public.thread_comments(parent_comment_id);
create index if not exists thread_comments_thread_id_idx on public.thread_comments(thread_id);
create index if not exists thread_likes_user_id_idx on public.thread_likes(user_id);
create index if not exists threads_author_id_idx on public.threads(author_id);