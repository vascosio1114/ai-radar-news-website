import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { logger } from "@/lib/logger";

const log = logger.child({ component: "search" });

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const query = searchParams.get("q")?.trim() ?? "";
    const lang = searchParams.get("lang") ?? "en";

    if (!query || query.length < 2) {
      return NextResponse.json({ articles: [], query: "" });
    }

    const supabase = createSupabaseServerClient();

    // Sanitize query - keep only word chars and spaces for security
    const cleanTerms = query.replace(/[^\w\s]/g, " ").split(/\s+/).filter(Boolean);
    if (cleanTerms.length === 0) {
      return NextResponse.json({ articles: [], query });
    }

    // Build tsquery from search terms (OR semantics)
    const tsquery = cleanTerms.join(" | ");

    const { data, error } = await supabase
      .from("articles")
      .select("*")
      .textSearch("search_vector", tsquery)
      .eq("is_published", true)
      .not(lang === "zh" ? "title_zh" : "title_en", "is", null)
      .order("published_at", { ascending: false })
      .limit(50);

    if (error) {
      log.error({ err: error, query }, "Search query failed");
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ articles: data ?? [], query });
  } catch (e) {
    log.error({ err: e }, "Unexpected search error");
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
