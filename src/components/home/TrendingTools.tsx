import { ToolCard } from "@/components/cards/ToolCard";
import { SectionHeader } from "@/components/shared/SectionHeader";
import type { Tool } from "@/types";
import { getUIStrings, type Lang } from "@/lib/i18n";

export function TrendingTools({
  tools,
  lang = "zh",
}: {
  tools: Tool[];
  lang?: Lang;
}) {
  const s = getUIStrings(lang);

  return (
    <section className="container-page section-pad">
      <SectionHeader
        eyebrow={s.trendingTools}
        title={s.trendingToolsTitle}
        description={s.trendingToolsDesc}
        href={`/${lang}/tools`}
      />

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {tools.map((t) => (
          <ToolCard key={t.id} tool={t} lang={lang} />
        ))}
      </div>
    </section>
  );
}
