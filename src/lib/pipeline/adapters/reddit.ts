import type { Source } from "@/types";
import type { NormalizedItem } from "../sources";

type RedditChild = {
  data: {
    id: string;
    permalink: string;
    title: string;
    selftext?: string;
    author?: string;
    created_utc: number;
    score?: number;
    num_comments?: number;
    url?: string;
    domain?: string;
  };
};

export async function fetchReddit(source: Source): Promise<NormalizedItem[]> {
  const res = await fetch(source.url, {
    headers: { "User-Agent": "ai-radar-bot/1.0" },
  });
  if (!res.ok) throw new Error(`Reddit fetch failed: ${res.status}`);
  const json = (await res.json()) as { data?: { children?: RedditChild[] } };
  const children = json?.data?.children ?? [];

  return children.map((c): NormalizedItem => {
    const d = c.data;
    return {
      external_id: d.id,
      url: `https://www.reddit.com${d.permalink}`,
      title: d.title.trim(),
      summary: (d.selftext ?? "").slice(0, 1000) || null,
      author: d.author ? `u/${d.author}` : null,
      published_at: new Date(d.created_utc * 1000).toISOString(),
      language: source.language || "en",
      raw_metadata: {
        score: d.score,
        num_comments: d.num_comments,
        external_url: d.url,
        domain: d.domain,
      },
    };
  });
}
