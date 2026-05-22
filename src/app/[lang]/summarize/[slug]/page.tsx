import { NextResponse } from "next/server";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getLocalizedContent, getUIStrings } from "@/lib/i18n";
import type { Lang } from "@/lib/site";
import { formatDate } from "@/lib/utils";
import { MOCK_ARTICLES } from "@/data/mock";
import HtmlRenderer from "@/components/markdown/HtmlRenderer";
import UnlockFullArticleCTA from "@/components/summarize/UnlockFullArticleCTA";

type Props = { params: { lang: string; slug: string } };

export async function generateStaticParams() {
  // Fetch all published article slugs from DB for static generation
  const supabase = createSupabaseServerClient();
  const { data: article } = await supabase
    .from("articles_public")
    .select("slug")
    .eq("is_published", true);

  return (article ?? MOCK_ARTICLES).map((a) => ({ slug: a.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const lang = params.lang as Lang;
  const supabase = createSupabaseServerClient();
  const { data: article } = await supabase
    .from("articles_public")
    .select("*")
    .eq("slug", params.slug)
    .single();

  if (!article) return {};
  const localized = getLocalizedContent(article, lang);
  return {
    title: `Summary: ${localized.title}`,
    description: localized.excerpt,
  };
}

export default async function SummaryPage({ params }: Props) {
  const lang = params.lang as Lang;
  const ui = getUIStrings(lang);
  const supabase = createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();

  // If authenticated, redirect to full article
  if (user) {
    return NextResponse.redirect(`/${lang}/news/${params.slug}`);
  }

  // Fetch article from articles_public view (auth-gated - unauthenticated only see summary_content)
  const { data: article } = await supabase
    .from("articles_public")
    .select("*")
    .eq("slug", params.slug)
    .single();

  const mockArticle = MOCK_ARTICLES.find((a) => a.slug === params.slug);
  const rawArticle = article ?? mockArticle ?? null;

  if (!rawArticle) notFound();

  const localized = getLocalizedContent(rawArticle, lang);

  // Get summary content: English first, then Chinese fallback
  const summaryContent =
    lang === "zh"
      ? (localized as any).summary_content_zh ?? (localized as any).summary_content ?? null
      : (localized as any).summary_content ?? null;

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
        </div>
      </header>

      <div className="mx-auto mt-12 max-w-3xl">
        {summaryContent ? (
          <>
            <HtmlRenderer content={summaryContent} />
            <UnlockFullArticleCTA lang={lang} slug={params.slug} />
          </>
        ) : (
          <div className="rounded-2xl border border-ink-200 bg-ink-50 p-8 text-center dark:border-ink-800 dark:bg-ink-950/20">
            <p className="text-ink-600 dark:text-ink-400">No summary available for this article.</p>
            <Link
              href={`/${lang}/news/${params.slug}`}
              className="mt-4 inline-block text-sm text-accent-600 hover:text-accent-700 dark:text-accent-400 dark:hover:text-accent-300"
            >
              View the full article instead
            </Link>
          </div>
        )}
      </div>
    </article>
  );
}