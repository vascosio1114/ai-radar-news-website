import { ExternalLink } from "lucide-react";
import type { LatestItem } from "@/lib/dashboard/queries";
import { timeAgo } from "@/lib/utils";

const KIND_STYLE: Record<string, string> = {
  rss: "bg-blue-500/10 text-blue-600 dark:text-blue-400",
  reddit: "bg-orange-500/10 text-orange-600 dark:text-orange-400",
  hn: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
  arxiv: "bg-purple-500/10 text-purple-600 dark:text-purple-400",
  github_trending: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
  scrape: "bg-pink-500/10 text-pink-600 dark:text-pink-400",
};

export function LatestFeed({ items }: { items: LatestItem[] }) {
  return (
    <section className="container-page section-pad pt-0">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="font-display text-2xl font-bold tracking-tight">
          🔴 最新收集
        </h2>
        <span className="text-xs text-ink-500 dark:text-ink-400">
          AI 仲未寫成 blog 嘅原料
        </span>
      </div>

      <div className="overflow-hidden rounded-2xl border border-ink-200/70 dark:border-ink-800/70">
        {items.map((item, i) => (
          <a
            key={item.id}
            href={item.url}
            target="_blank"
            rel="noopener noreferrer"
            className={`group flex items-center gap-3 bg-white p-4 transition hover:bg-ink-50 dark:bg-ink-900 dark:hover:bg-ink-800/60 ${
              i > 0 ? "border-t border-ink-200/70 dark:border-ink-800/70" : ""
            }`}
          >
            <span
              className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase ${
                KIND_STYLE[item.source_kind] ?? "bg-ink-100 text-ink-600 dark:bg-ink-800 dark:text-ink-300"
              }`}
            >
              {item.source_name}
            </span>
            <span className="min-w-0 flex-1 truncate text-sm">
              {item.title}
            </span>
            <span className="shrink-0 text-xs text-ink-500 dark:text-ink-400">
              {timeAgo(item.published_at ?? item.fetched_at)}
            </span>
            <ExternalLink className="h-3.5 w-3.5 shrink-0 text-ink-400 opacity-0 transition group-hover:opacity-100" />
          </a>
        ))}
        {items.length === 0 && (
          <div className="px-4 py-12 text-center text-sm text-ink-500 dark:text-ink-400">
            未有 ingest 紀錄，等 cron 第一次跑。
          </div>
        )}
      </div>
    </section>
  );
}
