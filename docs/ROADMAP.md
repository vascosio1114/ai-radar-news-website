# Roadmap

## 階段 0 — MVP 模板（✅ 已完成）

- Next.js 14 + Tailwind + TypeScript scaffold
- Dark mode + theme toggle
- Navbar / Footer / Hero / 主要 sections
- News / Tools / Tutorials / Trends 頁
- Admin layout 雛型
- Mock 資料、SEO、sitemap、robots、loading skeleton、404

---

## 階段 1 — 接通 Supabase（下一步）

- [ ] 喺 Supabase 開 project + 跑 `docs/DATABASE.md` 嘅 SQL
- [ ] `src/app/page.tsx` / `news/page.tsx` / `tools/page.tsx` 全部用 server client 拎 data
- [ ] `news/[slug]` 改用 `await supabase.from('articles').select().eq('slug', params.slug).single()`
- [ ] Newsletter subscribe 落 `newsletter_subscribers` table
- [ ] Seed 5–10 篇文章、20+ 工具入 DB

---

## 階段 2 — Admin CRUD

- [ ] Supabase Auth (Email + Google) 登入
- [ ] `/admin` 加 middleware 檢查 `role = admin`
- [ ] 文章列表 + 新增 / 編輯 / 刪除 / 發佈
- [ ] 簡單 Markdown editor（用 `@uiw/react-md-editor`）
- [ ] 圖片上傳 → Supabase Storage `covers` bucket
- [ ] 工具管理（同樣 CRUD）
- [ ] 教學管理

---

## 階段 3 — 文章內容渲染強化

- [ ] `react-markdown` + `remark-gfm` 渲染 article content
- [ ] Code syntax highlight（`rehype-pretty-code` 或 shiki）
- [ ] Typography plugin（`@tailwindcss/typography`）
- [ ] 文章內 TOC（自動由 `##` 抽出）
- [ ] 文章 footer：作者卡 + 相關文章

---

## 階段 4 — 發掘 + 分頁

- [ ] News / Tools 加 server-side pagination
- [ ] News 全文搜尋（Postgres `tsvector` GIN index 或 Algolia）
- [ ] Category / tag filter URL state（`/news?category=...`）
- [ ] 文章 view counter（每次睇 increment）
- [ ] 「相關文章」推薦（用 tags overlap）

---

## 階段 5 — AI Chatbot

- [ ] 喺右下角開 floating chatbot
- [ ] 用我哋自己 articles 做 RAG（pgvector + embeddings）
- [ ] 經 `/api/chat` route handler stream 回應（`@anthropic-ai/sdk` 或 OpenAI SDK）
- [ ] 用 server-sent events / streaming response 即時 render

---

## 階段 6 — Monetization

廣告 + Affiliate + Premium 三條腿走。

### 廣告（最快收入）
- Google AdSense（被動收入，但要小心唔可以放太密令到 UX 差）
- Carbon Ads（科技 niche 廣告，質素高過 AdSense）

### Affiliate
- 每個 AI 工具加 ref code（ChatGPT Plus、Midjourney 等好多都有 affiliate）
- Tool 詳情頁 / 文章內 contextual link
- Newsletter 嵌入贊助 slot

### Premium content
- 「深度報告」每月一篇 paywall
- Newsletter 分免費 / Pro 兩 tier
- 用 Stripe + Supabase 嘅 customer table 管 subscription

### 其他
- 自家 Job Board（AI 公司放招聘廣告）
- Community / Discord paid tier
- 賣 prompt template / notion template

---

## 階段 7 — Growth + Quality

- [ ] RSS feed `/rss.xml`
- [ ] OG image 動態生成（用 `@vercel/og`）
- [ ] Internationalization（簡體 + English 版）
- [ ] PWA + Offline reading
- [ ] Analytics（Plausible 或 PostHog）
- [ ] Performance budget + Lighthouse CI

---

## 唔會做（At least for now）

- 用戶 UGC（comments / submit content）— 太多 moderation 工
- 自家 video player — 直接 embed YouTube
- Mobile native app — 等 PWA 先夠
