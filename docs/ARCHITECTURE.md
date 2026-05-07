# Architecture

## Tech stack

| Layer        | Tech                                              | 點解揀佢                          |
| ------------ | ------------------------------------------------- | --------------------------------- |
| Framework    | Next.js 14 (App Router)                           | SSR / SSG / ISR、SEO 友善         |
| Language     | TypeScript 5                                      | Type safety + better refactoring  |
| Styling      | Tailwind CSS 3.4 + custom tokens                  | Utility-first，速度同 consistency |
| UI patterns  | Glassmorphism, grid backdrop, gradient            | 高級科技感                        |
| Icons        | lucide-react                                      | 輕量、線條風配 Apple/Notion       |
| Fonts        | Inter (sans) + Space Grotesk (display) + JetBrains Mono | next/font 自動 host + subset |
| Theme        | next-themes                                       | dark/light mode + 系統偵測        |
| DB / Auth    | Supabase (Postgres + Auth + Storage)              | Open source、即用、免費 tier 大方 |
| Animations   | Tailwind keyframes + framer-motion (optional)     | 簡單動畫毋須 JS lib，複雜時加 motion |
| Markdown     | react-markdown + remark-gfm                       | 渲染後台寫嘅文章                  |
| Deploy       | Vercel                                            | Next.js 親生仔，免費 + 快         |

## 應用層分層

```
[ Browser ]
    │
    ├── Static assets (images, favicon)
    │
    ▼
[ Vercel Edge / Node ]
    │
    ├── Server Components (拎 articles 列表 / 文章內文)
    │       └─► Supabase Postgres (anon key + RLS)
    │
    ├── Client Components (Theme toggle, filter tabs, newsletter form)
    │
    └── Route Handlers /api/*
            ├── /api/newsletter   → write to subscribers table
            └── /api/admin/*      → 將來嘅 CRUD endpoints
```

## Component layering

```
app/             ← route shells，只做 data fetching + composition
  └─ home/page.tsx
       │
components/home/ ← 特定 page 嘅 section components (Hero, TrendingNews...)
       │
components/cards/  ← presentational cards (ArticleCard, ToolCard)
       │
components/shared/ ← 跨 page 嘅 small UI (SectionHeader, ThemeToggle)
       │
components/providers/ ← context providers (ThemeProvider)
       │
components/layout/ ← App-wide layout (Navbar, Footer)
```

## Data flow rules

1. **Server Components 預設**：所有 page.tsx + section components 預設係 server 邊 render，會拎 data。
2. **加 `"use client"` 嘅情況**：
   - 用到 `useState` / `useEffect` / `useTheme`
   - 接 user event（onClick, onChange）
   - 例子：`Navbar.tsx`、`ThemeToggle.tsx`、`Newsletter.tsx`、`ToolsPage`（filter tabs）
3. **Mock → Supabase migration**：所有 page.tsx 入面 `MOCK_*` import，下一階段全部換成
   `const supabase = createSupabaseServerClient(); const { data } = await supabase...`。

## SEO

- `app/layout.tsx` 設定 default metadata + OG image + locale `zh_HK`
- 每個 page export `generateMetadata` 或 `metadata` 自定 title/description
- `sitemap.ts` 自動生成 `/sitemap.xml`
- `robots.ts` 阻擋 `/admin` 同 `/api`
- 文章內文用 `<article>` semantic tag
- `JSON-LD`（之後加）—— 喺 article 頁 inject Article schema
