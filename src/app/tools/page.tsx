import type { Metadata } from "next";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { ToolsPageClient } from "@/components/tools/ToolsPageClient";

export const metadata: Metadata = {
  title: "AI 工具",
  description: "每星期評測，分類齊全。揀岩你嘅工具，由免費到 enterprise 都有。",
};

export default async function ToolsPage() {
  const supabase = createSupabaseServerClient();
  const { data: tools } = await supabase
    .from("tools")
    .select("*")
    .order("is_trending", { ascending: false })
    .order("rating", { ascending: false });

  return (
    <div className="container-page section-pad">
      <header className="mb-10">
        <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-accent-600 dark:text-accent-400">
          AI Tools
        </p>
        <h1 className="font-display text-4xl font-bold tracking-tight md:text-5xl">
          熱門 AI 工具
        </h1>
        <p className="mt-3 max-w-2xl text-sm text-ink-500 dark:text-ink-400 md:text-base">
          每星期評測，分類齊全。揀岩你嘅工具，由免費到 enterprise 都有。
        </p>
      </header>

      <ToolsPageClient tools={tools ?? []} />
    </div>
  );
}