import { NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/admin-auth";
import { logger } from "@/lib/logger";

export const dynamic = "force-dynamic";

const log = logger.child({ component: "admin-articles" });

export async function GET() {
  try {
    const auth = await requireAdminApi();
    if (!auth.ok) return auth.response;
    const supabase = auth.adminDb;

    const { data, error } = await supabase
      .from("articles")
      .select("*")
      .order("created_at", { ascending: false });

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


function createSlug(date: string, title: string) {
  const dateStr = date ? new Date(date).toISOString().split("T")[0] : new Date().toISOString().split("T")[0];
  const titleSlug = String(title || "")
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .trim();
  return `${dateStr}-${titleSlug || "blog-post"}`;
}

function estimateReadingTime(content: string) {
  const words = content.trim().split(/\s+/).filter(Boolean).length;
  const cjkChars = (content.match(/[\u4e00-\u9fff]/g) ?? []).length;
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
    const slug = body.slug || createSlug(publishedAt, body.title || body.title_zh || "blog-post");
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
