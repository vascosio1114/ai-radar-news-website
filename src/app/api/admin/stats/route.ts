import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";

function startOfMonth(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

export async function GET() {
  const supabase = createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const monthStart = startOfMonth(new Date()).toISOString();

  const [articles, tools, tutorials, viewsResult, usersResult] = await Promise.all([
    supabase.from("articles").select("id", { count: "exact", head: true }).eq("is_published", true),
    supabase.from("tools").select("id", { count: "exact", head: true }),
    supabase.from("tutorials").select("id", { count: "exact", head: true }),
    supabase
      .from("articles")
      .select("views")
      .gte("published_at", monthStart)
      .eq("is_published", true),
    supabase.from("profiles").select("id", { count: "exact", head: true }),
  ]);

  return NextResponse.json({
    articles: articles.count || 0,
    tools: tools.count || 0,
    tutorials: tutorials.count || 0,
    views: viewsResult.data?.reduce((sum, a) => sum + (a.views || 0), 0) || 0,
    users: usersResult.count || 0,
  });
}