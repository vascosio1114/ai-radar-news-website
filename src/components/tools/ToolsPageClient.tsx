"use client";

import * as React from "react";
import Link from "next/link";
import { ToolCard } from "@/components/cards/ToolCard";
import { TOOL_CATEGORIES, type ToolCategorySlug } from "@/lib/site";
import type { Tool } from "@/types";
import { cn } from "@/lib/utils";
import { type Lang } from "@/lib/i18n";
import { ChevronLeft, ChevronRight } from "lucide-react";

type Props = {
  tools: Tool[];
  lang?: Lang;
  page: number;
  totalPages: number;
  total: number;
  start: number;
  end: number;
};

export function ToolsPageClient({ tools, lang = "zh", page, totalPages, total, start, end }: Props) {
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
            {lang === "en" && cat.slug === "all" ? "All" : cat.label}
          </button>
        ))}
      </div>

      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <p className="text-sm text-ink-500 dark:text-ink-400">
          {lang === "zh"
            ? `顯示 ${start}-${end}，共 ${total} 個工具`
            : `Showing ${start}-${end} of ${total} tools`}
        </p>
        <div className="flex items-center gap-2">
          <Link
            href={`/${lang}/tools?page=${page - 1}`}
            className={cn(
              "flex h-9 w-9 items-center justify-center rounded-xl border border-ink-200 bg-white/80 backdrop-blur-sm transition dark:border-ink-800 dark:bg-ink-900/80",
              page <= 1
                ? "pointer-events-none opacity-30"
                : "hover:border-accent-400 hover:text-accent-600"
            )}
            aria-disabled={page <= 1}
          >
            <ChevronLeft className="h-4 w-4" />
          </Link>
          <span className="flex h-9 min-w-[3rem] items-center justify-center rounded-xl border border-ink-200 bg-white/80 px-3 text-sm backdrop-blur-sm dark:border-ink-800 dark:bg-ink-900/80">
            {page}
          </span>
          <Link
            href={`/${lang}/tools?page=${page + 1}`}
            className={cn(
              "flex h-9 w-9 items-center justify-center rounded-xl border border-ink-200 bg-white/80 backdrop-blur-sm transition dark:border-ink-800 dark:bg-ink-900/80",
              page >= totalPages
                ? "pointer-events-none opacity-30"
                : "hover:border-accent-400 hover:text-accent-600"
            )}
            aria-disabled={page >= totalPages}
          >
            <ChevronRight className="h-4 w-4" />
          </Link>
        </div>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {filtered.map((t) => (
          <ToolCard key={t.id} tool={t} lang={lang} />
        ))}
      </div>

      {filtered.length === 0 && (
        <p className="mt-10 text-center text-sm text-ink-500 dark:text-ink-400">
          {lang === "zh" ? "此分類目前尚未收錄工具，請稍後再查看。" : "No tools are available in this category yet. Please check back later."}
        </p>
      )}
    </>
  );
}
