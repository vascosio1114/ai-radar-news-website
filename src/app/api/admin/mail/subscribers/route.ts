import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function GET() {
  const supabase = createSupabaseServerClient();
  const { count, error } = await supabase
    .from("mail_subscribers")
    .select("*", { count: "exact", head: true })
    .eq("opted_in", true);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ count: count || 0 });
}