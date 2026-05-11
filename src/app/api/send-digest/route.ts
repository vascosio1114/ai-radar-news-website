// src/app/api/send-digest/route.ts
import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { sendHtmlEmail, buildDigestHtml } from "@/lib/mail";
import { SITE_URL } from "@/lib/site";

const CRON_SECRET = process.env.CRON_SECRET;

export async function GET(request: Request) {
  // Validate cron secret
  const authHeader = request.headers.get("authorization");
  if (CRON_SECRET && authHeader !== `Bearer ${CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = createSupabaseServerClient();

  // Load mail settings
  const { data: settings } = await supabase
    .from("mail_settings")
    .select("*")
    .limit(1)
    .single();

  // If daily_enabled is false, skip silently
  if (!settings?.daily_enabled) {
    return NextResponse.json({ skipped: true, reason: "daily_enabled=false" });
  }

  // Determine start of today in configured timezone
  const tz = settings.daily_timezone || "Asia/Hong_Kong";
  const now = new Date();
  const todayStart = new Date(
    now.toLocaleString("en-US", { timeZone: tz })
  ).setHours(0, 0, 0, 0);
  const todayStartISO = new Date(todayStart).toISOString();

  // Fetch top 5 published articles since today
  const { data: articles } = await supabase
    .from("articles")
    .select("slug, title, excerpt, cover_image, published_at")
    .eq("is_published", true)
    .gte("published_at", todayStartISO)
    .order("published_at", { ascending: false })
    .limit(5);

  if (!articles || articles.length === 0) {
    return NextResponse.json({ sent: 0, reason: "no_articles_today" });
  }

  const articlesWithUrl = articles.map((a) => ({
    ...a,
    url: `${SITE_URL}/news/${a.slug}`,
  }));

  // Fetch opted-in subscribers
  const { data: subscribers } = await supabase
    .from("mail_subscribers")
    .select("email")
    .eq("opted_in", true)
    .eq("is_confirmed", true);

  if (!subscribers || subscribers.length === 0) {
    return NextResponse.json({ sent: 0, reason: "no_subscribers" });
  }

  const html = buildDigestHtml({
    headerHtml: settings.email_header_html || "",
    footerHtml: settings.email_footer_html || "",
    articles: articlesWithUrl,
  });

  let sent = 0;
  const errors: string[] = [];

  for (const sub of subscribers) {
    const result = await sendHtmlEmail(
      settings,
      sub.email,
      settings.email_subject_template || "Your AI Radar Daily Digest",
      html
    );
    if (result.sent) {
      sent++;
    } else {
      errors.push(`${sub.email}: ${result.error}`);
    }
  }

  return NextResponse.json({ sent, total: subscribers.length, errors });
}