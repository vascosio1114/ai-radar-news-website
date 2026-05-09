/**
 * Minimal ingest pipeline: fetch from all enabled sources → upsert into raw_items.
 *
 * Dedupe via UNIQUE (source_id, external_id) constraint — no embedding needed yet.
 * Score / draft generation will be added in later phases.
 *
 * Run:
 *   npm run pipeline:ingest
 */
import "./_setup";
import { step, ok, warn } from "./_setup";
import { listEnabledSources, fetchSource } from "@/lib/pipeline/sources";
import { pipelineDb, audit } from "@/lib/pipeline/db";

async function main() {
  const startedAt = Date.now();
  await audit("system:ingest", "run.start");

  const sources = await listEnabledSources();
  step(`Fetching ${sources.length} sources`);

  let totalFetched = 0;
  let totalNew = 0;
  let sourcesOk = 0;
  let sourcesFailed = 0;

  for (const source of sources) {
    try {
      step(`→ ${source.name} (${source.kind})`);
      const items = await fetchSource(source);
      totalFetched += items.length;

      if (items.length === 0) {
        ok("nothing fetched");
        sourcesOk += 1;
        continue;
      }

      // Upsert with on-conflict-do-nothing (dedupe by source_id + external_id)
      const rows = items.map((it) => ({
        source_id: source.id,
        external_id: it.external_id,
        url: it.url,
        title: it.title,
        summary: it.summary,
        author: it.author,
        published_at: it.published_at,
        language: it.language,
        raw_metadata: it.raw_metadata,
      }));

      const { count, error } = await pipelineDb()
        .from("raw_items")
        .upsert(rows, {
          onConflict: "source_id,external_id",
          ignoreDuplicates: true,
          count: "exact",
        });

      if (error) throw error;

      const inserted = count ?? 0;
      totalNew += inserted;
      ok(`fetched ${items.length}, new ${inserted}`);
      sourcesOk += 1;
    } catch (e) {
      warn(`source ${source.name} failed`, e);
      sourcesFailed += 1;
    }
  }

  const tookMs = Date.now() - startedAt;
  ok(
    `Done in ${(tookMs / 1000).toFixed(1)}s — sources ok ${sourcesOk}, failed ${sourcesFailed}, fetched ${totalFetched}, new ${totalNew}`
  );

  await audit("system:ingest", "run.complete", undefined, undefined, {
    sources_ok: sourcesOk,
    sources_failed: sourcesFailed,
    fetched: totalFetched,
    new: totalNew,
    duration_ms: tookMs,
  });
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
