import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { sendHtmlEmail, buildDigestHtml } from "@/lib/mail";

export async function POST() {
  const supabase = createSupabaseServerClient();

  const { data: settings } = await supabase
    .from("mail_settings")
    .select("*")
    .limit(1)
    .single();

  if (!settings) {
    return NextResponse.json({ error: "No mail settings configured" }, { status: 400 });
  }

  const { data: { user } } = await supabase.auth.getUser();
  if (!user?.email) {
    return NextResponse.json({ error: "No admin email found" }, { status: 400 });
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
    user.email,
    "Test: " + (settings.email_subject_template || "AI Radar Daily Digest"),
    html
  );

  if (!result.sent) {
    return NextResponse.json({ error: result.error }, { status: 500 });
  }
  return NextResponse.json({ ok: true, to: user.email });
}