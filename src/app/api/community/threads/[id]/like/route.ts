import { createSupabaseServerClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: threadId } = await params;
    const supabase = createSupabaseServerClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if the like already exists
    const { data: existingLike } = await supabase
      .from("thread_likes")
      .select("*")
      .eq("thread_id", threadId)
      .eq("user_id", user.id)
      .single();

    if (existingLike) {
      // Unlike: delete the like and decrement count
      await supabase
        .from("thread_likes")
        .delete()
        .eq("thread_id", threadId)
        .eq("user_id", user.id);

      // Decrement like_count
      const { data: thread } = await supabase
        .from("threads")
        .select("like_count")
        .eq("id", threadId)
        .single();

      if (thread) {
        await supabase
          .from("threads")
          .update({ like_count: thread.like_count - 1 })
          .eq("id", threadId);
      }

      return NextResponse.json({ liked: false });
    } else {
      // Like: insert new like and increment count
      await supabase.from("thread_likes").insert({
        thread_id: threadId,
        user_id: user.id,
      });

      // Increment like_count
      const { data: thread } = await supabase
        .from("threads")
        .select("like_count")
        .eq("id", threadId)
        .single();

      if (thread) {
        await supabase
          .from("threads")
          .update({ like_count: thread.like_count + 1 })
          .eq("id", threadId);
      }

      return NextResponse.json({ liked: true });
    }
  } catch (error) {
    console.error("Error toggling thread like:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}