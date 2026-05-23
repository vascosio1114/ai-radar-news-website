import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";

/**
 * OAuth callback for [lang] prefixed routes — mirrors the root /auth/callback
 * so that Supabase can redirect to /{lang}/auth/callback without a 404.
 */
export async function GET(request: Request) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const rawNext = url.searchParams.get("next");
  const safeNext =
    rawNext && !rawNext.includes("://") && !rawNext.startsWith("data:")
      ? rawNext
      : "/zh";

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

  return NextResponse.redirect(new URL(safeNext, request.url));
}