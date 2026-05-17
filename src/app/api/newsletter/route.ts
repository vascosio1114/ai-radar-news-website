import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { logger } from "@/lib/logger";
import { checkRateLimit } from "@/lib/rate-limit";
import { buildConfirmationHtml } from "@/lib/email-templates";
import { sendHtmlEmail, MailSettings } from "@/lib/mail";
import { SITE_URL } from "@/lib/site";

const newsletterLogger = logger.child({ component: "newsletter" });

function maskEmail(email: string): string {
  const [local, domain] = email.split("@");
  const maskedLocal = local.length > 1 ? local[0] + "***" : "***";
  return `${maskedLocal}@${domain}`;
}

export async function POST(request: Request) {
  let email = "";
  let dailyOptIn = false;
  try {
    const contentType = request.headers.get("content-type");
    if (!contentType?.includes("application/json")) {
      return NextResponse.json({ error: "Content-Type must be application/json" }, { status: 415 });
    }

    const body = await request.json();
    email = body.email || "";
    dailyOptIn = body.daily_opt_in === true;

    if (!email || typeof email !== "string" || !email.includes("@")) {
      return NextResponse.json({ error: "Invalid email" }, { status: 400 });
    }

    // Rate limiting
    const ip = request.headers.get("x-forwarded-for")?.split(",")[0] ||
               request.headers.get("x-real-ip") ||
               "unknown";
    const { allowed, remaining, resetIn } = checkRateLimit(ip);
    if (!allowed) {
      return NextResponse.json(
        { error: "Too many requests. Try again later.", retryAfter: Math.ceil(resetIn / 1000) },
        { status: 429 }
      );
    }

    if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
      return NextResponse.json({ ok: true, mocked: true });
    }

    const supabase = createSupabaseServerClient();

    // Always insert into newsletter_subscribers (legacy)
    try {
      await supabase.from("newsletter_subscribers").insert({ email });
    } catch (err: any) {
      // Only ignore duplicate key errors
      if (err?.code !== "23505") {
        throw err; // Re-throw other errors
      }
    }

    // If daily_opt_in, insert into mail_subscribers with is_confirmed=false
    if (dailyOptIn) {
      const confirmUrl = `${SITE_URL}/api/confirm/${Buffer.from(email).toString("base64url")}`;
      const confirmHtml = buildConfirmationHtml({ confirmUrl, lang: "zh" });

      await supabase
        .from("mail_subscribers")
        .upsert(
          {
            email,
            opted_in: false,
            is_confirmed: false,
            subscribed_at: new Date().toISOString(),
          },
          { onConflict: "email" }
        );

      // Send confirmation email
      const { data: settings } = await supabase
        .from("mail_settings")
        .select("smtp_host, smtp_port, smtp_user, smtp_pass_encrypted, smtp_from_address, smtp_from_name")
        .limit(1)
        .single();

      if (settings) {
        await sendHtmlEmail(
          settings as MailSettings,
          email,
          "確認訂閱 AI Radar 每日速報",
          confirmHtml
        );
      }
    }

    return NextResponse.json({
      ok: true,
      needConfirm: dailyOptIn,
      remaining,
    });
  } catch (e) {
    newsletterLogger.error({ email: maskEmail(email), err: e }, "Newsletter subscription failed");
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}