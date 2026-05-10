/**
 * Source registry — maps each enabled source row to a fetch adapter.
 */
import { pipelineDb, audit } from "./db";
import type { Source, SourceKind } from "@/types";
import { fetchRss } from "./adapters/rss";
import { fetchReddit } from "./adapters/reddit";
import { fetchHN } from "./adapters/hn";
import { fetchArxiv } from "./adapters/arxiv";
import { fetchGithubTrending } from "./adapters/github-trending";
import { fetchScrapeGeneric } from "./adapters/scrape";
import { logger } from "@/lib/logger";

const sourcesLog = logger.child({ component: "sources" });

export type NormalizedItem = {
  external_id: string;
  url: string;
  title: string;
  summary: string | null;
  author: string | null;
  published_at: string | null;
  language: string;
  raw_metadata: Record<string, unknown>;
};

export type Adapter = (source: Source) => Promise<NormalizedItem[]>;

const ADAPTERS: Record<SourceKind, Adapter> = {
  rss: fetchRss,
  reddit: fetchReddit,
  hn: fetchHN,
  arxiv: fetchArxiv,
  github_trending: fetchGithubTrending,
  scrape: fetchScrapeGeneric,
};

export async function listEnabledSources(): Promise<Source[]> {
  const { data, error } = await pipelineDb()
    .from("sources")
    .select("*")
    .eq("is_enabled", true);
  if (error) throw error;
  return (data as Source[]) ?? [];
}

export async function fetchSource(source: Source): Promise<NormalizedItem[]> {
  const adapter = ADAPTERS[source.kind];
  if (!adapter) {
    throw new Error(`No adapter for source kind: ${source.kind}`);
  }
  sourcesLog.info({ source: source.name, kind: source.kind }, "fetching source");
  try {
    const items = await adapter(source);
    sourcesLog.info({ source: source.name, count: items.length }, "source fetched");
    await pipelineDb()
      .from("sources")
      .update({ last_fetched_at: new Date().toISOString(), last_error: null })
      .eq("id", source.id);
    await audit("system:ingest", "source.fetch", "source", source.id, {
      count: items.length,
    });
    return items;
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    sourcesLog.error({ source: source.name, err: msg }, "source failed");
    await pipelineDb()
      .from("sources")
      .update({ last_error: msg })
      .eq("id", source.id);
    await audit("system:ingest", "source.error", "source", source.id, {
      error: msg,
    });
    throw e;
  }
}
