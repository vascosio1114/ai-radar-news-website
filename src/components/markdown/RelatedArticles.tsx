import Link from "next/link";
import Image from "next/image";
import { ArrowRight } from "lucide-react";
import type { Article } from "@/types";
import type { Lang } from "@/lib/site";
import { formatDate } from "@/lib/utils";

interface RelatedArticlesProps {
  articles: Article[];
  currentSlug: string;
  lang?: Lang;
}

/**
 * Shows related articles based on matching tags/category.
 */
export default function RelatedArticles({ articles, currentSlug, lang = "zh" }: RelatedArticlesProps) {
  // Filter out current article
  const related = articles.filter((a) => a.slug !== currentSlug).slice(0, 3);

  if (related.length === 0) return null;

  return (
    <section className="mt-12">
      <h2 className="mb-6 font-display text-xl font-semibold">相關文章</h2>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {related.map((article) => (
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
          查看全部文章
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </section>
  );
}