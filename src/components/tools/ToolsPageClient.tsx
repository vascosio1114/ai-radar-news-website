"use client";

import * as React from "react";
import { ToolCard } from "@/components/cards/ToolCard";
import { TOOL_CATEGORIES, type ToolCategorySlug } from "@/lib/site";
import type { Tool } from "@/types";
import { cn } from "@/lib/utils";
import { type Lang } from "@/lib/i18n";

type Props = { tools: Tool[]; lang?: Lang };

export function ToolsPageClient({ tools, lang = "zh" }: Props) {
  const [active, setActive] = React.useState<ToolCategorySlug>("all");

  const filtered =
    active === "all" ? tools : tools.filter((t) => t.category === active);

  return (
    <>
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
        {filtered.map((t) => (
          <ToolCard key={t.id} tool={t} lang={lang} />
        ))}
      </div>

      {filtered.length === 0 && (
        <p className="mt-10 text-center text-sm text-ink-500 dark:text-ink-400">
          呢個分類仲未有工具，stay tuned。
        </p>
      )}
    </>
  );
}
