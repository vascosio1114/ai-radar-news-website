import { createSupabaseServerClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: commentId } = await params;
    const supabase = createSupabaseServerClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if the like already exists
    const { data: existingLike } = await supabase
      .from("comment_likes")
      .select("*")
      .eq("comment_id", commentId)
      .eq("user_id", user.id)
      .single();

    if (existingLike) {
      // Unlike: delete the like and decrement count
      await supabase
        .from("comment_likes")
        .delete()
        .eq("comment_id", commentId)
        .eq("user_id", user.id);

      // Decrement like_count
      const { data: comment } = await supabase
        .from("thread_comments")
        .select("like_count")
        .eq("id", commentId)
        .single();

      if (comment) {
        await supabase
          .from("thread_comments")
          .update({ like_count: comment.like_count - 1 })
          .eq("id", commentId);
      }

      return NextResponse.json({ liked: false });
    } else {
      // Like: insert new like and increment count
      await supabase.from("comment_likes").insert({
        comment_id: commentId,
        user_id: user.id,
      });

      // Increment like_count
      const { data: comment } = await supabase
        .from("thread_comments")
        .select("like_count")
        .eq("id", commentId)
        .single();

      if (comment) {
        await supabase
          .from("thread_comments")
          .update({ like_count: comment.like_count + 1 })
          .eq("id", commentId);
      }

      return NextResponse.json({ liked: true });
    }
  } catch (error) {
    console.error("Error toggling comment like:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}