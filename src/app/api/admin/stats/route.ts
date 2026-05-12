import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function GET() {
  const supabase = createSupabaseServerClient();

  const [articles, tools, tutorials] = await Promise.all([
    supabase.from("articles").select("id", { count: "exact", head: true }).eq("is_published", true),
    supabase.from("tools").select("id", { count: "exact", head: true }),
    supabase.from("tutorials").select("id", { count: "exact", head: true }),
  ]);

  return NextResponse.json({
    articles: articles.count || 0,
    tools: tools.count || 0,
    tutorials: tutorials.count || 0,
    views: 0,
  });
}