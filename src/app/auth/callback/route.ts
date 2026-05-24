import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";

/**
 * OAuth callback — exchanges the auth code for a session,
 * then redirects to ?next or homepage.
 */
export async function GET(request: Request) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const rawNext = url.searchParams.get("next");
  const safeNext =
    rawNext && !rawNext.includes("://") && !rawNext.startsWith("data:")
      ? rawNext
      : "/";

  if (code) {
    const supabase = createSupabaseServerClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (error) {
      console.error("[auth/callback] exchange failed", error);
      // Try to determine locale from next path or default to zh
      const locale = safeNext.startsWith("/en") ? "en" : "zh";
      return NextResponse.redirect(
        new URL(`/${locale}/login?error=${encodeURIComponent(error.message)}`, request.url)
      );
    }
  }

  return NextResponse.redirect(new URL(safeNext, request.url));
}
