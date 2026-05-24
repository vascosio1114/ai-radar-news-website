import { NextResponse } from "next/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { createSupabaseServerClient } from "@/lib/supabase/server";

type Props = { params: { id: string } };

async function adminAuth(supabase: ReturnType<typeof createSupabaseServerClient>) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: NextResponse.json({ error: "Unauthorized" }, { status: 401 }), adminUser: null };
  const admin = createSupabaseAdminClient();
  const { data: profile } = await admin.from("profiles").select("is_admin").eq("id", user.id).single();
  if (!profile?.is_admin) return { error: NextResponse.json({ error: "Admin access required" }, { status: 403 }), adminUser: null };
  return { error: null, adminUser: user, admin };
}

export async function GET(request: Request, { params }: Props) {
  const supabase = createSupabaseServerClient();
  const auth = await adminAuth(supabase);
  if (auth.error) return auth.error;

  const { data: preset } = await auth.admin!
    .from("digest_presets")
    .select("*")
    .eq("id", params.id)
    .single();

  if (!preset) return NextResponse.json({ error: "Preset not found" }, { status: 404 });
  return NextResponse.json(preset);
}

export async function PUT(request: Request, { params }: Props) {
  const supabase = createSupabaseServerClient();
  const auth = await adminAuth(supabase);
  if (auth.error) return auth.error;

  const body = await request.json().catch(() => null);
  if (!body || !body.name || !body.mode) {
    return NextResponse.json({ error: "name and mode are required" }, { status: 400 });
  }

  if (body.is_default) {
    await auth.admin!.from("digest_presets").update({ is_default: false }).eq("is_default", true);
  }

  const { data: preset, error } = await auth.admin!
    .from("digest_presets")
    .update({
      name: body.name,
      description: body.description ?? null,
      mode: body.mode,
      article_ids: body.article_ids ?? [],
      criteria: body.criteria ?? {},
      is_default: body.is_default ?? false,
    })
    .eq("id", params.id)
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(preset);
}

export async function DELETE(request: Request, { params }: Props) {
  const supabase = createSupabaseServerClient();
  const auth = await adminAuth(supabase);
  if (auth.error) return auth.error;

  const { error } = await auth.admin!.from("digest_presets").delete().eq("id", params.id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}

export async function POST(request: Request, { params }: Props) {
  const supabase = createSupabaseServerClient();
  const auth = await adminAuth(supabase);
  if (auth.error) return auth.error;

  // set-default: transactionally clear others then set this one
  await auth.admin!.from("digest_presets").update({ is_default: false }).eq("is_default", true);
  const { data: preset, error } = await auth.admin!
    .from("digest_presets")
    .update({ is_default: true })
    .eq("id", params.id)
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(preset);
}