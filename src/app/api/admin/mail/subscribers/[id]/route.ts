import { NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/admin-auth";

export const dynamic = "force-dynamic";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAdminApi();
  if (!auth.ok) return auth.response;
  const supabase = auth.adminDb;
  const { id } = await params;

  const { data, error } = await supabase
    .from("mail_subscribers")
    .select("id, email, opted_in, is_confirmed, subscribed_at")
    .eq("id", id)
    .single();

  if (error) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ subscriber: data });
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAdminApi();
  if (!auth.ok) return auth.response;
  const supabase = auth.adminDb;
  const { id } = await params;
  const body = await request.json();

  const allowed: Record<string, unknown> = {};
  if (typeof body.opted_in === "boolean") allowed.opted_in = body.opted_in;
  if (typeof body.is_confirmed === "boolean") allowed.is_confirmed = body.is_confirmed;

  const { error } = await supabase
    .from("mail_subscribers")
    .update(allowed)
    .eq("id", id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAdminApi();
  if (!auth.ok) return auth.response;
  const supabase = auth.adminDb;
  const { id } = await params;

  const { error } = await supabase
    .from("mail_subscribers")
    .delete()
    .eq("id", id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
