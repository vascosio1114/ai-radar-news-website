import type { Metadata } from "next";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { ToolsPageClient } from "@/components/tools/ToolsPageClient";
import { getUIStrings, type Lang } from "@/lib/i18n";
import { DEFAULT_LANG } from "@/lib/site";

type Props = { params: { lang: string } };

export default async function ToolsPage({ params }: Props) {
  const lang = (params.lang as Lang) ?? DEFAULT_LANG;
  const s = getUIStrings(lang);

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
          {s.toolsPageTitle}
        </h1>
        <p className="mt-3 max-w-2xl text-sm text-ink-500 dark:text-ink-400 md:text-base">
          {s.toolsPageDesc}
        </p>
      </header>

      <ToolsPageClient tools={tools ?? []} lang={lang} />
    </div>
  );
}
