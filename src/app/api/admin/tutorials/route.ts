import { NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/admin-auth";
import { logger } from "@/lib/logger";

export const dynamic = "force-dynamic";

const log = logger.child({ component: "admin-tutorials" });

export async function GET() {
  try {
    const auth = await requireAdminApi();
    if (!auth.ok) return auth.response;
    const supabase = auth.adminDb;

    const { data, error } = await supabase
      .from("tutorials")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      log.error({ err: error }, "Failed to fetch tutorials");
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ tutorials: data });
  } catch (e) {
    log.error({ err: e }, "Unexpected error fetching tutorials");
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
