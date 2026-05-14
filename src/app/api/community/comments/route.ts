import { createSupabaseServerClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const supabase = createSupabaseServerClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { thread_id, parent_comment_id, content } = body;

    if (!thread_id || !content) {
      return NextResponse.json(
        { error: "thread_id and content are required" },
        { status: 400 }
      );
    }

    // Validate content length
    if (content.length > 1000) {
      return NextResponse.json(
        { error: "Content must be 1000 characters or less" },
        { status: 400 }
      );
    }

    // If parent_comment_id is provided, verify it exists and is a top-level comment
    // (max 2 levels: top-level comment can have replies, but replies cannot have replies)
    if (parent_comment_id) {
      const { data: parentComment } = await supabase
        .from("thread_comments")
        .select("parent_comment_id")
        .eq("id", parent_comment_id)
        .single();

      if (!parentComment) {
        return NextResponse.json(
          { error: "Parent comment not found" },
          { status: 404 }
        );
      }

      // If parent is already a reply (has parent_comment_id), don't allow nested replies
      if (parentComment.parent_comment_id) {
        return NextResponse.json(
          { error: "Cannot reply to a reply (max 2 levels)" },
          { status: 400 }
        );
      }
    }

    // Insert the comment
    const { data: newComment, error } = await supabase
      .from("thread_comments")
      .insert({
        thread_id,
        parent_comment_id: parent_comment_id || null,
        author_id: user.id,
        content,
      })
      .select()
      .single();

    if (error) {
      console.error("Error creating comment:", error);
      return NextResponse.json(
        { error: "Failed to create comment" },
        { status: 500 }
      );
    }

    // Increment comment_count on the thread
    const { data: thread } = await supabase
      .from("threads")
      .select("comment_count")
      .eq("id", thread_id)
      .single();

    if (thread) {
      await supabase
        .from("threads")
        .update({ comment_count: thread.comment_count + 1 })
        .eq("id", thread_id);
    }

    return NextResponse.json(newComment, { status: 201 });
  } catch (error) {
    console.error("Error in POST /api/community/comments:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}