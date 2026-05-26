import { NextResponse } from "next/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { sendHtmlEmail } from "@/lib/mail";
import { buildDigestHtml } from "@/lib/digest-html";
import { SITE_URL } from "@/lib/site";

export async function POST(request: Request) {
  const serverClient = createSupabaseServerClient();
  const admin = createSupabaseAdminClient();

  const { data: { user } } = await serverClient.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data: profile } = await admin
    .from("profiles")
    .select("is_admin")
    .eq("id", user.id)
    .single();

  if (!profile?.is_admin) {
    return NextResponse.json({ error: "Admin access required" }, { status: 403 });
  }

  const body = await request.json().catch(() => ({}));
  const { article_id, to } = body;

  if (!article_id) {
    return NextResponse.json({ error: "article_id is required" }, { status: 400 });
  }

  const settings = body.settings
    ?? await admin.from("mail_settings").select("*").limit(1).single().then(r => r.data);

  if (!settings) {
    return NextResponse.json({ error: "No mail settings configured" }, { status: 400 });
  }

  // Fetch article by ID or slug
  const { data: article } = await admin
    .from("articles")
    .select("id, slug, title, excerpt, email_content, content_html, cover_image, published_at, category")
    .or(`id.eq.${article_id},slug.eq.${article_id}`)
    .single();

  if (!article) {
    return NextResponse.json({ error: "Article not found" }, { status: 404 });
  }

  const articleUrl = `${SITE_URL}/en/news/${article.slug}`;

  // Build email HTML — single article render
  const html = buildDigestHtml({
    headerHtml: settings.email_header_html || "",
    footerHtml: settings.email_footer_html || "",
    articles: [{
      title: article.title,
      excerpt: article.excerpt || "",
      url: articleUrl,
      published_at: article.published_at,
      cover_image: article.cover_image || undefined,
      email_content: article.email_content || undefined,
      content_html: article.content_html || undefined,
    }],
    emailBodyTemplate: settings.email_body_template || undefined,
    dateStr: new Date().toLocaleDateString("zh-HK", { year: "numeric", month: "long", day: "numeric" }),
    unsubscribeUrl: `${SITE_URL}/unsubscribe`,
    contentMode: "full_content",
  });

  const subject = `AI Radar: ${article.title}`;

  // Preview mode — return HTML without sending
  if (body.is_preview) {
    return NextResponse.json({ html, articleId: article.id, articleTitle: article.title });
  }

  // Test send to single address
  if (to) {
    const result = await sendHtmlEmail(settings, to, `TEST: ${subject}`, html);
    if (!result.sent) {
      return NextResponse.json({ error: result.error }, { status: 500 });
    }
    return NextResponse.json({ ok: true, to, type: "test" });
  }

  // Send to all confirmed subscribers
  const { data: subscribers } = await admin
    .from("mail_subscribers")
    .select("email")
    .eq("opted_in", true)
    .eq("is_confirmed", true);

  if (!subscribers || subscribers.length === 0) {
    return NextResponse.json({ sent: 0, error: "No confirmed subscribers" });
  }

  let sent = 0;
  const errors: string[] = [];
  const BATCH_SIZE = 10;

  for (let i = 0; i < subscribers.length; i += BATCH_SIZE) {
    const batch = subscribers.slice(i, i + BATCH_SIZE);
    const results = await Promise.all(
      batch.map((sub) =>
        sendHtmlEmail(settings, sub.email, subject, html)
          .then((r) => ({ email: sub.email, ...r }))
          .catch((err) => ({ email: sub.email, sent: false, error: err instanceof Error ? err.message : String(err) }))
      )
    );
    for (const r of results) {
      if (r.sent) sent++;
      else errors.push(`${r.email}: ${r.error}`);
    }
  }

  return NextResponse.json({ sent, total: subscribers.length, errors, articleTitle: article.title });
}