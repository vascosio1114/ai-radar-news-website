import { NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/admin-auth";
import { logger } from "@/lib/logger";

export const dynamic = "force-dynamic";

const log = logger.child({ component: "admin-users" });

export async function GET() {
  try {
    const auth = await requireAdminApi();
    if (!auth.ok) return auth.response;
    const supabase = auth.adminDb;

    // Get all Auth users with their profile is_admin status. Auth users live in the
    // private auth schema, so use the Admin Auth API instead of querying auth.users.
    const { data: authData, error: authError } = await supabase.auth.admin.listUsers({
      page: 1,
      perPage: 1000,
    });

    if (authError) {
      log.error({ err: authError }, "Failed to fetch users");
      return NextResponse.json({ error: authError.message }, { status: 500 });
    }

    const authUsers = authData.users;
    const userIds = authUsers.map((u) => u.id);
    const { data: profiles, error: profileError } = await supabase
      .from("profiles")
      .select("id, is_admin")
      .in("id", userIds);

    if (profileError) {
      log.error({ err: profileError }, "Failed to fetch profiles");
      return NextResponse.json({ error: profileError.message }, { status: 500 });
    }

    const profileMap = new Map(profiles?.map((p) => [p.id, p]) || []);
    const users = authUsers?.map((u) => ({
      id: u.id,
      email: u.email,
      created_at: u.created_at,
      last_sign_in_at: u.last_sign_in_at,
      is_admin: u.app_metadata?.role === "admin" || profileMap.get(u.id)?.is_admin === true,
    })) || [];

    return NextResponse.json({ users });
  } catch (e) {
    log.error({ err: e }, "Unexpected error fetching users");
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
