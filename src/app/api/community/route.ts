import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { logger } from "@/lib/logger";

const communityLogger = logger.child({ component: "community" });

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const limit = Math.min(parseInt(searchParams.get("limit") ?? "20"), 50);
  const offset = parseInt(searchParams.get("offset") ?? "0");

  try {
    const supabase = createSupabaseServerClient();

    const { data: threads, error, count } = await supabase
      .from("threads")
      .select(`
        id,
        content,
        image_url,
        link_url,
        link_title,
        link_description,
        link_image,
        is_bot_post,
        like_count,
        comment_count,
        created_at,
        author:profiles!author_id(
          id,
          display_name,
          avatar_url
        )
      `, { count: "exact" })
      .order("created_at", { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      communityLogger.error({ err: error }, "Failed to fetch threads");
      return NextResponse.json({ error: "Failed to fetch threads" }, { status: 500 });
    }

    return NextResponse.json({ threads: threads ?? [], count, offset, limit });
  } catch (e) {
    communityLogger.error({ err: e }, "Unexpected error fetching threads");
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const supabase = createSupabaseServerClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const contentType = request.headers.get("content-type");
    if (!contentType?.includes("application/json")) {
      return NextResponse.json({ error: "Content-Type must be application/json" }, { status: 415 });
    }

    const body = await request.json();
    const { content, image_url, link_url, link_title, link_description, link_image } = body;

    if (!content || typeof content !== "string" || content.trim().length === 0) {
      return NextResponse.json({ error: "Content is required" }, { status: 400 });
    }

    if (content.length > 2000) {
      return NextResponse.json({ error: "Content exceeds 2000 characters" }, { status: 400 });
    }

    function isValidHttpUrl(value: string | null | undefined): boolean {
      if (!value) return true; // optional fields
      try {
        const url = new URL(value);
        return url.protocol === "http:" || url.protocol === "https:";
      } catch {
        return false;
      }
    }

    if (!isValidHttpUrl(link_url)) {
      return NextResponse.json({ error: "link_url must be a valid http/https URL" }, { status: 400 });
    }
    if (!isValidHttpUrl(link_image)) {
      return NextResponse.json({ error: "link_image must be a valid http/https URL" }, { status: 400 });
    }

    const { data: thread, error } = await supabase
      .from("threads")
      .insert({
        author_id: user.id,
        content: content.trim(),
        image_url: image_url ?? null,
        link_url: link_url ?? null,
        link_title: link_title ?? null,
        link_description: link_description ?? null,
        link_image: link_image ?? null,
      })
      .select(`
        id,
        content,
        image_url,
        link_url,
        link_title,
        link_description,
        link_image,
        is_bot_post,
        like_count,
        comment_count,
        created_at,
        author:profiles!author_id(
          id,
          display_name,
          avatar_url
        )
      `)
      .single();

    if (error) {
      communityLogger.error({ err: error }, "Failed to create thread");
      return NextResponse.json({ error: "Failed to create thread" }, { status: 500 });
    }

    return NextResponse.json({ thread }, { status: 201 });
  } catch (e) {
    communityLogger.error({ err: e }, "Unexpected error creating thread");
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}