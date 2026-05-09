import Parser from "rss-parser";
import type { Source } from "@/types";
import type { NormalizedItem } from "../sources";

const parser = new Parser({
  timeout: 30_000,
  headers: { "User-Agent": "ai-radar-bot/1.0" },
});

export async function fetchRss(source: Source): Promise<NormalizedItem[]> {
  const feed = await parser.parseURL(source.url);
  return (feed.items ?? [])
    .map((it): NormalizedItem | null => {
      if (!it.link || !it.title) return null;
      return {
        external_id: it.guid || it.link,
        url: it.link,
        title: it.title.trim(),
        summary:
          (it.contentSnippet ?? it.content ?? it.summary ?? "")
            .toString()
            .replace(/\s+/g, " ")
            .trim()
            .slice(0, 1000) || null,
        author: it.creator || (it as { author?: string }).author || null,
        published_at: it.isoDate ?? it.pubDate ?? null,
        language: source.language || "en",
        raw_metadata: {
          categories: it.categories ?? [],
        },
      };
    })
    .filter(Boolean) as NormalizedItem[];
}
