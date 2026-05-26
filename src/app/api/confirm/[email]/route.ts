import { NextResponse } from "next/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { buildWelcomeHtml, buildOnboardingHtml } from "@/lib/email-templates";
import { generateUnsubscribeToken } from "@/lib/unsubscribe-token";
import { sendHtmlEmail, MailSettings } from "@/lib/mail";
import { SITE_URL } from "@/lib/site";

/**
 * Confirmation route — called when a user clicks the link in their email.
 * Uses a secure confirmation token to look up and confirm the subscriber.
 */
export async function GET(
  request: Request,
  { params }: { params: Promise<{ email: string }> }
) {
  const { email: token } = await params;

  if (!token) {
    return new Response("Invalid confirmation link.", { status: 400 });
  }

  const supabase = createSupabaseAdminClient();

  // Find subscriber by confirmation_token
  const { data: subscriber, error: findError } = await supabase
    .from("mail_subscribers")
    .select("email")
    .eq("confirmation_token", token)
    .single();

  if (findError || !subscriber) {
    return new Response("Invalid or expired confirmation link.", { status: 400 });
  }

  const email = subscriber.email;

  // Update subscriber to confirmed and clear the token
  const { error } = await supabase
    .from("mail_subscribers")
    .update({
      opted_in: true,
      is_confirmed: true,
      confirmation_token: null,
      confirmed_at: new Date().toISOString(),
    })
    .eq("email", email);

  if (error) {
    return new Response("Confirmation failed. Please contact support.", { status: 500 });
  }

  // Generate unsubscribe token
  const unsubToken = generateUnsubscribeToken(email);
  const unsubUrl = `${SITE_URL}/api/unsubscribe?token=${unsubToken}`;

  // Fetch mail settings for SMTPG
  const { data: settings } = await supabase
    .from("mail_settings")
    .select("smtp_host, smtp_port, smtp_user, smtp_pass_encrypted, smtp_from_address, smtp_from_name")
    .limit(1)
    .single();

  if (settings) {
    const mailSettings = settings as MailSettings;

    // Send welcome email
    const welcomeHtml = buildWelcomeHtml({ unsubscribeUrl: unsubUrl, siteUrl: SITE_URL, lang: "zh" });
    await sendHtmlEmail(mailSettings, email, "歡迎訂閱 AI Radar ✅", welcomeHtml);

    // Send onboarding email if enabled
    const onboardingSettings = await supabase
      .from("mail_settings")
      .select(
        "onboarding_enabled, onboarding_subject, onboarding_intro_text, onboarding_cta_text, onboarding_cta_url, onboarding_featured_article_id"
      )
      .limit(1)
      .single();

    const ob = onboardingSettings.data;
    if (ob?.onboarding_enabled) {
      let featuredArticle = null;
      if (ob.onboarding_featured_article_id) {
        const { data: article } = await supabase
          .from("articles")
          .select("title, excerpt, cover_image, slug, published_at")
          .eq("id", ob.onboarding_featured_article_id)
          .single();
        if (article) {
          featuredArticle = {
            ...article,
            url: `${SITE_URL}/zh/news/${article.slug}`,
          };
        }
      }

      const onboardingHtml = buildOnboardingHtml({
        ctaText: ob.onboarding_cta_text || undefined,
        ctaUrl: ob.onboarding_cta_url || undefined,
        featuredArticle: featuredArticle || undefined,
        unsubscribeUrl: unsubUrl,
        siteUrl: SITE_URL,
        lang: "zh",
      });

      await sendHtmlEmail(
        mailSettings,
        email,
        ob.onboarding_subject || "歡迎加入 AI Radar — 這裡是你會收到的內容",
        onboardingHtml
      );
    }
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
