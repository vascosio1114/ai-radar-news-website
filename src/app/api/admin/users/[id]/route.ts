import { NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/admin-auth";
import { logger } from "@/lib/logger";

export const dynamic = "force-dynamic";

const log = logger.child({ component: "admin-users-id" });

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();
    const auth = await requireAdminApi();
    if (!auth.ok) return auth.response;
    const supabase = auth.adminDb;

    const isAdmin = Boolean(body.is_admin);
    const { data: targetUser, error: targetError } = await supabase.auth.admin.getUserById(id);

    if (targetError || !targetUser.user?.email) {
      return NextResponse.json({ error: targetError?.message || "User not found" }, { status: 404 });
    }

    const { error } = await supabase
      .from("profiles")
      .upsert({
        id,
        email: targetUser.user.email,
        display_name: targetUser.user.user_metadata?.name || targetUser.user.user_metadata?.full_name || targetUser.user.email.split("@")[0],
        avatar_url: targetUser.user.user_metadata?.avatar_url || null,
        is_admin: isAdmin,
        updated_at: new Date().toISOString(),
      }, { onConflict: "id" });

    if (error) {
      log.error({ err: error, id }, "Failed to update user profile role");
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const { error: authError } = await supabase.auth.admin.updateUserById(id, {
      app_metadata: isAdmin ? { role: "admin", is_admin: true } : { role: "user", is_admin: false },
    });

    if (authError) {
      log.error({ err: authError, id }, "Failed to update auth app metadata role");
      return NextResponse.json({ error: authError.message }, { status: 500 });
    }

    return NextResponse.json({ ok: true });
  } catch (e) {
    log.error({ err: e }, "Unexpected error updating user");
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
