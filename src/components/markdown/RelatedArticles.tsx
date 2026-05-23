import Link from "next/link";
import Image from "next/image";
import { ArrowRight } from "lucide-react";
import type { Lang } from "@/lib/site";
import { formatDate } from "@/lib/utils";
import { createSupabaseServerClient } from "@/lib/supabase/server";

interface RelatedArticlesProps {
  currentSlug: string;
  lang?: Lang;
  category?: string;
}

/**
 * Shows related articles based on matching category, fetched from DB.
 */
export default async function RelatedArticles({ currentSlug, lang = "zh", category }: RelatedArticlesProps) {
  const supabase = createSupabaseServerClient();
  const { data: articles } = category
    ? await supabase
        .from("articles_public")
        .select("id, slug, title, cover_image, category, published_at, is_published")
        .eq("is_published", true)
        .neq("slug", currentSlug)
        .limit(6)
    : await supabase
        .from("articles_public")
        .select("id, slug, title, cover_image, category, published_at, is_published")
        .eq("is_published", true)
        .neq("slug", currentSlug)
        .limit(3);

  const filtered = (articles ?? []).filter((a) => a.slug !== currentSlug).slice(0, 3);

  if (filtered.length === 0) return null;

  return (
    <section className="mt-12">
      <h2 className="mb-6 font-display text-xl font-semibold">{lang === "zh" ? "相關文章" : "Related articles"}</h2>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map((article) => (
          <Link
            key={article.id}
            href={`/${lang}/news/${article.slug}`}
            className="group block rounded-xl border border-ink-200 bg-white transition-shadow hover:shadow-soft dark:border-ink-800 dark:bg-ink-900"
          >
            <div className="relative aspect-[16/9] overflow-hidden rounded-t-xl">
              {article.cover_image && (
                <Image
                  src={article.cover_image}
                  alt={article.title}
                  fill
                  sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                  className="object-cover transition-transform duration-300 group-hover:scale-105"
                />
              )}
            </div>
            <div className="p-4">
              <span className="text-xs font-medium text-accent-600 dark:text-accent-400">
                {article.category}
              </span>
              <h3 className="mt-1 line-clamp-2 font-display text-base font-semibold group-hover:text-accent-600 dark:group-hover:text-accent-400">
                {article.title}
              </h3>
              <p className="mt-1 text-xs text-ink-500 dark:text-ink-400">
                {formatDate(article.published_at)}
              </p>
            </div>
          </Link>
        ))}
      </div>
      <div className="mt-6 text-center">
        <Link
          href={`/${lang}/news`}
          className="inline-flex items-center gap-1 text-sm font-medium text-accent-600 transition hover:text-accent-700 dark:text-accent-400 dark:hover:text-accent-300"
        >
          {lang === "zh" ? "查看全部文章" : "View all articles"}
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </section>
  );
}