import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { logger } from "@/lib/logger";

const communityLogger = logger.child({ component: "community" });

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  try {
    const supabase = createSupabaseServerClient();

    const { data: thread, error } = await supabase
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
      `)
      .eq("id", id)
      .single();

    if (error) {
      communityLogger.error({ err: error, threadId: id }, "Failed to fetch thread");
      return NextResponse.json({ error: "Thread not found" }, { status: 404 });
    }

    // Fetch top-level comments with nested replies
    const { data: comments, error: commentsError } = await supabase
      .from("thread_comments")
      .select(`
        id,
        thread_id,
        parent_comment_id,
        content,
        is_bot_comment,
        like_count,
        created_at,
        author:profiles!author_id(
          id,
          display_name,
          avatar_url
        )
      `)
      .eq("thread_id", id)
      .order("created_at", { ascending: true });

    if (commentsError) {
      communityLogger.error({ err: commentsError, threadId: id }, "Failed to fetch comments");
    }

    return NextResponse.json({ thread, comments: comments ?? [] });
  } catch (e) {
    communityLogger.error({ err: e, threadId: id }, "Unexpected error fetching thread");
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}