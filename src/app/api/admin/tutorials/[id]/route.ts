import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { logger } from "@/lib/logger";

const log = logger.child({ component: "admin-tutorials-id" });

async function adminUser() {
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
  return admin;
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const admin = await adminUser();
    if (admin instanceof Response) return admin;

    const { error } = await admin.from("tutorials").delete().eq("id", id);

    if (error) {
      log.error({ err: error, id }, "Failed to delete tutorial");
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ ok: true });
  } catch (e) {
    log.error({ err: e }, "Unexpected error deleting tutorial");
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();
    const admin = await adminUser();
    if (admin instanceof Response) return admin;

    const { error } = await admin
      .from("tutorials")
      .update({ is_published: body.is_published })
      .eq("id", id);

    if (error) {
      log.error({ err: error, id }, "Failed to update tutorial");
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ ok: true });
  } catch (e) {
    log.error({ err: e }, "Unexpected error updating tutorial");
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
