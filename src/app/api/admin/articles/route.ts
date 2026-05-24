import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { logger } from "@/lib/logger";

const log = logger.child({ component: "admin-articles" });

export async function GET() {
  try {
    // session client reads browser cookies
    const session = createSupabaseServerClient();
    const { data: { user } } = await session.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // admin client bypasses RLS for data queries
    const admin = createSupabaseAdminClient();
    const { data: profile } = await admin
      .from("profiles")
      .select("is_admin")
      .eq("id", user.id)
      .single();

    if (!profile?.is_admin) {
      return NextResponse.json({ error: "Admin access required" }, { status: 403 });
    }

    const { data, error } = await admin
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
  const cjkChars = (content.match(/[一-鿿]/g) ?? []).length;
  return Math.max(1, Math.ceil(Math.max(words / 220, cjkChars / 450)));
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    // session client reads browser cookies
    const session = createSupabaseServerClient();
    const { data: { user } } = await session.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // admin client bypasses RLS for data queries
    const admin = createSupabaseAdminClient();
    const { data: profile } = await admin
      .from("profiles")
      .select("is_admin")
      .eq("id", user.id)
      .single();

    if (!profile?.is_admin) {
      return NextResponse.json({ error: "Admin access required" }, { status: 403 });
    }

    const publishedAt = body.published_at
      ? new Date(body.published_at).toISOString()
      : new Date().toISOString();
    const slug = body.slug || createSlug(publishedAt, body.title || body.title_zh || "blog-post");
    const content = body.content_zh || body.content || "";

    const { data, error } = await admin
      .from("articles")
      .insert({
        title: body.title_zh || body.title,
        slug,
        excerpt: body.excerpt_zh || body.excerpt || "",
        cover_image: body.cover_image || null,
        content: body.content_zh || body.content || null,
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