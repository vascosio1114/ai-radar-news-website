import { NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/admin-auth";

export const dynamic = "force-dynamic";

function startOfMonth(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

export async function GET() {
  const auth = await requireAdminApi();
  if (!auth.ok) return auth.response;
  const supabase = auth.adminDb;

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
