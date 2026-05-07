import { ToolCard } from "@/components/cards/ToolCard";
import { SectionHeader } from "@/components/shared/SectionHeader";
import type { Tool } from "@/types";

export function TrendingTools({ tools }: { tools: Tool[] }) {
  return (
    <section className="container-page section-pad">
      <SectionHeader
        eyebrow="精選"
        title="Trending AI Tools"
        description="編輯每星期實測，揀出真正有用嘅 AI 工具。"
        href="/tools"
      />

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {tools.map((t) => (
          <ToolCard key={t.id} tool={t} />
        ))}
      </div>
    </section>
  );
}
