import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { logger } from "@/lib/logger";

const botLogger = logger.child({ component: "bot-comment-scan" });

const GEMINI_KEY = process.env.GEMINI_API_KEY;

const AI_KEYWORDS = [
  "ai", "chatgpt", "gpt", "gemini", "claude", "openai", "llm", "language model",
  "machine learning", "neural network", "deep learning", "artificial intelligence",
  "copilot", "Cursor", "Replit", "tool", "automation", "productivity", "prompt",
  "midjourney", "stable diffusion", "image generation", "video generation",
];

const BOT_CRON_SECRET = process.env.BOT_CRON_SECRET;

export async function POST(request: Request) {
  const authHeader = request.headers.get("authorization");
  const supabase = createSupabaseServerClient();

  // Check bot is enabled
  const { data: botSettings } = await supabase
    .from("bot_settings")
    .select("enabled, comment_enabled")
    .limit(1)
    .single();

  if (botSettings && (!botSettings.enabled || !botSettings.comment_enabled)) {
    return NextResponse.json({ message: "Bot commenting disabled" }, { status: 200 });
  }

  // Auth: BOT_CRON_SECRET takes priority over user session
  if (BOT_CRON_SECRET && authHeader === `Bearer ${BOT_CRON_SECRET}`) {
    // Valid cron request — proceed with bot action
  } else {
    // Require valid user session
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // Get bot user id from profiles table (not auth.users — RLS blocks direct access)
    const { data: botProfile } = await supabase
      .from("profiles")
      .select("id")
      .eq("is_bot", true)
      .limit(1)
      .single();

    const botUserId = botProfile?.id;
    if (!botUserId) {
      botLogger.warn("No bot user found");
      return NextResponse.json({ error: "Bot user not configured" }, { status: 500 });
    }

    // Get recent user threads (not bot, not already commented on by bot)
    const thirtyMinutesAgo = new Date(Date.now() - 30 * 60 * 1000).toISOString();
    const { data: recentThreads } = await supabase
      .from("threads")
      .select("id, content, is_bot_post")
      .eq("is_bot_post", false)
      .gte("created_at", thirtyMinutesAgo)
      .order("created_at", { ascending: false })
      .limit(10);

    if (!recentThreads?.length) {
      return NextResponse.json({ message: "No recent threads to comment on" });
    }

    const results: { thread_id: string; commented: boolean }[] = [];

    for (const thread of recentThreads) {
      // Check if bot already commented
      const { data: existingComment } = await supabase
        .from("thread_comments")
        .select("id")
        .eq("thread_id", thread.id)
        .eq("author_id", botUserId)
        .limit(1);

      if (existingComment?.length) {
        results.push({ thread_id: thread.id, commented: false });
        continue;
      }

      // Check keyword relevance
      const lower = thread.content.toLowerCase();
      const isRelevant = AI_KEYWORDS.some((kw) => lower.includes(kw));
      if (!isRelevant) {
        results.push({ thread_id: thread.id, commented: false });
        continue;
      }

      // Generate comment via Gemini
      if (!GEMINI_KEY) {
        results.push({ thread_id: thread.id, commented: false });
        continue;
      }

      try {
        const res = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_KEY}`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              contents: [{
                parts: [{
                  text: `The user posted: "${thread.content.slice(0, 500)}"\n\nWrite a helpful, friendly comment (1-2 sentences) responding to this post about AI. Be concise and genuine. Do not be promotional. Return just the comment text.`
                }]
              }],
              generationConfig: { temperature: 0.7, maxOutputTokens: 150 }
            }),
            signal: AbortSignal.timeout(10000),
          }
        );

        if (!res.ok) {
          results.push({ thread_id: thread.id, commented: false });
          continue;
        }

        const data = await res.json();
        const commentText = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim();

        if (!commentText) {
          results.push({ thread_id: thread.id, commented: false });
          continue;
        }

        await supabase
          .from("thread_comments")
          .insert({
            thread_id: thread.id,
            author_id: botUserId,
            content: commentText.slice(0, 1000),
            is_bot_comment: true,
          });

        // Update denormalized count
        await supabase.rpc("increment_comment_count", { thread_id: thread.id });

        results.push({ thread_id: thread.id, commented: true });
      } catch (e) {
        botLogger.warn({ err: e, threadId: thread.id }, "Failed to comment on thread");
        results.push({ thread_id: thread.id, commented: false });
      }
    }

    return NextResponse.json({ results });
  } catch (e) {
    botLogger.error({ err: e }, "Bot comment scan error");
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}