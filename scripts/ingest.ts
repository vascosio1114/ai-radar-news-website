import "./_setup";
import { ok, step } from "./_setup";
import { runIngest } from "@/lib/pipeline/ingest";

async function main() {
  step("Running RSS ingest");
  const stats = await runIngest();
  ok(
    `Done in ${(stats.durationMs / 1000).toFixed(1)}s; sources ok ${stats.sourcesOk}, failed ${stats.sourcesFailed}, fetched ${stats.totalFetched}, new ${stats.totalNew}`
  );
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
