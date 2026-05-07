# AI Radar — 中文 AI 最新資訊網站

> 一個用 Next.js 14 (App Router) + Tailwind CSS + Supabase 起嘅
> 繁體中文 AI 新聞、工具、教學、趨勢分析平台。

`AI Radar` 係 placeholder 名，最後可以改做 `AI Pulse / AI Daily / AI 滙 / AI 浪` 等。
搜全 codebase 嘅 `AI Radar` 同 `ai-radar` 一次過 rename 即可。

---

## ✨ Features

- 黑白灰 + 科技藍 high-end design（Apple + OpenAI + Notion 風）
- Dark mode（預設深色，one-click 切換）
- Glassmorphism + grid 背景 + glow + hover animation
- Responsive：手機到 desktop 都靚
- SEO ready：metadata、Open Graph、sitemap、robots、structured fonts
- Supabase 接通即用（Auth + Postgres + Storage）
- Markdown article 支援
- Loading skeleton + 404 自訂頁
- 後台 Admin dashboard 雛型

---

## 🧭 Quick start

```bash
# 1. 入 project 目錄
cd ai-radar

# 2. 安裝 dependencies
npm install

# 3. 複製 .env，填入 Supabase keys
cp .env.local.example .env.local

# 4. 起 dev server
npm run dev
# → http://localhost:3000
```

未連 Supabase 都行得：所有頁面用 `src/data/mock.ts` 嘅假資料 render。
連通 Supabase 之後，唯一要改嘅係 `page.tsx` 入面用 `createSupabaseServerClient()` 取代 mock import。

---

## 📁 Folder structure

```
ai-radar/
├── public/
│   └── favicon.svg
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── layout.tsx          # Root layout (font / theme / nav / footer)
│   │   ├── page.tsx            # Homepage
│   │   ├── globals.css         # Tailwind + design tokens
│   │   ├── loading.tsx         # 全域 loading skeleton
│   │   ├── not-found.tsx       # 404 頁
│   │   ├── sitemap.ts          # /sitemap.xml
│   │   ├── robots.ts           # /robots.txt
│   │   ├── news/
│   │   │   ├── page.tsx        # 列表
│   │   │   └── [slug]/page.tsx # 內文
│   │   ├── tools/page.tsx      # AI 工具（含 category filter）
│   │   ├── tutorials/page.tsx  # AI 教學
│   │   ├── trends/page.tsx     # 趨勢分析
│   │   ├── admin/
│   │   │   ├── layout.tsx
│   │   │   └── page.tsx        # Dashboard 雛型
│   │   └── api/
│   │       └── newsletter/route.ts
│   ├── components/
│   │   ├── layout/             # Navbar, Footer
│   │   ├── home/               # Hero, TrendingNews, LatestNews, ...
│   │   ├── cards/              # ArticleCard, ToolCard
│   │   ├── shared/             # ThemeToggle, SectionHeader
│   │   └── providers/          # ThemeProvider
│   ├── lib/
│   │   ├── site.ts             # SITE_NAME / NAV_ITEMS / categories
│   │   ├── utils.ts            # cn(), formatDate(), timeAgo()
│   │   └── supabase/
│   │       ├── client.ts       # browser client
│   │       └── server.ts       # server client
│   ├── types/index.ts          # Article / Tool / Tutorial types
│   └── data/mock.ts            # 假資料（之後刪 / 留作 dev seed）
├── docs/
│   ├── ARCHITECTURE.md
│   ├── DATABASE.md             # Supabase SQL schema + RLS
│   ├── SETUP.md                # GitHub + Vercel + Supabase setup
│   └── ROADMAP.md
├── .env.local.example
├── next.config.mjs
├── tailwind.config.ts
├── tsconfig.json
└── package.json
```

---

## 🗺️ Roadmap

- [x] Phase 0：UI 模板 + mock data
- [ ] Phase 1：接通 Supabase（articles / tools / tutorials / newsletter table）
- [ ] Phase 2：Admin CRUD（Supabase Auth + RLS + 上傳封面圖）
- [ ] Phase 3：Markdown 文章渲染（react-markdown + remark-gfm + syntax highlight）
- [ ] Phase 4：搜尋（Postgres full-text 或 Algolia）+ 分類分頁
- [ ] Phase 5：AI Chatbot（用我哋自己 article 做 RAG）
- [ ] Phase 6：Monetization（廣告位 + affiliate + premium content）

詳情見 [`docs/ROADMAP.md`](docs/ROADMAP.md)。

---

## 🤝 Contributing（俾你同朋友 collab 嘅 workflow）

1. `git clone` repo 落本機
2. `git checkout -b feat/xxx` 開 feature branch
3. Code → commit → push
4. 喺 GitHub 開 Pull Request → 對方 review → merge 入 `main`
5. Vercel 自動 deploy

詳情見 [`docs/SETUP.md`](docs/SETUP.md)。
