import { NextResponse } from "next/server";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Clock } from "lucide-react";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { containsCJK, getLocalizedContent, getUIStrings } from "@/lib/i18n";
import type { Lang } from "@/lib/site";
import { formatDate } from "@/lib/utils";
import { MOCK_ARTICLES } from "@/data/mock";
import MarkdownRenderer from "@/components/markdown/MarkdownRenderer";
import HtmlRenderer from "@/components/markdown/HtmlRenderer";
import { parseMarkdownHeadings } from "@/lib/markdown";
import TableOfContents from "@/components/markdown/TableOfContents";
import AuthorCard from "@/components/markdown/AuthorCard";
import RelatedArticles from "@/components/markdown/RelatedArticles";
import ViewCounter from "@/components/article/ViewCounter";

type Props = { params: { lang: string; slug: string } };

const STATIC_LANGS = ["zh", "en"] as const;

export async function generateStaticParams() {
  // Keep static params build-safe: request-scoped Supabase clients use cookies(),
  // which cannot run while Next.js is collecting static paths. Runtime pages still
  // fetch live articles from Supabase below.
  return STATIC_LANGS.flatMap((lang) =>
    MOCK_ARTICLES.map((article) => ({ lang, slug: article.slug }))
  );
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const lang = params.lang as Lang;
  const supabase = createSupabaseServerClient();
  // Use articles_public view for auth gating
  const { data: article } = await supabase
    .from("articles_public")
    .select("*")
    .eq("slug", params.slug)
    .single();

  if (!article) return {};
  const localized = getLocalizedContent(article, lang);
  return {
    title: localized.title,
    description: localized.excerpt,
    openGraph: {
      title: localized.title,
      description: localized.excerpt,
      images: [article.cover_image ?? ""],
      type: "article",
      publishedTime: article.published_at,
    },
  };
}

