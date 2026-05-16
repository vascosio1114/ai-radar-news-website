# 用戶 Account 系統 setup

> Supabase Auth — Email/Password + Google OAuth。
> 登入之後可以 unlock 全文（配合 frd 個 `/summarize` route）。

---

## 1. Supabase Dashboard 設定

### 1a. Authentication → Providers → Email
- ✅ Enable Email provider（default）
- **建議 disable** "Confirm email"（減 signup friction）

### 1b. Authentication → Providers → Google
1. 撳 Google 開關 → enable
2. 個欄會 show 個 redirect URI（類似 `https://xxxx.supabase.co/auth/v1/callback`）— copy 出嚟
3. 開 https://console.cloud.google.com
4. 新建 Project → APIs & Services → **OAuth consent screen** → External → 填 app name `AI Radar` + email
5. APIs & Services → **Credentials** → Create Credentials → **OAuth 2.0 Client ID**
   - Application type: **Web application**
   - Authorized JavaScript origins: `http://localhost:3000`, `https://ai-radar-wheat.vercel.app`
   - Authorized redirect URIs: **paste Supabase 個 redirect URI**
6. Save → copy `Client ID` + `Client Secret`
7. 返 Supabase → Google provider → paste 入去 → Save

### 1c. Authentication → URL Configuration
設定：
- **Site URL**: `https://ai-radar-wheat.vercel.app`
- **Redirect URLs** 加：
  - `http://localhost:3000/**`
  - `https://ai-radar-wheat.vercel.app/**`

---

## 2. Database migration (跑喺 Supabase SQL Editor)

```sql
-- profiles table，每個 auth.users 對應一行
create table if not exists public.profiles (
  id          uuid references auth.users(id) on delete cascade primary key,
  display_name text,
  avatar_url  text,
  plan        text default 'free' check (plan in ('free', 'premium')),
  created_at  timestamptz default now(),
  updated_at  timestamptz default now()
);

-- 自動 create profile when user signs up
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, display_name, avatar_url)
  values (
    new.id,
    coalesce(
      new.raw_user_meta_data->>'full_name',
      new.raw_user_meta_data->>'name',
      split_part(new.email, '@', 1)
    ),
    new.raw_user_meta_data->>'avatar_url'
  )
  on conflict (id) do nothing;
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- RLS：用戶只可以睇 / 改自己嘅 profile
alter table public.profiles enable row level security;

drop policy if exists "Users can view own profile" on public.profiles;
create policy "Users can view own profile"
  on public.profiles for select
  using (auth.uid() = id);

drop policy if exists "Users can update own profile" on public.profiles;
create policy "Users can update own profile"
  on public.profiles for update
  using (auth.uid() = id);

drop policy if exists "Anyone can read public profile info" on public.profiles;
create policy "Anyone can read public profile info"
  on public.profiles for select
  using (true);  -- 之後想 private 嘅話 remove

-- (Optional) Bookmarks table，登入後可以收藏 article
create table if not exists public.bookmarks (
  user_id uuid references auth.users(id) on delete cascade,
  article_id uuid references public.articles(id) on delete cascade,
  created_at timestamptz default now(),
  primary key (user_id, article_id)
);

alter table public.bookmarks enable row level security;

drop policy if exists "Users manage own bookmarks" on public.bookmarks;
create policy "Users manage own bookmarks"
  on public.bookmarks for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);
```

驗證：
```sql
select count(*) from public.profiles;  -- 應該 0
```

---

## 3. Env vars（已有，唔需要加）

`NEXT_PUBLIC_SUPABASE_URL` + `NEXT_PUBLIC_SUPABASE_ANON_KEY` 已配好。

---

## 4. 測試

1. `npm run dev`
2. 開 http://localhost:3000/zh/signup
3. 用 email + password 註冊 → 應該 redirect 去 `/profile`
4. Supabase → Authentication → Users → 應該見到你 email
5. Supabase → Table editor → `profiles` → 應該見到一行
6. 試 `/zh/login` → 登出 → 重 login → work
7. 試 Google OAuth（如果 OAuth 配好咗）

---

## 5. 同 frd 個 `/summarize` 整合（之後做）

而家 frd 個 `UnlockFullArticleCTA` 應該 redirect 去 signup。等 auth foundation work，再 update 個 CTA。
