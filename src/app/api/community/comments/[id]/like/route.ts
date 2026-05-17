import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { logger } from "@/lib/logger";
import { checkRateLimit } from "@/lib/rate-limit";

const communityLogger = logger.child({ component: "community" });

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: commentId } = await params;

  // Rate limiting
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0] ||
             request.headers.get("x-real-ip") ||
             "unknown";
  const rateLimit = await checkRateLimit(ip);
  if (!rateLimit.allowed) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }

  try {
    const supabase = createSupabaseServerClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Toggle like: use insert-first approach to eliminate check-then-act race
    // The composite PK (comment_id, user_id) ensures atomic dedup at DB level
    const { error: insertError } = await supabase
      .from("comment_likes")
      .insert({ comment_id: commentId, user_id: user.id });

    if (!insertError) {
      // Successfully inserted — increment counter
      const { error: rpcError } = await supabase.rpc("increment_comment_like_count", { comment_id: commentId, increment: 1 });
      if (rpcError) {
        communityLogger.error({ err: rpcError, commentId }, "Failed to increment comment like count after insert");
      }
      return NextResponse.json({ liked: true });
    }

    // Insert failed — check if it's a PK violation (already liked)
    if (insertError.code === "23505") {
      // Already liked — delete and decrement counter
      await supabase
        .from("comment_likes")
        .delete()
        .eq("comment_id", commentId)
        .eq("user_id", user.id);

      const { error: rpcError } = await supabase.rpc("decrement_comment_like_count", { comment_id: commentId, decrement: 1 });
      if (rpcError) {
        communityLogger.error({ err: rpcError, commentId }, "Failed to decrement comment like count after delete");
      }
      return NextResponse.json({ liked: false });
    }

    // Other error — log and report
    communityLogger.error({ err: insertError, commentId }, "Unexpected error toggling comment like");
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  } catch (e) {
    communityLogger.error({ err: e }, "Unexpected error toggling comment like");
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}