export default async function ArticlePage({ params }: Props) {
  const lang = params.lang as Lang;
  const ui = getUIStrings(lang);
  const supabase = createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();

  // If unauthenticated, redirect to summary version
  if (!user) {
    return NextResponse.redirect(`/${lang}/summarize/${params.slug}`);
  }

  // Use articles_public for auth-gated content - only get gated fields here
  const { data: article } = await supabase
    .from("articles_public")
    .select("*")
    .eq("slug", params.slug)
    .single();

  // For full content, query the articles table directly (authenticated RLS allows access)
  const { data: fullArticle } = await supabase
    .from("articles")
    .select("*")
    .eq("slug", params.slug)
    .single();

  // Merge: base article fields from articles_public, content from articles table
  const rawArticle = fullArticle
    ? { ...article, ...fullArticle }
    : article ?? null;

  if (!rawArticle) notFound();

  const localized = getLocalizedContent(rawArticle, lang);
  const articleContent = localized.content ?? null;

  // For en: show "unavailable" only if there is no English title/excerpt at all
  // (i.e. this is a Chinese-original article with no English translation)
  // If title/en/excerpt exist and are not CJK, treat as English-available even if content has some CJK
  const hasEnglishTitle = lang === "en"
    ? !!rawArticle.title && !containsCJK(rawArticle.title)
    : true;
  const hasEnglishExcerpt = lang === "en"
    ? !!rawArticle.excerpt && !containsCJK(rawArticle.excerpt)
    : true;
  const englishUnavailable =
    lang === "en" && (!hasEnglishTitle || !hasEnglishExcerpt);

  const tocItems = articleContent && !englishUnavailable ? parseMarkdownHeadings(articleContent) : [];

  return (
    <article className="container-page section-pad">
      <Link
        href={`/${params.lang}/news`}
        className="mb-6 inline-flex items-center gap-1 text-sm text-ink-500 transition hover:text-accent-600 dark:text-ink-400 dark:hover:text-accent-400"
      >
        <ArrowLeft className="h-4 w-4" />
        {ui.backToNews}
      </Link>

      <header className="mx-auto max-w-3xl">
        <span className="rounded-full bg-accent-500/10 px-3 py-1 text-xs font-semibold text-accent-700 dark:text-accent-400">
          {englishUnavailable ? "AI Article" : localized.category ?? rawArticle.category ?? ""}
        </span>
        <h1 className="mt-4 font-display text-3xl font-bold leading-tight md:text-5xl">
          {englishUnavailable ? "English version unavailable" : localized.title ?? rawArticle.title ?? ""}
        </h1>
        <p className="mt-4 text-base text-ink-500 dark:text-ink-400 md:text-lg">
          {englishUnavailable ? "This article has not been prepared in English yet." : localized.excerpt ?? rawArticle.excerpt ?? ""}
        </p>
        <div className="mt-6 flex flex-wrap items-center gap-6 text-xs text-ink-500 dark:text-ink-400">
          <span>{localized.author ?? rawArticle.author ?? ""}</span>
          <span>{formatDate(localized.published_at ?? rawArticle.published_at ?? new Date().toISOString())}</span>
          <span className="inline-flex items-center gap-1">
            <Clock className="h-3.5 w-3.5" />
            {localized.reading_time ?? rawArticle.reading_time ?? 0} {ui.minRead}
          </span>
          <ViewCounter
            slug={params.slug}
            initialViews={localized.views ?? rawArticle.views ?? 0}
          />
        </div>
        {(localized.tags?.length ?? rawArticle.tags?.length ?? 0) > 0 && (
          <div className="mt-4 flex flex-wrap gap-2">
            {(localized.tags ?? rawArticle.tags ?? []).map((tag: string) => (
              <span
                key={tag}
                className="rounded-full bg-ink-100 px-2.5 py-0.5 text-xs text-ink-600 dark:bg-ink-800 dark:text-ink-300"
              >
                {tag}
              </span>
            ))}
          </div>
        )}
      </header>

      {englishUnavailable ? (
        <div className="mx-auto mt-10 max-w-3xl rounded-3xl border border-ink-200/70 bg-white p-8 text-sm leading-6 text-ink-600 dark:border-ink-800/70 dark:bg-ink-900 dark:text-ink-300">
          This article is not available in English yet. Please switch to the Chinese version or return to the article list.
        </div>
      ) : null}

      {!englishUnavailable && rawArticle.cover_image && (
        <div className="relative mx-auto mt-10 aspect-[16/9] w-full max-w-5xl overflow-hidden rounded-3xl">
          <Image
            src={rawArticle.cover_image}
            alt={localized.title ?? rawArticle.title ?? ""}
            fill
            priority
            sizes="(min-width: 1024px) 1024px, 100vw"
            className="object-cover"
          />
        </div>
      )}

      <div className="mx-auto mt-12 max-w-6xl">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1fr_240px]">
          <div className="min-w-0">
            {englishUnavailable ? null : localized.content_html ? (
              <HtmlRenderer content={localized.content_html} />
            ) : articleContent ? (
              <MarkdownRenderer content={articleContent} />
            ) : (
              <div className="prose prose-ink dark:prose-invert mx-auto max-w-3xl">
                <p className="text-ink-500 dark:text-ink-400">
                  {ui.contentPreparing}
                </p>
              </div>
            )}

            {!englishUnavailable && <AuthorCard name={localized.author ?? rawArticle.author ?? "Editorial Team"} lang={lang} />}
          </div>

          <aside className="hidden lg:block">
            <div className="sticky top-24">
              <TableOfContents items={tocItems} lang={lang} />
            </div>
          </aside>
        </div>

        <div className="mt-12 border-t border-ink-200 pt-8 dark:border-ink-800">
          {!englishUnavailable && (
            <RelatedArticles currentSlug={params.slug} lang={lang} category={localized.category ?? ""} />
          )}
        </div>
      </div>
    </article>
  );
}