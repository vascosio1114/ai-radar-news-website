import Image from "next/image";
import Link from "next/link";
import { Clock, Eye } from "lucide-react";
import type { Article } from "@/types";
import { timeAgo } from "@/lib/utils";
import { getLocalizedContent, getUIStrings, type Lang } from "@/lib/i18n";

const FALLBACK_COVER =
  "https://images.unsplash.com/photo-1677442136019-21780ecad995?w=1200&q=80";

export function ArticleCard({
  article,
  variant = "default",
  lang = "zh",
}: {
  article: Article;
  variant?: "default" | "featured" | "compact";
  lang?: Lang;
}) {
  const localized = getLocalizedContent(article, lang);
  const strings = getUIStrings(lang);
  const href = `/${lang}/news/${article.slug}`;

  if (variant === "featured") {
    return (
      <Link
        href={href}
        className="card-hover group relative block overflow-hidden rounded-3xl border border-ink-200/70 bg-white dark:border-ink-800/70 dark:bg-ink-900"
      >
        {article.cover_image && (
          <div className="relative aspect-[16/10] w-full overflow-hidden">
            <Image
              src={article.cover_image}
              alt={localized.title}
              fill
              sizes="(min-width: 1024px) 60vw, 100vw"
              className="object-cover transition duration-700 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
          </div>
        )}
        <div className="absolute bottom-0 left-0 right-0 p-6 md:p-8">
          <span className="mb-3 inline-flex items-center gap-1 rounded-full bg-accent-500/90 px-3 py-1 text-xs font-semibold text-white backdrop-blur">
            {article.category}
          </span>
          <h3 className="font-display text-2xl font-bold leading-tight text-white md:text-3xl">
            {localized.title}
          </h3>
          <p className="mt-2 line-clamp-2 max-w-2xl text-sm text-white/80">
            {localized.excerpt}
          </p>
          <div className="mt-4 flex items-center gap-4 text-xs text-white/70">
            <span>{timeAgo(article.published_at)}</span>
            <span className="inline-flex items-center gap-1">
              <Clock className="h-3.5 w-3.5" />
              {article.reading_time} {strings.minutes}
            </span>
            <span className="inline-flex items-center gap-1">
              <Eye className="h-3.5 w-3.5" />
              {article.views.toLocaleString()}
            </span>
          </div>
        </div>
      </Link>
    );
  }

  if (variant === "compact") {
    return (
      <Link
        href={href}
        className="group flex gap-4 rounded-2xl border border-transparent p-3 transition hover:border-ink-200 hover:bg-white dark:hover:border-ink-800 dark:hover:bg-ink-900"
      >
        {article.cover_image && (
          <div className="relative h-20 w-28 shrink-0 overflow-hidden rounded-xl">
            <Image
              src={article.cover_image}
              alt={localized.title}
              fill
              sizes="120px"
              className="object-cover transition duration-500 group-hover:scale-105"
            />
          </div>
        )}
        <div className="min-w-0 flex-1">
          <div className="mb-1 text-xs font-medium text-accent-600 dark:text-accent-400">
            {article.category}
          </div>
          <h4 className="line-clamp-2 text-sm font-semibold leading-snug">
            {localized.title}
          </h4>
          <div className="mt-2 text-xs text-ink-500 dark:text-ink-400">
            {timeAgo(article.published_at)}
          </div>
        </div>
      </Link>
    );
  }

  return (
    <Link
      href={href}
      className="card-hover group flex flex-col overflow-hidden rounded-2xl border border-ink-200/70 bg-white dark:border-ink-800/70 dark:bg-ink-900"
    >
      {article.cover_image && (
        <div className="relative aspect-[16/10] w-full overflow-hidden">
          <Image
            src={article.cover_image}
            alt={localized.title}
            fill
            sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
            className="object-cover transition duration-500 group-hover:scale-105"
          />
        </div>
      )}
      <div className="flex flex-1 flex-col gap-3 p-5">
        <div className="flex items-center gap-2 text-xs">
          <span className="rounded-full bg-accent-500/10 px-2.5 py-0.5 font-semibold text-accent-700 dark:text-accent-400">
            {article.category}
          </span>
          <span className="text-ink-500 dark:text-ink-400">
            {timeAgo(article.published_at)}
          </span>
        </div>
        <h3 className="line-clamp-2 font-display text-lg font-semibold leading-snug">
          {localized.title}
        </h3>
        <p className="line-clamp-2 text-sm text-ink-500 dark:text-ink-400">
          {localized.excerpt}
        </p>
        <div className="mt-auto flex items-center justify-between pt-2 text-xs text-ink-500 dark:text-ink-400">
          <span className="inline-flex items-center gap-1">
            <Clock className="h-3.5 w-3.5" />
            {article.reading_time} {strings.readTime}
          </span>
          <span className="inline-flex items-center gap-1">
            <Eye className="h-3.5 w-3.5" />
            {(article.views ?? 0).toLocaleString()}
          </span>
        </div>
      </div>
    </Link>
  );
}
