/**
 * Generic HTML scraper. Used for sources without RSS feed (e.g. anthropic.com/news).
 * Tries JSON-LD article schema first; falls back to per-source CSS selectors via
 * `source.config.selectors`.
 */
import * as cheerio from "cheerio";
import type { Source } from "@/types";
import type { NormalizedItem } from "../sources";

type Selectors = {
  item: string;
  title?: string;
  link?: string;
  summary?: string;
};

export async function fetchScrapeGeneric(
  source: Source
): Promise<NormalizedItem[]> {
  const res = await fetch(source.url, {
    headers: {
      "User-Agent": "ai-radar-bot/1.0",
      Accept: "text/html",
    },
  });
  if (!res.ok) throw new Error(`Scrape failed ${source.url}: ${res.status}`);
  const html = await res.text();
  const $ = cheerio.load(html);

  // 1. Try JSON-LD ItemList of NewsArticle
  const jsonld = extractJsonLd($);
  if (jsonld.length > 0) return jsonld.map((j) => normalizeJsonLd(j, source));

  // 2. Fall back to per-source selectors
  const sel: Selectors = (source.config?.selectors as Selectors) || {
    item: "article",
    title: "h2, h3",
    link: "a",
    summary: "p",
  };

  const items: NormalizedItem[] = [];
  $(sel.item).each((_, el) => {
    const $el = $(el);
    const title =
      ($el.find(sel.title || "h2, h3").first().text() || "").trim();
    const href = $el.find(sel.link || "a").first().attr("href");
    if (!title || !href) return;
    const url = absUrl(href, source.url);
    const summary =
      $el.find(sel.summary || "p").first().text().trim().slice(0, 500) || null;
    items.push({
      external_id: url,
      url,
      title,
      summary,
      author: null,
      published_at: null,
      language: source.language || "en",
      raw_metadata: {},
    });
  });
  return items;
}

function absUrl(href: string, base: string) {
  try {
    return new URL(href, base).toString();
  } catch {
    return href;
  }
}

function extractJsonLd($: cheerio.CheerioAPI): unknown[] {
  const out: unknown[] = [];
  $('script[type="application/ld+json"]').each((_, el) => {
    try {
      const json = JSON.parse($(el).text());
      const arr = Array.isArray(json) ? json : [json];
      for (const j of arr) {
        if (j["@type"] === "NewsArticle" || j["@type"] === "Article") out.push(j);
        if (j["@type"] === "ItemList" && Array.isArray(j.itemListElement)) {
          for (const e of j.itemListElement) {
            if (e?.item) out.push(e.item);
          }
        }
      }
    } catch {
      // skip malformed JSON-LD
    }
  });
  return out;
}

function normalizeJsonLd(j: unknown, source: Source): NormalizedItem {
  const o = j as {
    headline?: string;
    name?: string;
    url?: string;
    description?: string;
    datePublished?: string;
    author?: { name?: string } | { name?: string }[];
  };
  const title = o.headline || o.name || "";
  const url = o.url || source.url;
  const author = Array.isArray(o.author)
    ? o.author.map((a) => a.name).filter(Boolean).join(", ")
    : o.author?.name ?? null;
  return {
    external_id: url,
    url,
    title: title.trim(),
    summary: o.description?.slice(0, 1000) || null,
    author: author || null,
    published_at: o.datePublished || null,
    language: source.language || "en",
    raw_metadata: { source: "jsonld" },
  };
}
