import { ArticleCard } from "@/components/cards/ArticleCard";
import { SectionHeader } from "@/components/shared/SectionHeader";
import type { Article } from "@/types";

export function LatestNews({ articles }: { articles: Article[] }) {
  return (
    <section className="container-page section-pad">
      <SectionHeader
        eyebrow="最新更新"
        title="最新 AI 新聞"
        description="不停更新，揀啱你嘅一篇 deep dive。"
        href="/news"
      />

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {articles.map((a) => (
          <ArticleCard key={a.id} article={a} />
        ))}
      </div>
    </section>
  );
}
