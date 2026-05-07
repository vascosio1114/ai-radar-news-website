"use client";

import * as React from "react";
import { ToolCard } from "@/components/cards/ToolCard";
import { TOOL_CATEGORIES, type ToolCategorySlug } from "@/lib/site";
import { MOCK_TOOLS } from "@/data/mock";
import { cn } from "@/lib/utils";

export default function ToolsPage() {
  const [active, setActive] = React.useState<ToolCategorySlug>("all");

  const tools =
    active === "all"
      ? MOCK_TOOLS
      : MOCK_TOOLS.filter((t) => t.category === active);

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

      {/* Category tabs */}
      <div className="mb-10 flex flex-wrap gap-2">
        {TOOL_CATEGORIES.map((cat) => (
          <button
            key={cat.slug}
            type="button"
            onClick={() => setActive(cat.slug)}
            className={cn(
              "rounded-full border px-4 py-2 text-sm font-medium transition",
              active === cat.slug
                ? "border-ink-900 bg-ink-900 text-white dark:border-white dark:bg-white dark:text-ink-900"
                : "border-ink-200 bg-white/60 text-ink-600 hover:border-accent-400 hover:text-accent-600 dark:border-ink-800 dark:bg-ink-900/60 dark:text-ink-300 dark:hover:text-accent-400"
            )}
          >
            {cat.label}
          </button>
        ))}
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {tools.map((t) => (
          <ToolCard key={t.id} tool={t} />
        ))}
      </div>

      {tools.length === 0 && (
        <p className="mt-10 text-center text-sm text-ink-500 dark:text-ink-400">
          呢個分類仲未有工具，stay tuned。
        </p>
      )}
    </div>
  );
}
