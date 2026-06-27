import { NextResponse } from "next/server";
import { runDraftGeneration } from "@/lib/pipeline/draft";
import { runIngest } from "@/lib/pipeline/ingest";
import { logger } from "@/lib/logger";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";
export const maxDuration = 300;

const log = logger.child({ component: "cron-news" });

function isAuthorized(request: Request) {
  const secret = process.env.CRON_SECRET;
  if (!secret) return false;

  const url = new URL(request.url);
  const authorization = request.headers.get("authorization");
  const headerSecret = request.headers.get("x-cron-secret");
  const querySecret = url.searchParams.get("secret");

  return (
    authorization === `Bearer ${secret}` ||
    headerSecret === secret ||
    querySecret === secret
  );
}

export async function GET(request: Request) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const ingest = await runIngest();
    const draft = await runDraftGeneration();

    return NextResponse.json({
      ok: true,
      ingest,
      draft,
    });
  } catch (error) {
    log.error({ err: error }, "news cron failed");
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Cron failed" },
      { status: 500 }
    );
  }
}
