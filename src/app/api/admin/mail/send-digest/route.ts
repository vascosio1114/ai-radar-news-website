import { NextResponse } from "next/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { sendHtmlEmail } from "@/lib/mail";
import { buildDigestHtml } from "@/lib/digest-html";
import { SITE_URL } from "@/lib/site";
import { resolveArticlesFromPreset, type ArticleSelect } from "@/lib/digest-criteria";

export async function POST(request: Request) {
  const serverClient = createSupabaseServerClient();
  const admin = createSupabaseAdminClient();

  const { data: { user } } = await serverClient.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data: profile } = await admin
    .from("profiles")
    .select("is_admin")
    .eq("id", user.id)
    .single();

  if (!profile?.is_admin) {
    return NextResponse.json({ error: "Admin access required" }, { status: 403 });
  }

  const body = await request.json().catch(() => ({}));

  // --- Resolve articles ---
  let articles: ArticleSelect[] = [];
  let presetName = "default";
  let contentMode: "excerpt" | "full_content" = "excerpt";

  if (body.article_ids && Array.isArray(body.article_ids) && body.article_ids.length > 0) {
    // Ad-hoc override
    const { data } = await admin
      .from("articles")
      .select("id, slug, title, excerpt, cover_image, published_at, category, tags, is_featured")
      .in("id", body.article_ids)
      .eq("is_published", true);
    articles = (data ?? []) as ArticleSelect[];
    presetName = "ad-hoc";
  } else if (body.preset_id) {
    // Specific preset
    const { data: preset } = await admin
      .from("digest_presets")
      .select("*, content_mode")
      .eq("id", body.preset_id)
      .single();
    if (!preset) return NextResponse.json({ error: "Preset not found" }, { status: 404 });
    presetName = preset.name;
    contentMode = preset.content_mode ?? "excerpt";
    articles = await resolveArticlesFromPreset(
      admin,
      preset.mode,
      preset.article_ids,
      preset.criteria,
      "Asia/Hong_Kong"
    );
  } else {
    // Default preset
    const { data: defaultPreset } = await admin
      .from("digest_presets")
      .select("*, content_mode")
      .eq("is_default", true)
      .single();
    if (defaultPreset) {
      presetName = defaultPreset.name;
      contentMode = defaultPreset.content_mode ?? "excerpt";
      articles = await resolveArticlesFromPreset(
        admin,
        defaultPreset.mode,
        defaultPreset.article_ids,
        defaultPreset.criteria,
        "Asia/Hong_Kong"
      );
    }
  }

  const settings = body.settings ?? await admin.from("mail_settings").select("*").limit(1).single().then(r => r.data);

  if (!settings) {
    return NextResponse.json({ error: "No mail settings configured" }, { status: 400 });
  }

  // Skip empty digests
  if ((articles.length === 0) && settings.skip_empty_digest) {
    return NextResponse.json({ skipped: true, reason: "no_matching_articles" });
  }

  const today = new Date().toLocaleDateString("zh-HK", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
  const dateStr = today;
  const subject = (settings.email_subject_template || "AI Radar Daily").replace("{{date}}", dateStr);

  const articlesWithUrl = articles.map((a) => ({
    ...a,
    url: `${SITE_URL}/news/${a.slug}`,
  }));

  const html = buildDigestHtml({
    headerHtml: settings.email_header_html || "",
    footerHtml: settings.email_footer_html || "",
    articles: articlesWithUrl,
    emailBodyTemplate: settings.email_body_template || undefined,
    dateStr,
    unsubscribeUrl: `${SITE_URL}/unsubscribe`,
    contentMode,
  });

  // Preview mode — return HTML without sending
  if (body.is_preview) {
    return NextResponse.json({ html, preset: presetName, articleCount: articles.length });
  }

  const overrideEmail = body.to;

  // Test email to single address
  if (overrideEmail) {
    const result = await sendHtmlEmail(settings, overrideEmail, `TEST: ${subject}`, html);
    if (!result.sent) {
      return NextResponse.json({ error: result.error }, { status: 500 });
    }
    return NextResponse.json({ ok: true, to: overrideEmail, type: "test", preset: presetName });
  }

  // Send to all opted-in confirmed subscribers
  const { data: subscribers } = await admin
    .from("mail_subscribers")
    .select("email")
    .eq("opted_in", true)
    .eq("is_confirmed", true);

  if (!subscribers || subscribers.length === 0) {
    return NextResponse.json({ sent: 0, error: "No confirmed subscribers to send to" });
  }

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

  return NextResponse.json({ sent, total: subscribers.length, errors, preset: presetName });
}