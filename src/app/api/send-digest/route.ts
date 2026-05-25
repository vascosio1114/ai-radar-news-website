// src/app/api/send-digest/route.ts
import { NextResponse } from "next/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { sendHtmlEmail } from "@/lib/mail";
import { buildDigestHtml } from "@/lib/digest-html";
import { SITE_URL } from "@/lib/site";
import { resolveArticlesFromPreset, type ArticleSelect } from "@/lib/digest-criteria";

const CRON_SECRET = process.env.CRON_SECRET;

export async function GET(request: Request) {
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

  if (!settings?.daily_enabled) {
    return NextResponse.json({ skipped: true, reason: "daily_enabled=false" });
  }

  const tz = settings.daily_timezone || "Asia/Hong_Kong";

  // --- Load default preset or fallback ---
  const { data: defaultPreset } = await supabase
    .from("digest_presets")
    .select("*, content_mode")
    .eq("is_default", true)
    .single();

  let articles: ArticleSelect[] = [];

  if (defaultPreset) {
    articles = await resolveArticlesFromPreset(
      supabase,
      defaultPreset.mode,
      defaultPreset.article_ids,
      defaultPreset.criteria,
      tz
    );
  } else {
    // Legacy fallback: top 5 published since today
    const now = new Date();
    const todayStart = new Date(now.toLocaleString("en-US", { timeZone: tz })).setHours(0, 0, 0, 0);
    const todayStartISO = new Date(todayStart).toISOString();
    const { data } = await supabase
      .from("articles")
      .select("id, slug, title, excerpt, cover_image, published_at, category, tags, is_featured, email_content, content_html")
      .eq("is_published", true)
      .gte("published_at", todayStartISO)
      .order("published_at", { ascending: false })
      .limit(5);
    articles = (data ?? []) as ArticleSelect[];
  }

  if (articles.length === 0 && settings.skip_empty_digest) {
    return NextResponse.json({ skipped: true, reason: "no_matching_articles" });
  }

  const { data: subscribers } = await supabase
    .from("mail_subscribers")
    .select("email")
    .eq("opted_in", true)
    .eq("is_confirmed", true);

  if (!subscribers || subscribers.length === 0) {
    return NextResponse.json({ sent: 0, reason: "no_subscribers" });
  }

  const today = new Date().toLocaleDateString("zh-HK", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
  const dateStr = today;
  const subject = (settings.email_subject_template || "Your AI Radar Daily Digest").replace("{{date}}", today);

  const articlesWithUrl = articles.map((a) => ({
    ...a,
    url: `${SITE_URL}/zh/news/${a.slug}`,
  }));

  const contentMode = defaultPreset?.content_mode ?? "excerpt";

  const html = buildDigestHtml({
    headerHtml: settings.email_header_html || "",
    footerHtml: settings.email_footer_html || "",
    articles: articlesWithUrl,
    emailBodyTemplate: settings.email_body_template || undefined,
    dateStr,
    unsubscribeUrl: `${SITE_URL}/unsubscribe`,
    contentMode,
  });

  let sent = 0;
  const errors: string[] = [];
  const BATCH_SIZE = 10;

  for (let i = 0; i < subscribers.length; i += BATCH_SIZE) {
    const batch = subscribers.slice(i, i + BATCH_SIZE);
    const results = await Promise.all(
      batch.map((sub) =>
        sendHtmlEmail(settings, sub.email, subject, html)
          .then((result) => ({ email: sub.email, ...result }))
          .catch((err) => ({ email: sub.email, sent: false, error: err instanceof Error ? err.message : String(err) }))
      )
    );
    for (const r of results) {
      if (r.sent) sent++;
      else errors.push(`${r.email}: ${r.error}`);
    }
  }

  return NextResponse.json({ sent, total: subscribers.length, errors });
}