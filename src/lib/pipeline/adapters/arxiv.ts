import * as cheerio from "cheerio";
import type { Source } from "@/types";
import type { NormalizedItem } from "../sources";

/**
 * arXiv API returns Atom XML.
 */
export async function fetchArxiv(source: Source): Promise<NormalizedItem[]> {
  const res = await fetch(source.url, {
    headers: { "User-Agent": "ai-radar-bot/1.0" },
  });
  if (!res.ok) throw new Error(`arXiv fetch failed: ${res.status}`);
  const xml = await res.text();
  const $ = cheerio.load(xml, { xmlMode: true });

  const items: NormalizedItem[] = [];
  $("entry").each((_, el) => {
    const $el = $(el);
    const id = $el.find("id").first().text().trim();
    const title = $el.find("title").first().text().replace(/\s+/g, " ").trim();
    const summary = $el
      .find("summary")
      .first()
      .text()
      .replace(/\s+/g, " ")
      .trim();
    const published = $el.find("published").first().text();
    const authors: string[] = [];
    $el.find("author > name").each((_i, a) => {
      authors.push($(a).text());
    });
    const url = $el.find("link[rel='alternate']").attr("href") || id;

    if (id && title) {
      items.push({
        external_id: id,
        url,
        title,
        summary: summary.slice(0, 1500) || null,
        author: authors.join(", ") || null,
        published_at: published || null,
        language: "en",
        raw_metadata: { authors },
      });
    }
  });
  return items;
}
