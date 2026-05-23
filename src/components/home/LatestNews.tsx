import { ArticleCard } from "@/components/cards/ArticleCard";
import { SectionHeader } from "@/components/shared/SectionHeader";
import type { Article } from "@/types";
import { getUIStrings, type Lang } from "@/lib/i18n";

export function LatestNews({
  articles,
  lang = "zh",
  featuredOnly = false,
}: {
  articles: Article[];
  lang?: Lang;
  featuredOnly?: boolean;
}) {
  const s = getUIStrings(lang);

  return (
    <section className="container-page section-pad">
      <SectionHeader
        eyebrow={s.latestNews}
        title={s.latestNewsTitle}
        description={s.latestNewsDesc}
        href={`/${lang}/news`}
        cta={lang === "zh" ? "查看全部" : "View all"}
      />

      {featuredOnly ? (
        <div className="mx-auto max-w-5xl">
          {articles[0] ? (
            <ArticleCard article={articles[0]} variant="featured" lang={lang} />
          ) : (
            <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-8 text-sm text-ink-400">
              {lang === "zh" ? "暫未有已發佈文章。" : "No published articles yet."}
            </div>
          )}
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {articles.map((a) => (
            <ArticleCard key={a.id} article={a} lang={lang} />
          ))}
        </div>
      )}
    </section>
  );
}
