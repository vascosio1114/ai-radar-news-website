import { NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/admin-auth";
import { encryptPassword } from "@/lib/mail";

export const dynamic = "force-dynamic";

export async function GET() {
  const auth = await requireAdminApi();
  if (!auth.ok) return auth.response;
  const supabase = auth.adminDb;

  const { data, error } = await supabase
    .from("mail_settings")
    .select("*")
    .limit(1)
    .single();

  if (error && error.code !== "PGRST116") {
    return NextResponse.json({ error: "Failed to load settings" }, { status: 500 });
  }
  return NextResponse.json({ settings: data || {} });
}

export async function POST(request: Request) {
  const body = await request.json();
  const auth = await requireAdminApi();
  if (!auth.ok) return auth.response;
  const supabase = auth.adminDb;

  const encKey = Buffer.from(process.env.MAIL_ENCRYPTION_KEY || "", "hex");
  if (encKey.length !== 32) {
    return NextResponse.json({ error: "MAIL_ENCRYPTION_KEY must be 32 bytes" }, { status: 500 });
  }
  const smtpPassEncrypted = body.smtp_pass
    ? encryptPassword(body.smtp_pass, encKey)
    : undefined;

  const payload = {
    smtp_host: body.smtp_host,
    smtp_port: body.smtp_port,
    smtp_user: body.smtp_user,
    smtp_pass_encrypted: smtpPassEncrypted,
    smtp_from_address: body.smtp_from_address,
    smtp_from_name: body.smtp_from_name,
    daily_enabled: body.daily_enabled,
    daily_hour: body.daily_hour,
    daily_timezone: body.daily_timezone,
    email_subject_template: body.email_subject_template,
    email_header_html: body.email_header_html,
    email_footer_html: body.email_footer_html,
    updated_at: new Date().toISOString(),
  };

  // Upsert: fetch existing row to get id, then upsert
  const { data: existing } = await supabase
    .from("mail_settings")
    .select("id")
    .limit(1)
    .single();

  const upsertData = existing
    ? { ...payload, id: existing.id }
    : payload;

  const { error } = await supabase
    .from("mail_settings")
    .upsert(upsertData, { onConflict: "id" });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ ok: true });
}
