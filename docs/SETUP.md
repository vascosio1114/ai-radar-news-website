# Setup 指引（你 + 朋友 step-by-step）

呢份 doc 會帶你由「電腦得個 zip」一直去到「網站 live 喺互聯網上」。

---

## Part A：本機 setup（你做一次）

### 1. 將 project 搬入你嘅 dev folder

例如你 dev folder 喺 `~/dev/`：

```bash
mkdir -p ~/dev
mv ~/Downloads/ai-radar ~/dev/ai-radar
cd ~/dev/ai-radar
```

> ⚠️ 路徑改用你自己嘅。Cowork 將檔案放咗喺 outputs folder，你只需要將個 `ai-radar` folder 整個搬出嚟。

### 2. 安裝 dependencies

```bash
npm install
```

### 3. 起 dev server

```bash
npm run dev
```

開 http://localhost:3000，應該已經睇到首頁、News、Tools、Tutorials、Admin 全部運作。
（用緊 `src/data/mock.ts` 嘅假資料）

---

## Part B：開 GitHub repo + 兩個人合作

### 1. 喺 GitHub 開新 repo

1. 上 https://github.com/new
2. Repository name：`ai-radar`（或你改嘅名）
3. Visibility：揀 **Private**（之後想公開再轉都得）
4. **唔好** check 「Add README / .gitignore / license」 — 我哋本機已經有
5. 撳 **Create repository**

GitHub 會 show 你一段 push 指令，類似：

```
git@github.com:your-username/ai-radar.git
```

複製個 URL 留住。

### 2. 喺本機 init Git + push 上去

喺 project 根目錄執行：

```bash
cd ~/dev/ai-radar

# 第一次先要 init
git init
git branch -M main

# 將所有檔案加入第一次 commit
git add .
git commit -m "feat: initial scaffold (Next.js + Tailwind + Supabase)"

# 連去 GitHub remote（記得換成你自己嘅 URL）
git remote add origin git@github.com:your-username/ai-radar.git

# 推上去
git push -u origin main
```

> 用 HTTPS URL 都得，但建議用 SSH key（Mac：`ssh-keygen -t ed25519` → 將 `~/.ssh/id_ed25519.pub` 內容貼上 GitHub Settings → SSH keys）。

### 3. 加你朋友做 collaborator

GitHub repo → **Settings** → **Collaborators** → **Add people** → 輸入佢個 GitHub username/email → Send invite。
佢 accept 之後就可以 push 落 repo。

### 4. 你朋友個邊本機點 setup

```bash
git clone git@github.com:your-username/ai-radar.git
cd ai-radar
npm install
cp .env.local.example .env.local   # 填同你一樣嘅 Supabase keys
npm run dev
```

---

## Part C：Branch + PR workflow（推薦俾兩個人用）

```bash
# 開新 feature
git checkout main
git pull
git checkout -b feat/article-detail-page

# 寫 code → 測試 → commit
git add .
git commit -m "feat: render markdown content on article page"

# Push branch
git push -u origin feat/article-detail-page
```

去 GitHub → **Pull requests** → **New PR** → base `main` ← compare `feat/...` →
寫個簡短 description → 揀對方做 reviewer → **Create PR**。

對方 review，「Approve」之後撳 **Merge**。
Vercel 喺 PR 階段會自動 build 個 preview URL，可以即時 demo。

> Tip：兩個人開 PR 時，建議要對方 approve 至 merge，避免 conflict 同 bug 直接落 main。

---

## Part D：Supabase setup

### 1. 開 project

1. 上 https://supabase.com → **New project**
2. 名：`ai-radar`，地區揀亞太區（Tokyo / Singapore）
3. 設一個 strong DB password（save 喺 password manager）

### 2. 拎 keys

Project Settings → **API**，複製：

- `Project URL` → `NEXT_PUBLIC_SUPABASE_URL`
- `anon public` key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `service_role` key → `SUPABASE_SERVICE_ROLE_KEY`（**唔好 leak 出 client**）

貼入 `.env.local`（呢個檔案唔會被 commit，因為 `.gitignore` 已經擋咗）。

### 3. 建 schema

Supabase Studio → **SQL Editor** → New query → 將 [`docs/DATABASE.md`](DATABASE.md)
入面 section 1–7 嘅 SQL 一段段 paste 入去 → Run。

### 4. 將 mock 換做真資料

喺 `src/app/page.tsx` 入面，將：

```tsx
import { MOCK_ARTICLES, MOCK_TOOLS } from "@/data/mock";

export default function HomePage() {
  const featured = MOCK_ARTICLES.filter((a) => a.is_featured).slice(0, 4);
  // ...
}
```

換成：

```tsx
import { createSupabaseServerClient } from "@/lib/supabase/server";

export default async function HomePage() {
  const supabase = createSupabaseServerClient();

  const { data: featured } = await supabase
    .from("articles")
    .select("*")
    .eq("is_featured", true)
    .eq("is_published", true)
    .order("published_at", { ascending: false })
    .limit(4);

  const { data: latest } = await supabase
    .from("articles")
    .select("*")
    .eq("is_published", true)
    .order("published_at", { ascending: false })
    .limit(6);

  const { data: trendingTools } = await supabase
    .from("tools")
    .select("*")
    .eq("is_trending", true)
    .limit(4);

  return (
    <>
      <Hero />
      <TrendingNews articles={featured ?? []} />
      <LatestNews articles={latest ?? []} />
      <TrendingTools tools={trendingTools ?? []} />
      <Newsletter />
    </>
  );
}
```

---

## Part E：Deploy 上 Vercel

### 1. 連 GitHub

1. 上 https://vercel.com → **Add New** → **Project**
2. **Import** 你頭先 push 嗰個 repo
3. Framework preset：Vercel 會自動偵測到 Next.js

### 2. 填 environment variables

喺 Vercel project 嘅 **Settings → Environment Variables** 加：

| Key                           | Value                  |
| ----------------------------- | ---------------------- |
| `NEXT_PUBLIC_SUPABASE_URL`    | （你 Supabase URL）    |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | （anon key）         |
| `SUPABASE_SERVICE_ROLE_KEY`   | （service role key）   |
| `NEXT_PUBLIC_SITE_URL`        | `https://你domain.com` |
| `NEXT_PUBLIC_SITE_NAME`       | `AI Radar`（或新名）   |

### 3. Deploy

撳 **Deploy**。第一次大約 2 分鐘。
之後每次 push 上 GitHub `main`，Vercel 自動 deploy。
每個 PR 都會 build 一個 preview URL，方便 review。

### 4. 自訂 domain（之後）

Vercel project → **Settings → Domains** → Add domain → 跟住佢指引改你 domain registrar 嘅 DNS 就得。

---

## Cheat sheet

```bash
# 每次開工
git checkout main && git pull
git checkout -b feat/your-branch
npm run dev

# 寫完
git add .
git commit -m "feat: ..."
git push -u origin feat/your-branch
# → 上 GitHub 開 PR

# 唔記得依家係咩 branch
git status

# 唔小心 push 咗錯嘢，未 merge 之前
git reset --soft HEAD~1   # undo last commit, 保留改動

# 整 conflict
git fetch origin
git rebase origin/main
# → 解 conflict → git add . → git rebase --continue → git push --force-with-lease
```
