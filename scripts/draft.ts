import "./_setup";
import { ok, step } from "./_setup";
import { runDraftGeneration } from "@/lib/pipeline/draft";

async function main() {
  step("Generating AI article drafts");
  const stats = await runDraftGeneration();
  ok(
    `Done in ${(stats.durationMs / 1000).toFixed(1)}s; considered ${stats.considered}, drafted ${stats.drafted}, skipped ${stats.skipped}, failed ${stats.failed}`
  );
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
