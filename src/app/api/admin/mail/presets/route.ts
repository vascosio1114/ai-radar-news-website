import { NextResponse } from "next/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { createSupabaseServerClient } from "@/lib/supabase/server";

async function adminAuth(supabase: ReturnType<typeof createSupabaseServerClient>) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: NextResponse.json({ error: "Unauthorized" }, { status: 401 }), adminUser: null };
  const admin = createSupabaseAdminClient();
  const { data: profile } = await admin.from("profiles").select("is_admin").eq("id", user.id).single();
  if (!profile?.is_admin) return { error: NextResponse.json({ error: "Admin access required" }, { status: 403 }), adminUser: null };
  return { error: null, adminUser: user, admin };
}

export async function GET() {
  const supabase = createSupabaseServerClient();
  const auth = await adminAuth(supabase);
  if (auth.error) return auth.error;

  const { data: presets } = await auth.admin!
    .from("digest_presets")
    .select("*")
    .order("created_at", { ascending: false });

  return NextResponse.json(presets ?? []);
}

export async function POST(request: Request) {
  const supabase = createSupabaseServerClient();
  const auth = await adminAuth(supabase);
  if (auth.error) return auth.error;

  const body = await request.json().catch(() => null);
  if (!body || !body.name || !body.mode) {
    return NextResponse.json({ error: "name and mode are required" }, { status: 400 });
  }
  if (!["manual", "criteria"].includes(body.mode)) {
    return NextResponse.json({ error: "mode must be 'manual' or 'criteria'" }, { status: 400 });
  }

  // If setting as default, clear other defaults first
  if (body.is_default) {
    await auth.admin!.from("digest_presets").update({ is_default: false }).eq("is_default", true);
  }

  const { data: preset, error } = await auth.admin!
    .from("digest_presets")
    .insert({
      name: body.name,
      description: body.description ?? null,
      mode: body.mode,
      article_ids: body.article_ids ?? [],
      criteria: body.criteria ?? {},
      is_default: body.is_default ?? false,
      content_mode: body.content_mode ?? "excerpt",
    })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(preset, { status: 201 });
}