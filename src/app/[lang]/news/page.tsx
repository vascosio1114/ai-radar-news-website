import type { Metadata } from "next";
import { ArticleCard } from "@/components/cards/ArticleCard";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getUIStrings, hasEnglishDisplayContent, type Lang } from "@/lib/i18n";
import { DEFAULT_LANG } from "@/lib/site";

type Props = { params: { lang: string } };

export default async function NewsPage({ params }: Props) {
  const lang = (params.lang as Lang) ?? DEFAULT_LANG;
  const s = getUIStrings(lang);

  const supabase = createSupabaseServerClient();
  // Use articles_public to respect auth gating - unauthenticated users get masked content
  const { data } = await supabase
    .from("articles_public")
    .select("*")
    .order("published_at", { ascending: false });

  const articles = lang === "en"
    ? (data ?? []).filter((article) => hasEnglishDisplayContent(article, ["title", "excerpt", "category"]))
    : data ?? [];

  return (
    <div className="container-page section-pad">
      <header className="mb-12">
        <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-accent-600 dark:text-accent-400">
          AI Blog
        </p>
        <h1 className="font-display text-4xl font-bold tracking-tight md:text-5xl">
          {s.newsPageTitle}
        </h1>
        <p className="mt-3 max-w-2xl text-sm text-ink-500 dark:text-ink-400 md:text-base">
          {s.newsPageDesc}
        </p>
      </header>

      {articles.length > 0 ? (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {articles.map((a) => (
            <ArticleCard key={a.id} article={a} lang={lang} />
          ))}
        </div>
      ) : (
        <div className="rounded-3xl border border-ink-200/70 bg-white p-8 text-sm text-ink-500 dark:border-ink-800/70 dark:bg-ink-900 dark:text-ink-400">
          {lang === "zh" ? "目前尚未有已發佈文章。" : "No English articles are available yet."}
        </div>
      )}
    </div>
  );
}
