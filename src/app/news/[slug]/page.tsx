import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Clock, Eye } from "lucide-react";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { formatDate } from "@/lib/utils";
import { MOCK_ARTICLES } from "@/data/mock";
import MarkdownRenderer from "@/components/markdown/MarkdownRenderer";
import TableOfContents, { parseMarkdownHeadings } from "@/components/markdown/TableOfContents";
import AuthorCard from "@/components/markdown/AuthorCard";
import RelatedArticles from "@/components/markdown/RelatedArticles";

type Props = { params: { slug: string } };

export async function generateStaticParams() {
  return MOCK_ARTICLES.map((a) => ({ slug: a.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const supabase = createSupabaseServerClient();
  const { data: article } = await supabase
    .from("articles")
    .select("*")
    .eq("slug", params.slug)
    .eq("is_published", true)
    .single();

  if (!article) return {};
  return {
    title: article.title,
    description: article.excerpt,
    openGraph: {
      title: article.title,
      description: article.excerpt,
      images: [article.cover_image ?? ""],
      type: "article",
      publishedTime: article.published_at,
    },
  };
}

export default async function ArticlePage({ params }: Props) {
  const supabase = createSupabaseServerClient();
  const { data: article } = await supabase
    .from("articles")
    .select("*")
    .eq("slug", params.slug)
    .eq("is_published", true)
    .single();

  // Fall back to mock data if Supabase doesn't have content yet
  const mockArticle = MOCK_ARTICLES.find((a) => a.slug === params.slug);
  const articleContent = article?.content ?? mockArticle?.content ?? null;

  if (!article && !mockArticle) notFound();

  const tocItems = articleContent ? parseMarkdownHeadings(articleContent) : [];

  return (
    <article className="container-page section-pad">
      <Link
        href="/news"
        className="mb-6 inline-flex items-center gap-1 text-sm text-ink-500 transition hover:text-accent-600 dark:text-ink-400 dark:hover:text-accent-400"
      >
        <ArrowLeft className="h-4 w-4" />
        返回新聞列表
      </Link>

      <header className="mx-auto max-w-3xl">
        <span className="rounded-full bg-accent-500/10 px-3 py-1 text-xs font-semibold text-accent-700 dark:text-accent-400">
          {article?.category ?? mockArticle?.category ?? ""}
        </span>
        <h1 className="mt-4 font-display text-3xl font-bold leading-tight md:text-5xl">
          {article?.title ?? mockArticle?.title ?? ""}
        </h1>
        <p className="mt-4 text-base text-ink-500 dark:text-ink-400 md:text-lg">
          {article?.excerpt ?? mockArticle?.excerpt ?? ""}
        </p>
        <div className="mt-6 flex flex-wrap items-center gap-6 text-xs text-ink-500 dark:text-ink-400">
          <span>{article?.author ?? mockArticle?.author ?? ""}</span>
          <span>{formatDate(article?.published_at ?? mockArticle?.published_at ?? new Date().toISOString())}</span>
          <span className="inline-flex items-center gap-1">
            <Clock className="h-3.5 w-3.5" />
            {article?.reading_time ?? mockArticle?.reading_time ?? 0} 分鐘
          </span>
          <span className="inline-flex items-center gap-1">
            <Eye className="h-3.5 w-3.5" />
            {(article?.views ?? mockArticle?.views ?? 0).toLocaleString()}
          </span>
        </div>
        {(article?.tags?.length ?? mockArticle?.tags?.length ?? 0) > 0 && (
          <div className="mt-4 flex flex-wrap gap-2">
            {(article?.tags ?? mockArticle?.tags ?? []).map((tag: string) => (
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

      <div className="relative mx-auto mt-10 aspect-[16/9] w-full max-w-5xl overflow-hidden rounded-3xl">
        <Image
          src={article?.cover_image ?? mockArticle?.cover_image ?? ""}
          alt={article?.title ?? mockArticle?.title ?? ""}
          fill
          priority
          sizes="(min-width: 1024px) 1024px, 100vw"
          className="object-cover"
        />
      </div>

      {/* Main content area with TOC sidebar */}
      <div className="mx-auto mt-12 max-w-6xl">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1fr_240px]">
          {/* Article content */}
          <div className="min-w-0">
            {articleContent ? (
              <MarkdownRenderer content={articleContent} />
            ) : (
              <div className="prose prose-ink dark:prose-invert mx-auto max-w-3xl">
                <p className="text-ink-500 dark:text-ink-400">
                  文章內容準備中...
                </p>
              </div>
            )}

            <AuthorCard name={article?.author ?? mockArticle?.author ?? "Editorial Team"} />
          </div>

          {/* TOC sidebar */}
          <aside className="hidden lg:block">
            <div className="sticky top-24">
              <TableOfContents items={tocItems} />
            </div>
          </aside>
        </div>

        {/* Related articles below content */}
        <div className="mt-12 border-t border-ink-200 pt-8 dark:border-ink-800">
          <RelatedArticles
            articles={MOCK_ARTICLES}
            currentSlug={params.slug}
          />
        </div>
      </div>
    </article>
  );
}