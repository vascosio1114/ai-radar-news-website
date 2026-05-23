import type { Metadata } from "next";
import { ArticleCard } from "@/components/cards/ArticleCard";
import { MOCK_ARTICLES } from "@/data/mock";

export const metadata: Metadata = {
  title: "趨勢分析",
  description: "AI 行業深度趨勢分析。",
};

export default function TrendsPage() {
  const articles = MOCK_ARTICLES.filter((a) => a.category === "趨勢分析");

  return (
    <div className="container-page section-pad">
      <header className="mb-12 max-w-2xl">
        <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-accent-600 dark:text-accent-400">
          Trends
        </p>
        <h1 className="font-display text-4xl font-bold tracking-tight md:text-5xl">
          AI 趨勢分析
        </h1>
        <p className="mt-3 text-sm text-ink-500 dark:text-ink-400 md:text-base">
          我們不只整理新聞，更會拆解每個動態背後的產業邏輯。
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
