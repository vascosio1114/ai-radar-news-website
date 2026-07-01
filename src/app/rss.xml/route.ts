import { SITE_NAME, SITE_URL } from "@/lib/site";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

function escapeXml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

export async function GET() {
  const supabase = createSupabaseServerClient();
  const { data: articles } = await supabase
    .from("articles_public")
    .select("slug,title,excerpt,published_at,updated_at")
    .eq("is_published", true)
    .order("published_at", { ascending: false })
    .limit(30);

  const items = (articles ?? [])
    .map((article) => {
      const url = `${SITE_URL}/zh/news/${article.slug}`;
      const pubDate = new Date(
        article.published_at ?? article.updated_at ?? Date.now()
      ).toUTCString();

      return `
        <item>
          <title>${escapeXml(article.title ?? "AI Radar Article")}</title>
          <link>${escapeXml(url)}</link>
          <guid>${escapeXml(url)}</guid>
          <pubDate>${pubDate}</pubDate>
          <description>${escapeXml(article.excerpt ?? "")}</description>
        </item>`;
    })
    .join("");

  const xml = `<?xml version="1.0" encoding="UTF-8" ?>
    <rss version="2.0">
      <channel>
        <title>${escapeXml(SITE_NAME)}</title>
        <link>${escapeXml(SITE_URL)}</link>
        <description>${escapeXml("AI articles, tools, tutorials and trend analysis.")}</description>
        <language>zh-Hant</language>
        <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
        ${items}
      </channel>
    </rss>`;

  return new Response(xml.trim(), {
    headers: {
      "Content-Type": "application/rss+xml; charset=utf-8",
      "Cache-Control": "s-maxage=3600, stale-while-revalidate=86400",
    },
  });
}
