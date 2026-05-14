import { NextResponse } from "next/server";
import { pipelineDb } from "@/lib/pipeline/db";
import { SITE_URL } from "@/lib/site";

const CRON_SECRET = process.env.CRON_SECRET;
const MINIMAX_API_KEY = process.env.MINIMAX_API_KEY;
const BOT_DISPLAY_NAME = "AI Radar Bot";
const BOT_AVATAR_URL = "https://api.dicebear.com/7.x/bottts/svg?seed=ai-radar-bot";

interface BotSettings {
  enabled: boolean;
  daily_post_time: string;
  comment_enabled: boolean;
}

interface Article {
  id: string;
  slug: string;
  title: string;
  excerpt: string | null;
  cover_image: string | null;
  published_at: string;
  summary_content: string | null;
}

async function fetchLatestAINews(): Promise<{ title: string; snippet: string; link: string } | null> {
  if (!MINIMAX_API_KEY) return null;

  try {
    const response = await fetch("https://api.minimax.chat/v1/web_search", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${MINIMAX_API_KEY}`,
      },
      body: JSON.stringify({
        model: "minimax/web-search",
        query: "latest artificial intelligence news 2026",
        search_base: "general",
        num_results: 3,
      }),
    });

    if (!response.ok) {
      console.error("[bot/post] MiniMax API error:", response.status);
      return null;
    }

    const data = await response.json();
    const results = data?.data?.web_searches || data?.results || [];

    if (results.length > 0) {
      const top = results[0];
      return {
        title: top.title || top.title_en || "Latest AI News",
        snippet: top.description || top.snippet || "",
        link: top.url || top.link || "",
      };
    }

    return null;
  } catch (e) {
    console.error("[bot/post] web search failed:", e);
    return null;
  }
}

export async function POST(request: Request) {
  // Validate cron secret
  const authHeader = request.headers.get("authorization");
  if (CRON_SECRET && authHeader !== `Bearer ${CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = pipelineDb();

  // Load bot settings
  const { data: settings } = await supabase
    .from("bot_settings")
    .select("*")
    .limit(1)
    .single<BotSettings>();

  // If bot disabled, skip silently
  if (settings && !settings.enabled) {
    return NextResponse.json({ message: "bot disabled" });
  }

  const posted: string[] = [];

  // 1. Post from AI Radar articles
  const { data: articles } = await supabase
    .from("articles")
    .select("id, slug, title, excerpt, cover_image, published_at, summary_content")
    .eq("is_published", true)
    .order("published_at", { ascending: false })
    .limit(3);

  if (articles && articles.length > 0) {
    const article = articles[0];
    const summary = article.summary_content || article.excerpt || "";
    const truncatedSummary =
      summary.length > 280 ? summary.slice(0, 277) + "..." : summary;

    const { data: thread } = await supabase
      .from("threads")
      .insert({
        author_id: "00000000-0000-0000-0000-000000000000", // bot user placeholder
        content: `**${article.title}**\n\n${truncatedSummary}`,
        image_url: article.cover_image || null,
        link_url: `${SITE_URL}/news/${article.slug}`,
        link_title: "Read full article on AI Radar",
        link_description: article.excerpt || undefined,
        link_image: article.cover_image || undefined,
        is_bot_post: true,
      })
      .select("id")
      .single();

    if (thread) {
      posted.push(`article:${article.slug}`);
    }
  }

  // 2. Post from live web search (if MiniMax API available)
  const latestNews = await fetchLatestAINews();
  if (latestNews) {
    const title = latestNews.title;
    const snippet = latestNews.snippet;
    const truncatedSnippet =
      snippet.length > 280 ? snippet.slice(0, 277) + "..." : snippet;

    const { data: thread } = await supabase
      .from("threads")
      .insert({
        author_id: "00000000-0000-0000-0000-000000000000",
        content: `**${title}**\n\n${truncatedSnippet}`,
        link_url: latestNews.link,
        link_title: title,
        link_description: snippet,
        is_bot_post: true,
      })
      .select("id")
      .single();

    if (thread) {
      posted.push(`web_search:${latestNews.link}`);
    }
  }

  return NextResponse.json({
    posted: posted.length,
    threads: posted,
  });
}