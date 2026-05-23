import { NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/admin-auth";
import { sendHtmlEmail } from "@/lib/mail";
import { buildDigestHtml } from "@/lib/digest-html";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const auth = await requireAdminApi();
  if (!auth.ok) return auth.response;
  const adminDb = auth.adminDb;
  const user = auth.user;

  const body = await request.json().catch(() => ({}));
  const overrideEmail = body.to;

  const { data: settings } = await adminDb
    .from("mail_settings")
    .select("*")
    .limit(1)
    .single();

  if (!settings) {
    return NextResponse.json({ error: "No mail settings configured" }, { status: 400 });
  }

  const recipientEmail = overrideEmail || user?.email || settings.smtp_from_address;

  if (!recipientEmail) {
    return NextResponse.json({ error: "No recipient email" }, { status: 400 });
  }

  const html = buildDigestHtml({
    headerHtml: settings.email_header_html || "<h1>Test Email</h1><p>This is a test digest email.</p>",
    footerHtml: settings.email_footer_html || "",
    articles: [
      {
        title: "Test Article",
        excerpt: "This is a test article for the daily digest.",
        url: "https://ai-radar.example.com",
        published_at: new Date().toISOString(),
      },
    ],
  });

  const result = await sendHtmlEmail(
    settings,
    recipientEmail,
    "Test: " + (settings.email_subject_template || "AI Radar Daily Digest"),
    html
  );

  if (!result.sent) {
    return NextResponse.json({ error: result.error }, { status: 500 });
  }
  return NextResponse.json({ ok: true, to: recipientEmail });
}
