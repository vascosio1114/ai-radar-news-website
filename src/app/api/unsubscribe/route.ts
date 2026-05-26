import { NextResponse } from "next/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { validateUnsubscribeToken } from "@/lib/unsubscribe-token";
import { SITE_URL } from "@/lib/site";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const token = url.searchParams.get("token");

  if (!token) {
    return new Response("Missing unsubscribe token.", { status: 400 });
  }

  const payload = validateUnsubscribeToken(token);
  if (!payload) {
    return new Response("Invalid or expired unsubscribe link.", { status: 400 });
  }

  const supabase = createSupabaseAdminClient();
  const { error } = await supabase
    .from("mail_subscribers")
    .update({ opted_in: false })
    .eq("email", payload.email);

  return new Response(
    `<!DOCTYPE html>
<html>
<body style="font-family:system-ui,sans-serif;max-width:600px;margin:0 auto;padding:24px;color:#1a1a1a;background:#f9f9f9;">
  <div style="background:#fff;border-radius:12px;padding:32px;text-align:center;">
    <h1 style="font-size:24px;margin:0 0 16px;">已取消訂閱</h1>
    <p style="color:#666;font-size:16px;">您已成功取消訂閱。我們很遺憾看到您離開。</p>
    <a href="${SITE_URL}" style="display:inline-block;margin-top:24px;background:#2563eb;color:#fff;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:600;">返回 AI Radar</a>
  </div>
</body>
</html>`,
    { headers: { "Content-Type": "text/html" } }
  );
}