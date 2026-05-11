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

## 🎯 Content Strategy：30 Content Types × 10 Writing Styles

This app is built to deliver AI content that makes readers feel urgency and fear of being left behind — and belief that subscribing is the only salvation.

### 30 Content Types

| Category | Types |
|---|---|
| **資訊差轟炸型** | AI 新聞快報 · 本週殺手級新工具 · 內幕爆料 · 週報 |
| **AI 工具／模型評測型** | 模型對比實測 · 工具上手 SOP · 垂直場景選型 · 小眾寶藏工具 |
| **AI 使用案例型** | 一人公司／副業 · 職場效率 · 創業者 · 轉型 |
| **Prompt 工程／實作型** | Prompt 模板大全 · AI 不聽話解決 · 多代理流程 · 自動化 workflow |
| **恐懼心理學型** | 趨勢預警 · 落後指標 · 世代對比 · 焦慮放大鏡 |
| **爭議／挑釁型** | 對立立場 · 大膽預測 · 命題式宣言 |
| **資源整理型** | 免費／付費資源大全 |
| **AI 自主意識與毀滅風險** | 學術觀點 · Doomsday 理論 · 超級智能時間線 · 意識 vs 智慧 · 思想實驗 · 安全技術路線 · 支持者 vs 反對者 |
| **AI 道德倫理** | 歧視與偏見 · 隱私監控 · 生成內容責任 · 工作取代 · 武器化倫理 · 學術審查 · 企業道德框架 · 數位落差 · 政府監管 |

### 10 Writing Styles

| Style | Core Emotion | Opening | Ending |
|---|---|---|---|
| **末日倒數體** | 生理級急迫感 | 時間炸彈引爆 | 逃生指令 |
| **說書人懸疑體** | 黑暗中摸索 | 反常場景鉤子 | 懸念深化 |
| **職場鞭屍體** | 刺痛、嫉妒 | 身份鏡像定位 | 威脅預測 |
| **學術劊子手體** | 冷靜恐懼 | 尖銳研究提問 | 無解之論 |
| **憤世嫉俗揭密體** | 義憤、信任 | 指控開場 | 自行判斷 |
| **清單轟炸體** | 資訊焦慮 | 無開場，直接轟炸 | 沉重總結 |
| **教授開書單體** | 學習、信賴 | 課程主題宣告 | 課後任務 |
| **創業教父體** | 嫉妒、鬥志 | 成果炫耀 | 行動命令 |
| **黑色幽默體** | 苦笑、刺痛 | 荒謬場景 | 悲劇真相 |
| **學長姐情書體** | 溫暖、愧疚 | 共情理解 | 溫柔推動 |

### Core Writing Rules

- **Verb arsenal**: 炸裂、腰斬、封堵、取代、翻轉、入侵
- **Time locks**（每段必備）: 今天上午、午夜前、本週內、就在剛才
- **Forbidden words**: 值得關注、未來可期、或將、據傳、有分析認為
- **Sentence rhythm**: 70% 不超過 15 字；每段平均 2.5 句
- **Data weaponization**: 將數據加工成「後果」而非裸數字（例如「3000 人今早發現門禁卡失效了」）
- **Ending rule**: 不總結，只給行動指令或留下抓心撓肝的懸念

---

## 🤝 Contributing（俾你同朋友 collab 嘅 workflow）

1. `git clone` repo 落本機
2. `git checkout -b feat/xxx` 開 feature branch
3. Code → commit → push
4. 喺 GitHub 開 Pull Request → 對方 review → merge 入 `main`
5. Vercel 自動 deploy

詳情見 [`docs/SETUP.md`](docs/SETUP.md)。
