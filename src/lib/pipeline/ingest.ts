import { audit, pipelineDb } from "./db";
import { fetchSource, listEnabledSources } from "./sources";
import { logger } from "@/lib/logger";

const log = logger.child({ component: "pipeline-ingest" });

export type IngestStats = {
  sourcesOk: number;
  sourcesFailed: number;
  totalFetched: number;
  totalNew: number;
  durationMs: number;
};

function getConflictExternalId(sourceId: string, externalId: string | null, url: string) {
  return externalId?.trim() || `${sourceId}:${url.trim()}`;
}

export async function runIngest(): Promise<IngestStats> {
  const startedAt = Date.now();
  await audit("system:ingest", "run.start");

  const sources = await listEnabledSources("rss");
  log.info({ count: sources.length }, "fetching enabled RSS sources");

  let totalFetched = 0;
  let totalNew = 0;
  let sourcesOk = 0;
  let sourcesFailed = 0;

  for (const source of sources) {
    try {
      const items = await fetchSource(source);
      totalFetched += items.length;

      const rows = items
        .filter((item) => item.url && item.title)
        .map((item) => ({
          source_id: source.id,
          external_id: getConflictExternalId(source.id, item.external_id, item.url),
          url: item.url,
          title: item.title,
          summary: item.summary,
          author: item.author,
          published_at: item.published_at,
          language: item.language,
          raw_metadata: {
            ...item.raw_metadata,
            source_name: source.name,
            source_tags: source.tags ?? [],
          },
        }));

      if (rows.length === 0) {
        sourcesOk += 1;
        continue;
      }

      const { count, error } = await pipelineDb()
        .from("raw_items")
        .upsert(rows, {
          onConflict: "url",
          ignoreDuplicates: true,
          count: "exact",
        });

      if (error) throw error;

      totalNew += count ?? 0;
      sourcesOk += 1;
      log.info({ source: source.name, fetched: items.length, inserted: count ?? 0 }, "source ingested");
    } catch (error) {
      sourcesFailed += 1;
      log.warn({ err: error, source: source.name }, "source ingest failed");
    }
  }

  const durationMs = Date.now() - startedAt;
  const stats = { sourcesOk, sourcesFailed, totalFetched, totalNew, durationMs };

  await audit("system:ingest", "run.complete", undefined, undefined, {
    sources_ok: sourcesOk,
    sources_failed: sourcesFailed,
    fetched: totalFetched,
    new: totalNew,
    duration_ms: durationMs,
  });

  return stats;
}
