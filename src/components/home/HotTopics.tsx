import Link from "next/link";
import { Flame, TrendingUp } from "lucide-react";
import type { HotTopic } from "@/lib/dashboard/queries";

/**
 * Hot topics ticker — displays trending topics extracted from raw_items; each item links to the dashboard.
 */
export function HotTopics({
  topics,
  lang = "zh",
}: {
  topics: HotTopic[];
  lang?: string;
}) {
  if (!topics.length) return null;

  return (
    <div className="mx-auto mt-10 max-w-3xl">
      <Link
        href={`/${lang}/dashboard`}
        className="group block rounded-2xl border border-ink-200/70 bg-white/80 p-4 backdrop-blur transition hover:border-accent-400 hover:bg-white dark:border-ink-800/70 dark:bg-ink-900/60 dark:hover:border-accent-500/60 dark:hover:bg-ink-900"
      >
        <div className="flex flex-col items-start gap-3 sm:flex-row sm:items-center sm:gap-4">
          <div className="flex shrink-0 items-center gap-2 text-xs font-semibold uppercase tracking-widest text-rose-500 dark:text-rose-400">
            <Flame className="h-3.5 w-3.5" />
            {lang === "zh" ? "今日熱議" : "Trending today"}
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {topics.map((t, i) => (
              <span
                key={t.keyword}
                className="inline-flex items-center gap-1 rounded-full bg-ink-100 px-3 py-1 text-xs font-medium text-ink-700 dark:bg-ink-800 dark:text-ink-200"
              >
                {i === 0 && <TrendingUp className="h-3 w-3 text-accent-500" />}
                {t.keyword}
                <span className="text-[10px] text-ink-500 dark:text-ink-400">
                  · {t.mentions}
                </span>
              </span>
            ))}
          </div>

          <div className="hidden text-xs text-ink-500 dark:text-ink-400 sm:ml-auto sm:block">
            {lang === "zh" ? "查看 dashboard →" : "Open dashboard →"}
          </div>
        </div>
      </Link>
    </div>
  );
}
