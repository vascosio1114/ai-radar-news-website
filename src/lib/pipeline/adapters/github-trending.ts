import * as cheerio from "cheerio";
import type { Source } from "@/types";
import type { NormalizedItem } from "../sources";

const AI_KEYWORDS = [
  "ai", "ml", "llm", "gpt", "claude", "gemini", "diffusion",
  "transformer", "agent", "rag", "embedding", "neural",
  "machine learning", "deep learning", "stable diffusion",
];

export async function fetchGithubTrending(
  source: Source
): Promise<NormalizedItem[]> {
  const res = await fetch(source.url, {
    headers: {
      "User-Agent": "ai-radar-bot/1.0",
      Accept: "text/html",
    },
  });
  if (!res.ok) throw new Error(`GitHub trending fetch failed: ${res.status}`);
  const html = await res.text();
  const $ = cheerio.load(html);

  const items: NormalizedItem[] = [];
  $("article.Box-row").each((_, el) => {
    const $el = $(el);
    const fullName = $el
      .find("h2 a")
      .first()
      .attr("href")
      ?.replace(/^\//, "")
      .trim();
    if (!fullName) return;

    const description = $el.find("p").first().text().trim();
    const language = $el
      .find("[itemprop='programmingLanguage']")
      .first()
      .text()
      .trim();
    const stars = $el
      .find("a[href$='/stargazers']")
      .first()
      .text()
      .replace(/\s/g, "");

    const lower = `${fullName} ${description}`.toLowerCase();
    const isAI = AI_KEYWORDS.some((k) => lower.includes(k));
    if (!isAI) return;

    items.push({
      external_id: fullName,
      url: `https://github.com/${fullName}`,
      title: fullName,
      summary: description || null,
      author: fullName.split("/")[0],
      published_at: new Date().toISOString(),
      language: "en",
      raw_metadata: {
        repo_language: language,
        stars,
      },
    });
  });
  return items;
}
