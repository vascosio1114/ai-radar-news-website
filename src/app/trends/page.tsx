import type { Metadata } from "next";
import { ArticleCard } from "@/components/cards/ArticleCard";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "趨勢分析",
  description: "AI 行業深度趨勢分析。",
};

export default async function TrendsPage() {
  const supabase = createSupabaseServerClient();
  const { data } = await supabase
    .from("articles_public")
    .select("*")
    .eq("is_published", true)
    .eq("category", "趨勢分析")
    .order("published_at", { ascending: false });

  const articles = data ?? [];

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
          唔係淨係報新聞。我哋幫你拆解每個動向背後嘅產業邏輯。
        </p>
      </header>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {articles.map((a) => (
          <ArticleCard key={a.id} article={a} lang="zh" />
        ))}
      </div>
    </div>
  );
}