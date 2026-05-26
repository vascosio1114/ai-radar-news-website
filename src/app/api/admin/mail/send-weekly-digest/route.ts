// src/app/api/admin/mail/send-weekly-digest/route.ts
import { NextResponse } from "next/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { sendHtmlEmail } from "@/lib/mail";
import { buildDigestHtml } from "@/lib/digest-html";
import { SITE_URL } from "@/lib/site";

const CRON_SECRET = process.env.CRON_SECRET;

export async function POST(request: Request) {
  const authHeader = request.headers.get("authorization");
  if (!CRON_SECRET || authHeader !== `Bearer ${CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = createSupabaseAdminClient();

  const { data: settings } = await supabase
    .from("mail_settings")
    .select("*")
    .limit(1)
    .single();

  if (!settings?.weekly_enabled) {
    return NextResponse.json({ skipped: true, reason: "weekly_enabled=false" });
  }

  // Get weekly subscribers
  const { data: subscribers } = await supabase
    .from("mail_subscribers")
    .select("email")
    .eq("opted_in", true)
    .eq("is_confirmed", true)
    .eq("frequency", "weekly");

  if (!subscribers || subscribers.length === 0) {
    return NextResponse.json({ sent: 0, reason: "no_subscribers" });
  }

  // Get weekly digest content — fetch most recent 5 published articles
  const { data: articles } = await supabase
    .from("articles")
    .select("id, slug, title, excerpt, cover_image, published_at, category, tags, is_featured, email_content, content_html")
    .eq("is_published", true)
    .order("published_at", { ascending: false })
    .limit(5);

  if (!articles || articles.length === 0) {
    return NextResponse.json({ skipped: true, reason: "no_articles" });
  }

  const today = new Date().toLocaleDateString("zh-HK", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const articlesWithUrl = articles.map((a) => ({
    ...a,
    url: `${SITE_URL}/zh/news/${a.slug}`,
  }));

  const html = buildDigestHtml({
    headerHtml: settings.email_header_html || "",
    footerHtml: settings.email_footer_html || "",
    articles: articlesWithUrl,
    emailBodyTemplate: settings.email_body_template || undefined,
    dateStr: today,
    unsubscribeUrl: `${SITE_URL}/api/unsubscribe`,
    contentMode: "excerpt",
  });

  const subject = (settings.email_subject_template || "AI Radar 每週總結")
    .replace("{{date}}", today)
    .replaceAll("Daily", "Weekly");

  let sent = 0;
  const errors: string[] = [];
  const BATCH_SIZE = 10;

  for (let i = 0; i < subscribers.length; i += BATCH_SIZE) {
    const batch = subscribers.slice(i, i + BATCH_SIZE);
    const results = await Promise.all(
      batch.map((sub) =>
        sendHtmlEmail(settings, sub.email, subject, html)
          .then((result) => ({ email: sub.email, ...result }))
          .catch((err) => ({
            email: sub.email,
            sent: false,
            error: err instanceof Error ? err.message : String(err),
          }))
      )
    );
    for (const r of results) {
      if (r.sent) sent++;
      else errors.push(`${r.email}: ${r.error}`);
    }
  }

  return NextResponse.json({ sent, total: subscribers.length, errors });
}