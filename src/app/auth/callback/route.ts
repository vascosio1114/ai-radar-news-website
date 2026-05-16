import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";

/**
 * OAuth callback — exchanges the auth code for a session,
 * then redirects to ?next or homepage.
 */
export async function GET(request: Request) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const next = url.searchParams.get("next") ?? "/";

  if (code) {
    const supabase = createSupabaseServerClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (error) {
      console.error("[auth/callback] exchange failed", error);
      return NextResponse.redirect(
        new URL(`/zh/login?error=${encodeURIComponent(error.message)}`, request.url)
      );
    }
  }

  return NextResponse.redirect(new URL(next, request.url));
}
