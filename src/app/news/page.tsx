import type { Metadata } from "next";
import { ArticleCard } from "@/components/cards/ArticleCard";
import { MOCK_ARTICLES } from "@/data/mock";

export const metadata: Metadata = {
  title: "AI 新聞",
  description: "最新 AI 業界動向，每日更新。",
};

export default function NewsPage() {
  // TODO: 用 Supabase server client 取代
  const articles = MOCK_ARTICLES;

  return (
    <div className="container-page section-pad">
      <header className="mb-12">
        <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-accent-600 dark:text-accent-400">
          AI News
        </p>
        <h1 className="font-display text-4xl font-bold tracking-tight md:text-5xl">
          最新 AI 新聞
        </h1>
        <p className="mt-3 max-w-2xl text-sm text-ink-500 dark:text-ink-400 md:text-base">
          編輯團隊每日整理嘅 AI 新聞。由 model release 到產業動向，一個地方睇齊。
        </p>
      </header>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {articles.map((a) => (
          <ArticleCard key={a.id} article={a} />
        ))}
      </div>
    </div>
  );
}
