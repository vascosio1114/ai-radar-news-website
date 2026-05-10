import { ArticleCard } from "@/components/cards/ArticleCard";
import { SectionHeader } from "@/components/shared/SectionHeader";
import type { Article } from "@/types";
import { getUIStrings, type Lang } from "@/lib/i18n";

export function LatestNews({
  articles,
  lang = "zh",
}: {
  articles: Article[];
  lang?: Lang;
}) {
  const s = getUIStrings(lang);

  return (
    <section className="container-page section-pad">
      <SectionHeader
        eyebrow={s.latestNews}
        title={s.latestNewsTitle}
        description={s.latestNewsDesc}
        href={`/${lang}/news`}
      />

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {articles.map((a) => (
          <ArticleCard key={a.id} article={a} lang={lang} />
        ))}
      </div>
    </section>
  );
}
