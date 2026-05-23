import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  const supabase = createSupabaseServerClient();
  await supabase.auth.signOut();

  const url = new URL(request.url);
  const rawNext = url.searchParams.get("next");
  const safeNext =
    rawNext && !rawNext.includes("://") && !rawNext.startsWith("data:")
      ? rawNext
      : "/";
  return NextResponse.redirect(new URL(safeNext, request.url), { status: 303 });
}
