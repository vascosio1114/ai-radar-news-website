import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  const supabase = createSupabaseServerClient();
  await supabase.auth.signOut();

  const url = new URL(request.url);
  const next = url.searchParams.get("next") || "/";
  return NextResponse.redirect(new URL(next, request.url), { status: 303 });
}
