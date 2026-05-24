import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { logger } from "@/lib/logger";

const log = logger.child({ component: "admin-articles-id" });

async function adminUser(request: Request) {
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
  return { user, admin };
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const auth = await adminUser(_req);
    if (auth instanceof Response) return auth;

    const { error } = await auth.admin.from("articles").delete().eq("id", id);

    if (error) {
      log.error({ err: error, id }, "Failed to delete article");
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ ok: true });
  } catch (e) {
    log.error({ err: e }, "Unexpected error deleting article");
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
    const auth = await adminUser(req);
    if (auth instanceof Response) return auth;

    const { error } = await auth.admin
      .from("articles")
      .update({ is_published: body.is_published })
      .eq("id", id);

    if (error) {
      log.error({ err: error, id }, "Failed to update article");
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ ok: true });
  } catch (e) {
    log.error({ err: e }, "Unexpected error updating article");
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
