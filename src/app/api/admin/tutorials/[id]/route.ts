import { NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/admin-auth";
import { logger } from "@/lib/logger";

export const dynamic = "force-dynamic";

const log = logger.child({ component: "admin-tutorials-id" });

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const auth = await requireAdminApi();
    if (!auth.ok) return auth.response;
    const supabase = auth.adminDb;

    const { error } = await supabase.from("tutorials").delete().eq("id", id);

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
    const auth = await requireAdminApi();
    if (!auth.ok) return auth.response;
    const supabase = auth.adminDb;

    const { error } = await supabase
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
