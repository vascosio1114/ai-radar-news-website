import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getLocalizedContent, getUIStrings, hasLocalizedArticleContent } from "@/lib/i18n";
import { SITE_NAME, SITE_URL, type Lang } from "@/lib/site";
import { absoluteUrl, articleJsonLd, breadcrumbJsonLd } from "@/lib/seo";
import { formatDate } from "@/lib/utils";
import { MOCK_ARTICLES } from "@/data/mock";
import HtmlRenderer from "@/components/markdown/HtmlRenderer";
import UnlockFullArticleCTA from "@/components/summarize/UnlockFullArticleCTA";

type Props = { params: { lang: string; slug: string } };
type SummaryArticleFields = {
  summary_content?: string | null;
  summary_content_zh?: string | null;
};

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
  const { data: article } = await supabase
    .from("articles_public")
    .select("*")
    .eq("slug", params.slug)
    .single();

  if (!article || !hasLocalizedArticleContent(article, lang)) return {};
  const localized = getLocalizedContent(article, lang);
  const path = `/${lang}/summarize/${params.slug}`;
  const url = `${SITE_URL}${path}`;
  const title =
    lang === "zh"
      ? `${localized.title}｜文章摘要`
      : `Summary: ${localized.title}`;
  const description = localized.excerpt ?? article.excerpt ?? "";
  const image = absoluteUrl(article.cover_image) ?? `${SITE_URL}/images/radar-ai-studio-bg.jpeg`;

  return {
    title,
    description,
    alternates: {
      canonical: url,
      languages: {
        "zh-HK": `${SITE_URL}/zh/summarize/${params.slug}`,
        en: `${SITE_URL}/en/summarize/${params.slug}`,
      },
    },
    openGraph: {
      title,
      description,
      url,
      siteName: SITE_NAME,
      images: [{ url: image }],
      type: "article",
      publishedTime: article.published_at,
      modifiedTime: article.updated_at ?? article.published_at,
      authors: [localized.author ?? article.author ?? "Radar AI Studio Editorial Team"],
      tags: localized.tags ?? article.tags ?? undefined,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [image],
    },
  };
}

export default async function SummaryPage({ params }: Props) {
  const lang = params.lang as Lang;
  const ui = getUIStrings(lang);
  const supabase = createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();

  // If authenticated, redirect to full article
  if (user) {
    redirect(`/${lang}/news/${params.slug}`);
  }

  // Use articles_public for auth check (gated view) - only for unauthenticated users
  const { data: article } = await supabase
    .from("articles_public")
    .select("*")
    .eq("slug", params.slug)
    .single();

  // summary_content is only shown to unauthenticated users (it's in the public view)
  const rawArticle = article ?? null;

  if (!rawArticle || !hasLocalizedArticleContent(rawArticle, lang)) notFound();

  const localized = getLocalizedContent(rawArticle, lang);
  const summaryArticle = localized as typeof localized & SummaryArticleFields;

  // summary_content is only available to unauthenticated users via the articles_public view
  const summaryContent =
    lang === "zh"
      ? summaryArticle.summary_content_zh ?? summaryArticle.summary_content ?? null
      : summaryArticle.summary_content ?? null;
  const summaryUrl = `${SITE_URL}/${lang}/summarize/${params.slug}`;
  const structuredData = [
    articleJsonLd({
      lang,
      url: summaryUrl,
      title: localized.title ?? rawArticle.title ?? SITE_NAME,
      description: localized.excerpt ?? rawArticle.excerpt,
      image: rawArticle.cover_image,
      author: localized.author ?? rawArticle.author,
      publishedAt: localized.published_at ?? rawArticle.published_at,
      modifiedAt: localized.updated_at ?? rawArticle.updated_at,
      tags: localized.tags ?? rawArticle.tags,
    }),
    breadcrumbJsonLd([
      { name: SITE_NAME, url: `${SITE_URL}/${lang}` },
      { name: lang === "zh" ? "AI 文章" : "AI Blog", url: `${SITE_URL}/${lang}/news` },
      { name: localized.title ?? rawArticle.title ?? params.slug, url: summaryUrl },
    ]),
  ];

  return (
    <article className="container-page section-pad">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
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
