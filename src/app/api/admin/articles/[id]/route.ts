import { NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/admin-auth";
import { logger } from "@/lib/logger";

export const dynamic = "force-dynamic";

const log = logger.child({ component: "admin-articles-id" });

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

function estimateReadingTime(content: string) {
  const words = content.trim().split(/\s+/).filter(Boolean).length;
  const cjkChars = (content.match(/[一-鿿]/g) ?? []).length;
  return Math.max(1, Math.ceil(Math.max(words / 220, cjkChars / 450)));
}

function normalizeArticlePayload(body: Record<string, unknown>) {
  const content = String(body.content_zh || body.content || "");
  const normalizedSlug = normalizeSlug(String(body.slug || ""));

  return {
    title: String(body.title || body.title_zh || "Untitled"),
    title_zh: body.title_zh ? String(body.title_zh) : body.title ? String(body.title) : null,
    ...(normalizedSlug ? { slug: normalizedSlug } : {}),
    excerpt: body.excerpt ? String(body.excerpt) : body.excerpt_zh ? String(body.excerpt_zh) : "",
    excerpt_zh: body.excerpt_zh ? String(body.excerpt_zh) : body.excerpt ? String(body.excerpt) : null,
    cover_image: body.cover_image ? String(body.cover_image) : null,
    content: body.content ? String(body.content) : body.content_zh ? String(body.content_zh) : null,
    content_zh: body.content_zh ? String(body.content_zh) : body.content ? String(body.content) : null,
    summary_content: body.summary_content ? String(body.summary_content) : null,
    summary_content_zh: body.summary_content_zh ? String(body.summary_content_zh) : null,
    category: body.category ? String(body.category) : "AI 文章",
    tags: Array.isArray(body.tags) ? body.tags.map(String) : [],
    published_at: body.published_at ? new Date(String(body.published_at)).toISOString() : null,
    reading_time: estimateReadingTime(content),
    is_featured: Boolean(body.is_featured),
    is_published: Boolean(body.is_published),
    updated_at: new Date().toISOString(),
    email_content: body.email_content ? String(body.email_content) : null,
  };
}

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const auth = await requireAdminApi();
    if (!auth.ok) return auth.response;
    const supabase = auth.adminDb;

    const { data, error } = await supabase
      .from("articles")
      .select("*")
      .eq("id", id)
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 404 });
    }

    return NextResponse.json({ article: data });
  } catch (e) {
    log.error({ err: e }, "Unexpected error fetching article");
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const auth = await requireAdminApi();
    if (!auth.ok) return auth.response;
    const supabase = auth.adminDb;

    const { error } = await supabase.from("articles").delete().eq("id", id);

    if (error) {
      log.error({ err: error, id }, "Failed to delete article");
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ ok: true });
  } catch (e) {
    log.error({ err: e }, "Unexpected error deleting article");
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();
    const auth = await requireAdminApi();
    if (!auth.ok) return auth.response;
    const supabase = auth.adminDb;

    const patch = Object.keys(body).length === 1 && typeof body.is_published === "boolean"
      ? { is_published: body.is_published, updated_at: new Date().toISOString() }
      : normalizeArticlePayload(body);

    const { data, error } = await supabase
      .from("articles")
      .update(patch)
      .eq("id", id)
      .select("id, slug, is_published")
      .single();

    if (error) {
      log.error({ err: error, id }, "Failed to update article");
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ ok: true, article: data });
  } catch (e) {
    log.error({ err: e }, "Unexpected error updating article");
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}