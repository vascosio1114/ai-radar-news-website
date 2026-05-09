import type { Metadata } from "next";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import ToolsPageClient from "./ToolsPageClient";

export const metadata: Metadata = {
  title: "AI 工具",
  description: "熱門 AI 工具評測，分類齊全。",
};

export default async function ToolsPage() {
  const supabase = createSupabaseServerClient();
  const { data: tools } = await supabase
    .from("tools")
    .select("id,slug,name,tagline,description,logo,website,category,rating,pricing,is_trending")
    .order("is_trending", { ascending: false })
    .order("rating", { ascending: false });

  return <ToolsPageClient tools={tools ?? []} />;
}