import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { buildConfirmationHtml } from "@/lib/email-templates";
import { sendHtmlEmail, MailSettings } from "@/lib/mail";
import { SITE_URL } from "@/lib/site";

export async function GET() {
  const supabase = createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data, error } = await supabase
    .from("mail_subscribers")
    .select("id, email, opted_in, is_confirmed, subscribed_at")
    .order("subscribed_at", { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ subscribers: data || [] });
}

export async function POST(request: Request) {
  const body = await request.json();
  if (!body.email || !body.email.includes("@")) {
    return NextResponse.json({ error: "Invalid email" }, { status: 400 });
  }

  const supabase = createSupabaseAdminClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const confirmUrl = `${SITE_URL}/api/confirm/${Buffer.from(body.email).toString("base64url")}`;
  const confirmHtml = buildConfirmationHtml({ confirmUrl, lang: body.lang || "zh" });

  const { data: settings } = await supabase
    .from("mail_settings")
    .select("smtp_host, smtp_port, smtp_user, smtp_pass_encrypted, smtp_from_address, smtp_from_name")
    .limit(1)
    .single();

  const insertPayload = {
    email: body.email,
    opted_in: false,
    is_confirmed: false,
    subscribed_at: new Date().toISOString(),
  };

  const { error } = await supabase
    .from("mail_subscribers")
    .upsert(insertPayload, { onConflict: "email" });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // Send confirmation email
  if (settings) {
    await sendHtmlEmail(
      settings as MailSettings,
      body.email,
      "確認訂閱 AI Radar 每日速報",
      confirmHtml
    );
  }

  return NextResponse.json({ ok: true });
}