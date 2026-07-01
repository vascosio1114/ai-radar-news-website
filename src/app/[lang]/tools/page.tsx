import type { Metadata } from "next";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { ToolsPageClient } from "@/components/tools/ToolsPageClient";
import { getUIStrings, hasEnglishDisplayContent, type Lang } from "@/lib/i18n";
import { DEFAULT_LANG } from "@/lib/site";

const PAGE_SIZE = 12;

type Props = { params: { lang: string }; searchParams: { page?: string } };

export default async function ToolsPage({ params, searchParams }: Props) {
  const lang = (params.lang as Lang) ?? DEFAULT_LANG;
  const s = getUIStrings(lang);

  const page = Math.max(1, parseInt(searchParams.page ?? "1", 10));
  const offset = (page - 1) * PAGE_SIZE;

  const supabase = createSupabaseServerClient();
  const { count, data: tools } = await supabase
    .from("tools")
    .select("*", { count: "exact" })
    .range(offset, offset + PAGE_SIZE - 1)
    .order("is_trending", { ascending: false })
    .order("rating", { ascending: false });

  const total = count ?? 0;
  const totalPages = Math.ceil(total / PAGE_SIZE);

  const allTools = tools ?? [];
  const filteredTools = lang === "en"
    ? allTools.filter((tool) => hasEnglishDisplayContent(tool, ["name", "tagline", "description"]))
    : allTools;

  const start = total > 0 ? offset + 1 : 0;
  const end = Math.min(offset + PAGE_SIZE, total);

  return (
    <div className="container-page section-pad">
      <header className="mb-10">
        <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-accent-600 dark:text-accent-400">
          AI Tools
        </p>
        <h1 className="font-display text-4xl font-bold tracking-tight md:text-5xl">
          {s.toolsPageTitle}
        </h1>
        <p className="mt-3 max-w-2xl text-sm text-ink-500 dark:text-ink-400 md:text-base">
          {s.toolsPageDesc}
        </p>
      </header>

      <ToolsPageClient
        tools={filteredTools}
        lang={lang}
        page={page}
        totalPages={totalPages}
        total={total}
        start={start}
        end={end}
      />
    </div>
  );
}
