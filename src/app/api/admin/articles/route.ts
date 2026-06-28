import { NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/admin-auth";
import { logger } from "@/lib/logger";

export const dynamic = "force-dynamic";

const log = logger.child({ component: "admin-articles" });

export async function GET(req: Request) {
  try {
    const auth = await requireAdminApi();
    if (!auth.ok) return auth.response;
    const supabase = auth.adminDb;

    const url = new URL(req.url);
    const search = url.searchParams.get("search");
    const limit = parseInt(url.searchParams.get("limit") || "20");

    let query = supabase
      .from("articles")
      .select("id, slug, title, title_zh, title_en, excerpt, excerpt_zh, excerpt_en, category, tags, author, published_at, reading_time, views, is_featured, is_published, cover_image, content, content_zh, content_en, summary_content, summary_content_zh, email_content")
      .order("created_at", { ascending: false })
      .limit(limit);

    if (search && search.length >= 2) {
      query = query.or(`title.ilike.%${search}%,title_zh.ilike.%${search}%,title_en.ilike.%${search}%,slug.ilike.%${search}%,category.ilike.%${search}%`);
    }

    const { data, error } = await query;

    if (error) {
      log.error({ err: error }, "Failed to fetch articles");
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ articles: data });
  } catch (e) {
    log.error({ err: e }, "Unexpected error fetching articles");
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

function normalizeSlug(value: string) {
  return String(value || "")
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .trim();
}

function createSlug(date: string, title: string) {
  const dateStr = date ? new Date(date).toISOString().split("T")[0] : new Date().toISOString().split("T")[0];
  const titleSlug = normalizeSlug(title);
  const fallback = `blog-post-${Date.now().toString(36)}`;
  return `${dateStr}-${titleSlug || fallback}`;
}

function estimateReadingTime(content: string) {
  const words = content.trim().split(/\s+/).filter(Boolean).length;
  const cjkChars = (content.match(/[一-鿿]/g) ?? []).length;
  return Math.max(1, Math.ceil(Math.max(words / 220, cjkChars / 450)));
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const auth = await requireAdminApi();
    if (!auth.ok) return auth.response;
    const supabase = auth.adminDb;

    const publishedAt = body.published_at
      ? new Date(body.published_at).toISOString()
      : new Date().toISOString();
    const slug = normalizeSlug(body.slug || "") || createSlug(publishedAt, body.title || body.title_zh || "blog-post");
    const content = body.content_zh || body.content || "";

    const { data, error } = await supabase
      .from("articles")
      .insert({
        title: body.title || body.title_zh || "Untitled",
        title_zh: body.title_zh || body.title || null,
        slug,
        excerpt: body.excerpt || body.excerpt_zh || "",
        excerpt_zh: body.excerpt_zh || body.excerpt || null,
        cover_image: body.cover_image || null,
        content: body.content || body.content_zh || null,
        content_zh: body.content_zh || body.content || null,
        summary_content: body.summary_content || null,
        summary_content_zh: body.summary_content_zh || null,
        category: body.category || "AI 文章",
        tags: Array.isArray(body.tags) ? body.tags : [],
        author: body.author || "RADAR AI Studio",
        published_at: publishedAt,
        reading_time: estimateReadingTime(content),
        views: 0,
        is_featured: Boolean(body.is_featured),
        is_published: body.is_published !== false,
        email_content: body.email_content ? String(body.email_content) : null,
      })
      .select("id, slug, is_published")
      .single();

    if (error) {
      log.error({ err: error }, "Failed to create article");
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ article: data }, { status: 201 });
  } catch (e) {
    log.error({ err: e }, "Unexpected error creating article");
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
