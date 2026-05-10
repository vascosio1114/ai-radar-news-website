import { Flame } from "lucide-react";
import { ArticleCard } from "@/components/cards/ArticleCard";
import { SectionHeader } from "@/components/shared/SectionHeader";
import type { Article } from "@/types";
import { getUIStrings, type Lang } from "@/lib/i18n";

export function TrendingNews({
  articles,
  lang = "zh",
}: {
  articles: Article[];
  lang?: Lang;
}) {
  if (!articles.length) return null;

  const s = getUIStrings(lang);
  const [hero, ...rest] = articles;
  const side = rest.slice(0, 3);

  return (
    <section className="container-page section-pad">
      <SectionHeader
        eyebrow={
          <span className="inline-flex items-center gap-1">
            <Flame className="h-3 w-3" />
            {s.trendingNews}
          </span>
        }
        title={s.trendingNewsTitle}
        description={s.trendingNewsDesc}
        href={`/${lang}/news`}
      />

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <ArticleCard article={hero} variant="featured" lang={lang} />
        </div>
        <div className="flex flex-col gap-2">
          {side.map((a) => (
            <ArticleCard key={a.id} article={a} variant="compact" lang={lang} />
          ))}
        </div>
      </div>
    </section>
  );
}
