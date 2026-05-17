import { NextResponse } from "next/server";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Clock, Eye } from "lucide-react";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getLocalizedContent, getUIStrings } from "@/lib/i18n";
import type { Lang } from "@/lib/site";
import { formatDate } from "@/lib/utils";
import { MOCK_ARTICLES } from "@/data/mock";
import MarkdownRenderer from "@/components/markdown/MarkdownRenderer";
import HtmlRenderer from "@/components/markdown/HtmlRenderer";
import { parseMarkdownHeadings } from "@/lib/markdown";
import TableOfContents from "@/components/markdown/TableOfContents";
import AuthorCard from "@/components/markdown/AuthorCard";
import RelatedArticles from "@/components/markdown/RelatedArticles";

type Props = { params: { lang: string; slug: string } };

export async function generateStaticParams() {
  return MOCK_ARTICLES.map((a) => ({ slug: a.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const lang = params.lang as Lang;
  const supabase = createSupabaseServerClient();
  const { data: article } = await supabase
    .from("articles")
    .select("*")
    .eq("slug", params.slug)
    .eq("is_published", true)
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

  const { data: article } = await supabase
    .from("articles")
    .select("*")
    .eq("slug", params.slug)
    .eq("is_published", true)
    .single();

  const mockArticle = MOCK_ARTICLES.find((a) => a.slug === params.slug);
  const rawArticle = article ?? mockArticle ?? null;

  if (!rawArticle) notFound();

  const localized = getLocalizedContent(rawArticle, lang);
  const articleContent = localized.content ?? null;

  const tocItems = articleContent ? parseMarkdownHeadings(articleContent) : [];

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
          {localized.category ?? rawArticle.category ?? ""}
        </span>
        <h1 className="mt-4 font-display text-3xl font-bold leading-tight md:text-5xl">
          {localized.title ?? rawArticle.title ?? ""}
        </h1>
        <p className="mt-4 text-base text-ink-500 dark:text-ink-400 md:text-lg">
          {localized.excerpt ?? rawArticle.excerpt ?? ""}
        </p>
        <div className="mt-6 flex flex-wrap items-center gap-6 text-xs text-ink-500 dark:text-ink-400">
          <span>{localized.author ?? rawArticle.author ?? ""}</span>
          <span>{formatDate(localized.published_at ?? rawArticle.published_at ?? new Date().toISOString())}</span>
          <span className="inline-flex items-center gap-1">
            <Clock className="h-3.5 w-3.5" />
            {localized.reading_time ?? rawArticle.reading_time ?? 0} {ui.minRead}
          </span>
          <span className="inline-flex items-center gap-1">
            <Eye className="h-3.5 w-3.5" />
            {(localized.views ?? rawArticle.views ?? 0).toLocaleString()}
          </span>
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

      {rawArticle.cover_image && (
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
            {localized.content_html ? (
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

            <AuthorCard name={localized.author ?? rawArticle.author ?? "Editorial Team"} />
          </div>

          <aside className="hidden lg:block">
            <div className="sticky top-24">
              <TableOfContents items={tocItems} />
            </div>
          </aside>
        </div>

        <div className="mt-12 border-t border-ink-200 pt-8 dark:border-ink-800">
          <RelatedArticles
            articles={MOCK_ARTICLES}
            currentSlug={params.slug}
            lang={lang}
          />
        </div>
      </div>
    </article>
  );
}