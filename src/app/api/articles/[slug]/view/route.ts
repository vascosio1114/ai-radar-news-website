import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { logger } from "@/lib/logger";

const log = logger.child({ component: "article-view" });

export async function POST(
  _req: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const supabase = createSupabaseServerClient();

    // Get current views first
    const { data: current, error: getError } = await supabase
      .from("articles")
      .select("views")
      .eq("slug", slug)
      .single();

    if (getError) {
      log.error({ err: getError, slug }, "Failed to get article views");
      return NextResponse.json({ error: getError.message }, { status: 500 });
    }

    const newViews = (current?.views ?? 0) + 1;

    const { data, error } = await supabase
      .from("articles")
      .update({ views: newViews })
      .eq("slug", slug)
      .select("views")
      .single();

    if (error) {
      log.error({ err: error, slug }, "Failed to update views");
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ views: data.views });
  } catch (e) {
    log.error({ err: e }, "Unexpected error incrementing views");
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

// GET to fetch current view count without incrementing
export async function GET(
  _req: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const supabase = createSupabaseServerClient();

    const { data, error } = await supabase
      .from("articles")
      .select("views")
      .eq("slug", slug)
      .single();

    if (error) {
      log.error({ err: error, slug }, "Failed to get views");
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ views: data.views ?? 0 });
  } catch (e) {
    log.error({ err: e }, "Unexpected error getting views");
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}