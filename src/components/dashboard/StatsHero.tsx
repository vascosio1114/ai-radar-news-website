import { Activity, Database, Radio, AlertTriangle, TrendingUp, TrendingDown } from "lucide-react";
import type { DashboardStats } from "@/lib/dashboard/queries";
import { timeAgo } from "@/lib/utils";

export function StatsHero({ stats }: { stats: DashboardStats }) {
  const isFresh =
    stats.last_fetch_at &&
    Date.now() - new Date(stats.last_fetch_at).getTime() < 24 * 3600 * 1000;

  return (
    <section className="container-page section-pad">
      <div className="mb-8 flex flex-col items-start justify-between gap-3 md:flex-row md:items-end">
        <div>
          <div className="mb-2 inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-accent-600 dark:text-accent-400">
            <span className="h-px w-6 bg-accent-500" />
            Daily Dashboard
          </div>
          <h1 className="font-display text-3xl font-bold tracking-tight md:text-4xl">
            今日 AI 動態
          </h1>
          <p className="mt-2 text-sm text-ink-500 dark:text-ink-400">
            10 個 AI source 每 12 小時自動收集嘅 raw data，real-time 更新。
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span
            className={`inline-flex h-2.5 w-2.5 rounded-full ${
              isFresh ? "bg-emerald-500 animate-pulse" : "bg-amber-500"
            }`}
          />
          <span className="text-xs text-ink-500 dark:text-ink-400">
            {stats.last_fetch_at
              ? `上次更新 ${timeAgo(stats.last_fetch_at)}`
              : "未有 ingest 紀錄"}
          </span>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          icon={<Activity className="h-4 w-4" />}
          label="過去 24 小時"
          value={stats.items_24h.toLocaleString()}
          delta={stats.delta_pct}
        />
        <StatCard
          icon={<Database className="h-4 w-4" />}
          label="總 items 收集"
          value={stats.total_items.toLocaleString()}
        />
        <StatCard
          icon={<Radio className="h-4 w-4" />}
          label="Active sources"
          value={`${stats.active_sources} / 10`}
        />
        <StatCard
          icon={<AlertTriangle className="h-4 w-4" />}
          label="Source errors"
          value={stats.sources_with_errors.toString()}
          accent={stats.sources_with_errors > 0 ? "warning" : "ok"}
        />
      </div>
    </section>
  );
}

function StatCard({
  icon,
  label,
  value,
  delta,
  accent,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  delta?: number;
  accent?: "ok" | "warning";
}) {
  return (
    <div className="card-hover rounded-2xl border border-ink-200/70 bg-white p-5 dark:border-ink-800/70 dark:bg-ink-900">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold uppercase tracking-widest text-ink-500 dark:text-ink-400">
          {label}
        </span>
        <span
          className={
            accent === "warning"
              ? "text-amber-500"
              : accent === "ok"
                ? "text-emerald-500"
                : "text-ink-400 dark:text-ink-500"
          }
        >
          {icon}
        </span>
      </div>
      <div className="mt-3 flex items-baseline gap-2">
        <span className="font-display text-3xl font-bold">{value}</span>
        {typeof delta === "number" && (
          <span
            className={`inline-flex items-center gap-0.5 text-xs font-semibold ${
              delta >= 0
                ? "text-emerald-600 dark:text-emerald-400"
                : "text-rose-500"
            }`}
          >
            {delta >= 0 ? (
              <TrendingUp className="h-3 w-3" />
            ) : (
              <TrendingDown className="h-3 w-3" />
            )}
            {delta >= 0 ? "+" : ""}
            {delta}%
          </span>
        )}
      </div>
    </div>
  );
}
