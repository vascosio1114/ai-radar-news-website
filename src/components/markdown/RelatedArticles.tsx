import Link from "next/link";
import { ArrowRight } from "lucide-react";
import type { Lang } from "@/lib/site";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { ArticleCard } from "@/components/cards/ArticleCard";
import type { Article } from "@/types";

interface RelatedArticlesProps {
  currentSlug: string;
  tags?: string[];
  lang?: Lang;
  category?: string;
}

/**
 * Shows related articles based on tag overlap, using ArticleCard component.
 * Orders by number of matching tags (descending), then by recency.
 */
export default async function RelatedArticles({ currentSlug, tags = [], lang = "zh", category }: RelatedArticlesProps) {
  const supabase = createSupabaseServerClient();

  // Fetch published articles excluding current one
  const { data: rawArticles } = await supabase
    .from("articles")
    .select("id, slug, title, title_zh, excerpt, excerpt_zh, cover_image, category, tags, published_at, reading_time, views, is_published, author, is_featured, is_premium")
    .eq("is_published", true)
    .neq("slug", currentSlug)
    .order("published_at", { ascending: false })
    .limit(20);

  if (!rawArticles || rawArticles.length === 0) return null;

  // Calculate tag overlap score for each article
  type ScoredArticle = Article & { tagOverlap: number };
  const scoredArticles: ScoredArticle[] = rawArticles.map((article) => {
    const articleTags = article.tags ?? [];
    const overlap = tags.filter((t) => articleTags.includes(t)).length;
    return { ...article, tagOverlap: overlap };
  });

  // Sort by tag overlap (descending), then by published_at (descending)
  scoredArticles.sort((a, b) => {
    if (b.tagOverlap !== a.tagOverlap) return b.tagOverlap - a.tagOverlap;
    return new Date(b.published_at).getTime() - new Date(a.published_at).getTime();
  });

  // Take top 3-4 articles with highest overlap (prefer articles with at least 1 matching tag)
  const related = scoredArticles.filter((a) => a.tagOverlap > 0).slice(0, 3);
  if (related.length === 0) {
    // Fallback: if no tag overlap, just take most recent articles
    related.push(...scoredArticles.slice(0, 3));
  }

  return (
    <section className="mt-12">
      <h2 className="mb-6 font-display text-xl font-semibold">{lang === "zh" ? "相關文章" : "Related articles"}</h2>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {related.map((article) => (
          <ArticleCard key={article.id} article={article} lang={lang} />
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