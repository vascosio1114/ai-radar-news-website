import { NextResponse } from "next/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { logger } from "@/lib/logger";

const log = logger.child({ component: "admin-users" });

export async function GET() {
  try {
    const supabase = createSupabaseAdminClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("is_admin")
      .eq("id", user.id)
      .single();

    if (!profile?.is_admin) {
      return NextResponse.json({ error: "Admin access required" }, { status: 403 });
    }

    // Get all users with their profile is_admin status
    const { data: authUsers, error: authError } = await supabase
      .from("auth.users")
      .select("id, email, created_at, last_sign_in_at")
      .order("created_at", { ascending: false });

    if (authError) {
      log.error({ err: authError }, "Failed to fetch users");
      return NextResponse.json({ error: authError.message }, { status: 500 });
    }

    const userIds = authUsers?.map((u) => u.id) || [];
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
      is_admin: profileMap.get(u.id)?.is_admin ?? false,
    })) || [];

    return NextResponse.json({ users });
  } catch (e) {
    log.error({ err: e }, "Unexpected error fetching users");
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}