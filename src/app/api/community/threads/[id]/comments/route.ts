import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { logger } from "@/lib/logger";

const communityLogger = logger.child({ component: "community" });

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: threadId } = await params;

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
    const { comment_id } = body; // parent_comment_id for replies

    // Check thread exists
    const { error: threadError } = await supabase
      .from("threads")
      .select("id")
      .eq("id", threadId)
      .single();

    if (threadError) {
      return NextResponse.json({ error: "Thread not found" }, { status: 404 });
    }

    // If replying to a comment, verify parent exists and is top-level
    if (comment_id) {
      const { data: parentComment } = await supabase
        .from("thread_comments")
        .select("id, parent_comment_id")
        .eq("id", comment_id)
        .single();

      if (!parentComment) {
        return NextResponse.json({ error: "Parent comment not found" }, { status: 404 });
      }

      // Max 2 levels - reject if parent is already a reply (has parent_comment_id set)
      if (parentComment.parent_comment_id !== null) {
        return NextResponse.json({ error: "Cannot nest more than 2 levels" }, { status: 400 });
      }
    }

    const content = body.content?.trim();
    if (!content || content.length > 1000) {
      return NextResponse.json({ error: "Content required, max 1000 chars" }, { status: 400 });
    }

    const { data: comment, error } = await supabase
      .from("thread_comments")
      .insert({
        thread_id: threadId,
        parent_comment_id: comment_id ?? null,
        author_id: user.id,
        content,
      })
      .select(`
        id,
        thread_id,
        parent_comment_id,
        content,
        is_bot_comment,
        like_count,
        created_at,
        author:auth.users!author_id(
          id,
          email,
          raw_user_meta_data
        )
      `)
      .single();

    if (error) {
      communityLogger.error({ err: error }, "Failed to create comment");
      return NextResponse.json({ error: "Failed to create comment" }, { status: 500 });
    }

    // Update denormalized comment_count on thread
    await supabase.rpc("increment_comment_count", { thread_id: threadId });

    return NextResponse.json({ comment }, { status: 201 });
  } catch (e) {
    communityLogger.error({ err: e }, "Unexpected error creating comment");
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}