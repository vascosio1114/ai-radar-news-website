import { NextResponse } from "next/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { buildWelcomeHtml } from "@/lib/email-templates";
import { generateUnsubscribeToken } from "@/lib/unsubscribe-token";
import { sendHtmlEmail, MailSettings } from "@/lib/mail";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ email: string }> }
) {
  const { email: emailB64 } = await params;
  let email: string;
  try {
    email = Buffer.from(emailB64, "base64url").toString("utf8");
  } catch {
    return new Response("Invalid confirmation link.", { status: 400 });
  }

  const supabase = createSupabaseAdminClient();

  // Update subscriber to confirmed
  const { error } = await supabase
    .from("mail_subscribers")
    .update({ opted_in: true, is_confirmed: true })
    .eq("email", email);

  if (error) {
    return new Response("Confirmation failed. Please contact support.", { status: 500 });
  }

  // Send welcome email with unsubscribe link
  const unsubToken = generateUnsubscribeToken(email);
  const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://ai-radar.com";
  const unsubUrl = `${SITE_URL}/api/unsubscribe?token=${unsubToken}`;

  const { data: settings } = await supabase
    .from("mail_settings")
    .select("smtp_host, smtp_port, smtp_user, smtp_pass_encrypted, smtp_from_address, smtp_from_name")
    .limit(1)
    .single();

  if (settings) {
    const welcomeHtml = buildWelcomeHtml({ unsubscribeUrl: unsubUrl, siteUrl: SITE_URL, lang: "zh" });
    await sendHtmlEmail(
      settings as MailSettings,
      email,
      "歡迎訂閱 AI Radar ✅",
      welcomeHtml
    );
  }

  return new Response(
    `<!DOCTYPE html>
<html>
<body style="font-family:system-ui,sans-serif;max-width:600px;margin:0 auto;padding:24px;color:#1a1a1a;background:#f9f9f9;">
  <div style="background:#fff;border-radius:12px;padding:32px;text-align:center;">
    <h1 style="font-size:24px;margin:0 0 16px;color:#16a34a;">✓ 訂閱已確認！</h1>
    <p style="color:#666;font-size:16px;">您已成功確認訂閱。我們會在每天為您精選 AI 資訊。</p>
    <a href="${SITE_URL}" style="display:inline-block;margin-top:24px;background:#2563eb;color:#fff;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:600;">返回 AI Radar</a>
  </div>
</body>
</html>`,
    { headers: { "Content-Type": "text/html" } }
  );
}