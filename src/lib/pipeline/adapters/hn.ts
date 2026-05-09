import type { Source } from "@/types";
import type { NormalizedItem } from "../sources";

type HNHit = {
  objectID: string;
  url: string | null;
  title: string;
  story_text?: string | null;
  author: string;
  created_at: string;
  points: number;
  num_comments: number;
};

export async function fetchHN(source: Source): Promise<NormalizedItem[]> {
  const res = await fetch(source.url, {
    headers: { "User-Agent": "ai-radar-bot/1.0" },
  });
  if (!res.ok) throw new Error(`HN fetch failed: ${res.status}`);
  const json = (await res.json()) as { hits?: HNHit[] };

  return (json.hits ?? [])
    .filter((h) => h.title)
    .map((h): NormalizedItem => ({
      external_id: h.objectID,
      url: h.url || `https://news.ycombinator.com/item?id=${h.objectID}`,
      title: h.title.trim(),
      summary: (h.story_text ?? "").slice(0, 1000) || null,
      author: h.author,
      published_at: h.created_at,
      language: source.language || "en",
      raw_metadata: {
        points: h.points,
        num_comments: h.num_comments,
      },
    }));
}
