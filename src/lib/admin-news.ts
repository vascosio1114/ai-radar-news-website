import { createSupabaseAdminClient } from "@/lib/supabase/admin";

export type AdminNewsArticle = {
  id: string;
  slug: string;
  title: string;
  title_zh: string | null;
  title_en: string | null;
  excerpt: string | null;
  excerpt_zh: string | null;
  excerpt_en: string | null;
  content: string | null;
  content_zh: string | null;
  content_en: string | null;
  source_url: string | null;
  category: string;
  tags: string[] | null;
  created_at: string;
  published_at: string | null;
  language: string | null;
  review_status: "pending" | "approved" | null;
};

export type AdminNewsMetrics = {
  draftCount: number;
  pendingDrafts: number;
  approvedDrafts: number;
  publishedToday: number;
  rawItemsWaiting: number;
  failedDrafts: number;
};

export type AdminDashboardStats = {
  articles: number;
  tools: number;
  tutorials: number;
  views: number;
  users: number;
};

function startOfToday() {
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);
  return todayStart;
}

function startOfMonth(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

export function parseTags(value: FormDataEntryValue | null) {
  return String(value || "")
    .split(",")
    .map((tag) => tag.trim())
    .filter(Boolean);
}

export async function getDraftArticles() {
  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase
    .from("articles")
    .select("id, slug, title, title_zh, title_en, excerpt, excerpt_zh, excerpt_en, content, content_zh, content_en, source_url, category, tags, created_at, published_at, language, review_status")
    .eq("is_published", false)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return (data ?? []) as AdminNewsArticle[];
}

export async function getAdminNewsMetrics(): Promise<AdminNewsMetrics> {
  const supabase = createSupabaseAdminClient();
  const todayStart = startOfToday();

  const [
    draftCount,
    pendingDrafts,
    approvedDrafts,
    publishedToday,
    rawItemsWaiting,
    failedDrafts,
  ] = await Promise.all([
    supabase.from("articles").select("id", { count: "exact", head: true }).eq("is_published", false),
    supabase
      .from("articles")
      .select("id", { count: "exact", head: true })
      .eq("is_published", false)
      .eq("review_status", "pending"),
    supabase
      .from("articles")
      .select("id", { count: "exact", head: true })
      .eq("is_published", false)
      .eq("review_status", "approved"),
    supabase
      .from("articles")
      .select("id", { count: "exact", head: true })
      .eq("is_published", true)
      .gte("published_at", todayStart.toISOString()),
    supabase
      .from("raw_items")
      .select("id", { count: "exact", head: true })
      .is("processed_at", null),
    supabase
      .from("raw_items")
      .select("id", { count: "exact", head: true })
      .eq("status", "failed"),
  ]);

  for (const result of [draftCount, pendingDrafts, approvedDrafts, publishedToday, rawItemsWaiting, failedDrafts]) {
    if (result.error) throw result.error;
  }

  return {
    draftCount: draftCount.count ?? 0,
    pendingDrafts: pendingDrafts.count ?? 0,
    approvedDrafts: approvedDrafts.count ?? 0,
    publishedToday: publishedToday.count ?? 0,
    rawItemsWaiting: rawItemsWaiting.count ?? 0,
    failedDrafts: failedDrafts.count ?? 0,
  };
}

export async function getAdminDashboardStats(): Promise<AdminDashboardStats> {
  const supabase = createSupabaseAdminClient();
  const monthStart = startOfMonth(new Date()).toISOString();

  const [articles, tools, tutorials, viewsResult, usersResult] = await Promise.all([
    supabase.from("articles").select("id", { count: "exact", head: true }).eq("is_published", true),
    supabase.from("tools").select("id", { count: "exact", head: true }),
    supabase.from("tutorials").select("id", { count: "exact", head: true }),
    supabase
      .from("articles")
      .select("views")
      .gte("published_at", monthStart)
      .eq("is_published", true),
    supabase.from("profiles").select("id", { count: "exact", head: true }),
  ]);

  for (const result of [articles, tools, tutorials, viewsResult, usersResult]) {
    if (result.error) throw result.error;
  }

  return {
    articles: articles.count ?? 0,
    tools: tools.count ?? 0,
    tutorials: tutorials.count ?? 0,
    views: viewsResult.data?.reduce((sum, article) => sum + (article.views || 0), 0) ?? 0,
    users: usersResult.count ?? 0,
  };
}
