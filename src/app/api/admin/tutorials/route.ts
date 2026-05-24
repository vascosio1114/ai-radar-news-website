import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { logger } from "@/lib/logger";

const log = logger.child({ component: "admin-tutorials" });

export async function GET() {
  try {
    const supabase = createSupabaseServerClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const admin = createSupabaseAdminClient();
    const { data: profile } = await admin
      .from("profiles")
      .select("is_admin")
      .eq("id", user.id)
      .single();

    if (!profile?.is_admin) {
      return NextResponse.json({ error: "Admin access required" }, { status: 403 });
    }

    const { data, error } = await admin
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
