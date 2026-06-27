import "./_setup";
import { ok, step } from "./_setup";
import { runDraftGeneration } from "@/lib/pipeline/draft";
import { runIngest } from "@/lib/pipeline/ingest";

async function main() {
  step("Running news ingest");
  const ingest = await runIngest();
  ok(
    `Ingest done in ${(ingest.durationMs / 1000).toFixed(1)}s; sources ok ${ingest.sourcesOk}, failed ${ingest.sourcesFailed}, fetched ${ingest.totalFetched}, new ${ingest.totalNew}`
  );

  step("Generating AI article drafts");
  const draft = await runDraftGeneration();
  ok(
    `Draft done in ${(draft.durationMs / 1000).toFixed(1)}s; considered ${draft.considered}, drafted ${draft.drafted}, skipped ${draft.skipped}, failed ${draft.failed}`
  );
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
