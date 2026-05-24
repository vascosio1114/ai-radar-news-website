import type { SupabaseClient } from "@supabase/supabase-js";

export type DigestCriteria = {
  category?: string;
  tags?: string[];
  date_range?: "today" | "yesterday" | "last_7days" | "last_30days";
  is_featured?: boolean;
  limit?: number;
};

export type ArticleSelect = {
  id: string;
  slug: string;
  title: string;
  title_zh?: string;
  excerpt: string;
  excerpt_zh?: string;
  cover_image?: string;
  published_at: string;
  category: string;
  tags: string[];
  is_featured: boolean;
};

export function buildArticleQuery(
  supabase: SupabaseClient,
  criteria: DigestCriteria,
  timezone: string = "Asia/Hong_Kong"
) {
  let query = supabase
    .from("articles")
    .select("id, slug, title, excerpt, cover_image, published_at, category, tags, is_featured")
    .eq("is_published", true);

  if (criteria.category) {
    query = query.eq("category", criteria.category);
  }
  if (criteria.tags && criteria.tags.length > 0) {
    query = query.overlaps("tags", criteria.tags);
  }
  if (criteria.is_featured !== undefined) {
    query = query.eq("is_featured", criteria.is_featured);
  }

  // date_range filter
  const now = new Date();
  const tz = timezone || "Asia/Hong_Kong";
  const todayStart = new Date(now.toLocaleString("en-US", { timeZone: tz })).setHours(0, 0, 0, 0);

  switch (criteria.date_range) {
    case "today":
      query = query.gte("published_at", new Date(todayStart).toISOString());
      break;
    case "yesterday": {
      const yesterdayStart = todayStart - 86400000;
      query = query
        .gte("published_at", new Date(yesterdayStart).toISOString())
        .lt("published_at", new Date(todayStart).toISOString());
      break;
    }
    case "last_7days":
      query = query.gte("published_at", new Date(todayStart - 7 * 86400000).toISOString());
      break;
    case "last_30days":
      query = query.gte("published_at", new Date(todayStart - 30 * 86400000).toISOString());
      break;
  }

  return query
    .order("published_at", { ascending: false })
    .limit(criteria.limit ?? 5);
}

export async function resolveArticlesFromPreset(
  supabase: SupabaseClient,
  mode: "manual" | "criteria",
  articleIds: string[] = [],
  criteria: DigestCriteria = {},
  timezone: string = "Asia/Hong_Kong"
): Promise<ArticleSelect[]> {
  if (mode === "manual") {
    if (!articleIds || articleIds.length === 0) return [];
    const { data } = await supabase
      .from("articles")
      .select("id, slug, title, excerpt, cover_image, published_at, category, tags, is_featured")
      .in("id", articleIds)
      .eq("is_published", true);
    return (data ?? []) as ArticleSelect[];
  }

  const { data } = await buildArticleQuery(supabase, criteria, timezone);
  return (data ?? []) as ArticleSelect[];
}