# Daily Dashboard

`/{lang}/dashboard` — public-facing 儀表板，由 `raw_items` table 直接 aggregate 出 stats。

## 用途

1. 用戶每日嘅 destination page（return 訪）
2. 你 + frd 睇 pipeline 健康狀態
3. 之後加 Newsletter cron 時嘅 data source

## 5 個 section

| Section          | 數據來源                                    |
| ---------------- | ------------------------------------------- |
| **StatsHero**    | 4 個 stat card + last fetch indicator       |
| **DailyChart**   | 過去 7 日每日 items count                    |
| **LatestFeed**   | 最新 12 條 raw_items + 來源 badge            |
| **SourceStatus** | 10 個 source 健康表（last fetch / error）   |

## 文件結構

```
src/
├── app/[lang]/dashboard/
│   └── page.tsx                       ← Server component, fetches data
├── components/dashboard/
│   ├── StatsHero.tsx
│   ├── DailyChart.tsx                 ← Pure CSS bar chart（唔需要 recharts）
│   ├── LatestFeed.tsx
│   └── SourceStatus.tsx
└── lib/dashboard/
    └── queries.ts                     ← 5 個 async Supabase query
```

## 性能

- Server Component + `revalidate = 60`：每 60 秒 ISR cache，唔會每次 hit DB
- 純 SQL aggregation，唔 call LLM
- 5 個 query parallel run

## 點 deploy

無新 env var，直接 push 上 GitHub → Vercel 自動 deploy。

唯一前提：`SUPABASE_SERVICE_ROLE_KEY` 已喺 Vercel env vars 度配好（之前 setup 過）。

## 未來加嘢

- [ ] 熱話題 keyword cluster（最 frequent 嘅 LLM model 名 / company 名）
- [ ] Newsletter cron 用呢 page 嘅 query 出 daily digest content
- [ ] 「今日睇咗幾多人」counter（加 page_views table）
- [ ] 用戶 customize：subscribe specific source / keyword
