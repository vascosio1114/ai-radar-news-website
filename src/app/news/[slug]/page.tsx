import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Clock, Eye } from "lucide-react";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { formatDate } from "@/lib/utils";

type Props = { params: { slug: string } };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const supabase = createSupabaseServerClient();
  const { data } = await supabase
    .from("articles")
    .select("title,excerpt,cover_image,published_at")
    .eq("slug", params.slug)
    .eq("is_published", true)
    .single();

  if (!data) return {};
  return {
    title: data.title,
    description: data.excerpt,
    openGraph: {
      title: data.title,
      description: data.excerpt,
      images: [data.cover_image],
      type: "article",
      publishedTime: data.published_at,
    },
  };
}

export default async function ArticlePage({ params }: Props) {
  const supabase = createSupabaseServerClient();
  const { data: article } = await supabase
    .from("articles")
    .select("id,slug,title,excerpt,cover_image,category,author,published_at,reading_time,views,content,tags")
    .eq("slug", params.slug)
    .eq("is_published", true)
    .single();

  if (!article) notFound();

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
          {article.category}
        </span>
        <h1 className="mt-4 font-display text-3xl font-bold leading-tight md:text-5xl">
          {article.title}
        </h1>
        <p className="mt-4 text-base text-ink-500 dark:text-ink-400 md:text-lg">
          {article.excerpt}
        </p>
        <div className="mt-6 flex items-center gap-6 text-xs text-ink-500 dark:text-ink-400">
          <span>{article.author}</span>
          <span>{formatDate(article.published_at)}</span>
          <span className="inline-flex items-center gap-1">
            <Clock className="h-3.5 w-3.5" />
            {article.reading_time} 分鐘
          </span>
          <span className="inline-flex items-center gap-1">
            <Eye className="h-3.5 w-3.5" />
            {article.views.toLocaleString()}
          </span>
        </div>
      </header>

      <div className="relative mx-auto mt-10 aspect-[16/9] w-full max-w-5xl overflow-hidden rounded-3xl">
        <Image
          src={article.cover_image}
          alt={article.title}
          fill
          priority
          sizes="(min-width: 1024px) 1024px, 100vw"
          className="object-cover"
        />
      </div>

      {/* TODO: Markdown render — 之後接通 Supabase 取得 article.content 時，用 react-markdown 渲染 */}
      <div className="prose prose-ink mx-auto mt-12 max-w-3xl dark:prose-invert">
        <p>
          呢度將會係文章內文。連通 Supabase 後，將 <code>article.content</code> （Markdown）用
          <code>react-markdown</code> + <code>remark-gfm</code> 渲染出嚟。
        </p>
        <p>
          佢支援 heading、bullet list、table、code block，配合 Tailwind Typography
          外觀已經好靚，唔需要額外 styling。
        </p>
      </div>
    </article>
  );
}
