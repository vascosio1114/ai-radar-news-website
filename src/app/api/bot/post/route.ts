import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { logger } from "@/lib/logger";

const botLogger = logger.child({ component: "bot-post" });

const GEMINI_KEY = process.env.GEMINI_API_KEY;
const MINIMAX_KEY = process.env.MINIMAX_KEY;

async function fetchLatestAINews(): Promise<{ title: string; summary: string; url: string; image?: string }[]> {
  // Try Gemini web search first
  if (GEMINI_KEY) {
    try {
      const res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_KEY}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [{
              parts: [{
                text: "Find the latest and most interesting AI news from the past 24 hours. Return a JSON array with fields: title, summary (2-3 sentences), url, and image (if available). Return 1-2 items. Focus on AI tools, research breakthroughs, or tech industry news. Format: [{\"title\":\"...\",\"summary\":\"...\",\"url\":\"...\",\"image\":\"...\"}]"
              }]
            }],
            generationConfig: { responseMimeType: "application/json", temperature: 0.7 }
          }),
          signal: AbortSignal.timeout(15000),
        }
      );
      if (res.ok) {
        const data = await res.json();
        const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
        if (text) {
          const parsed = JSON.parse(text);
          return Array.isArray(parsed) ? parsed.slice(0, 2) : [];
        }
      }
    } catch (e) {
      botLogger.warn({ err: e }, "Gemini news fetch failed");
    }
  }

  // Fallback: try MiniMax web search
  if (MINIMAX_KEY) {
    try {
      const res = await fetch(
        `https://api.minimax.chat/v1/text/chatcompletion_pro?Model=abab6.5s-chat`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${MINIMAX_KEY}`,
          },
          body: JSON.stringify({
            model: "abab6.5s-chat",
            messages: [{
              role: "user",
              content: "Find latest AI news from the past 24 hours. Return a JSON array with: title, summary (2-3 sentences), url, image (optional). Return 1-2 items. Format: [{\"title\":\"...\",\"summary\":\"...\",\"url\":\"...\",\"image\":\"...\"}]"
            }],
            temperature: 0.7,
          }),
          signal: AbortSignal.timeout(15000),
        }
      );
      if (res.ok) {
        const data = await res.json();
        const text = data.choices?.[0]?.message?.content;
        if (text) {
          const parsed = JSON.parse(text);
          return Array.isArray(parsed) ? parsed.slice(0, 2) : [];
        }
      }
    } catch (e) {
      botLogger.warn({ err: e }, "MiniMax news fetch failed");
    }
  }

  return [];
}

async function summarizeArticle(url: string): Promise<{ title: string; summary: string; image?: string } | null> {
  if (!GEMINI_KEY) return null;
  try {
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: `Summarize the article at ${url} in 2-3 sentences. Return JSON: {"title":"...","summary":"...","image":"..." (og:image if available, else null)}`
            }]
          }],
          generationConfig: { responseMimeType: "application/json", temperature: 0.3 }
        }),
        signal: AbortSignal.timeout(10000),
      }
    );
    if (res.ok) {
      const data = await res.json();
      const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
      if (text) return JSON.parse(text);
    }
  } catch (e) {
    botLogger.warn({ err: e, url }, "Article summary failed");
  }
  return null;
}

const BOT_CRON_SECRET = process.env.BOT_CRON_SECRET;

export async function POST(request: Request) {
  // Simple cron auth: check secret header or service role key
  const authHeader = request.headers.get("authorization");
  const supabase = createSupabaseServerClient();

  // Check bot is enabled
  const { data: botSettings } = await supabase
    .from("bot_settings")
    .select("enabled")
    .limit(1)
    .single();

  if (botSettings && !botSettings.enabled) {
    return NextResponse.json({ message: "Bot disabled" }, { status: 200 });
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
    // Try to summarize a recent article first
    const { data: articles } = await supabase
      .from("articles")
      .select("slug, title, cover_image, content")
      .eq("is_published", true)
      .order("published_at", { ascending: false })
      .limit(5);

    let threadContent: { title: string; content: string; link_url?: string; link_title?: string; link_description?: string; link_image?: string } | null = null;

    if (articles?.length) {
      const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://ai-radar.com";
      const article = articles[0];
      const articleUrl = `${siteUrl}/news/${article.slug}`;
      const summary = await summarizeArticle(articleUrl);
      if (summary) {
        threadContent = {
          title: summary.title ?? article.title,
          content: summary.summary,
          link_url: articleUrl,
          link_title: summary.title ?? article.title,
          link_description: summary.summary,
          link_image: summary.image ?? article.cover_image,
        };
      }
    }

    // Fallback: live AI news
    if (!threadContent) {
      const news = await fetchLatestAINews();
      if (news.length) {
        const item = news[0];
        threadContent = {
          title: item.title,
          content: item.summary,
          link_url: item.url,
          link_image: item.image,
        };
      }
    }

    if (!threadContent) {
      return NextResponse.json({ message: "No content available" }, { status: 200 });
    }

    // Try to get bot user id from profiles table (fallback to first bot email match)
    let botUserId: string | undefined;
    const { data: botProfile } = await supabase
      .from("profiles")
      .select("id")
      .limit(1)
      .single();

    if (botProfile?.id) {
      botUserId = botProfile.id;
    } else {
      // Fallback: search profiles for bot email pattern
      const { data: botUsers } = await supabase
        .from("profiles")
        .select("id")
        .ilike("email", "%bot@%")
        .limit(1);
      botUserId = botUsers?.[0]?.id;
    }

    if (!botUserId) {
      botLogger.warn("No bot user found, cannot post thread");
      return NextResponse.json({ error: "Bot user not configured" }, { status: 500 });
    }

    const createdThreads: Array<{ id: string; source: string }> = [];

    // Try article post first
    if (articles?.length) {
      const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://ai-radar.com";
      const article = articles[0];
      const articleUrl = `${siteUrl}/news/${article.slug}`;
      const summary = await summarizeArticle(articleUrl);
      if (summary) {
        const threadContent = {
          title: summary.title ?? article.title,
          content: summary.summary,
          link_url: articleUrl,
          link_title: summary.title ?? article.title,
          link_description: summary.summary,
          link_image: summary.image ?? article.cover_image,
        };
        const { data: thread, error } = await supabase
          .from("threads")
          .insert({
            author_id: botUserId,
            content: `**${threadContent.title}**\n\n${threadContent.content}`,
            link_url: threadContent.link_url ?? null,
            link_title: threadContent.link_title ?? null,
            link_description: threadContent.link_description ?? null,
            link_image: threadContent.link_image ?? null,
            is_bot_post: true,
          })
          .select("id")
          .single();
        if (!error && thread) {
          createdThreads.push({ id: thread.id, source: "article" });
        }
      }
    }

    // Try live news post as second thread
    const news = await fetchLatestAINews();
    if (news.length) {
      for (const item of news.slice(0, 2 - createdThreads.length)) {
        const { data: thread, error } = await supabase
          .from("threads")
          .insert({
            author_id: botUserId,
            content: `**${item.title}**\n\n${item.summary}`,
            link_url: item.url,
            link_image: item.image ?? null,
            is_bot_post: true,
          })
          .select("id")
          .single();
        if (!error && thread) {
          createdThreads.push({ id: thread.id, source: "news" });
        }
        if (createdThreads.length >= 2) break;
      }
    }

    if (createdThreads.length === 0) {
      return NextResponse.json({ message: "No content available" }, { status: 200 });
    }

    return NextResponse.json({ threads: createdThreads });
  } catch (e) {
    botLogger.error({ err: e }, "Bot post error");
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}