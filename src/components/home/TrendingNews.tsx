import { Flame } from "lucide-react";
import { ArticleCard } from "@/components/cards/ArticleCard";
import { SectionHeader } from "@/components/shared/SectionHeader";
import type { Article } from "@/types";

export function TrendingNews({ articles }: { articles: Article[] }) {
  if (!articles.length) return null;

  const [hero, ...rest] = articles;
  const side = rest.slice(0, 3);

  return (
    <section className="container-page section-pad">
      <SectionHeader
        eyebrow={
          <span className="inline-flex items-center gap-1">
            <Flame className="h-3 w-3" />
            今日熱門
          </span>
        }
        title="今日 AI 熱門"
        description="編輯精選，最值得知嘅 AI 動向。"
        href="/news"
      />

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <ArticleCard article={hero} variant="featured" />
        </div>
        <div className="flex flex-col gap-2">
          {side.map((a) => (
            <ArticleCard key={a.id} article={a} variant="compact" />
          ))}
        </div>
      </div>
    </section>
  );
}
