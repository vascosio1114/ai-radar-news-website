import { CheckCircle2, XCircle, AlertCircle } from "lucide-react";
import type { SourceRow } from "@/lib/dashboard/queries";
import { timeAgo } from "@/lib/utils";

export function SourceStatus({ sources }: { sources: SourceRow[] }) {
  return (
    <section className="container-page section-pad pt-0">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="font-display text-2xl font-bold tracking-tight">
          📡 10 個 Source 健康狀態
        </h2>
        <span className="text-xs text-ink-500 dark:text-ink-400">
          每 12 小時自動檢查
        </span>
      </div>

      <div className="overflow-hidden rounded-2xl border border-ink-200/70 dark:border-ink-800/70">
        <table className="w-full text-left text-sm">
          <thead className="bg-ink-50 dark:bg-ink-900/50">
            <tr>
              <th className="px-4 py-3 font-medium">Source</th>
              <th className="px-4 py-3 font-medium">Kind</th>
              <th className="hidden px-4 py-3 font-medium md:table-cell">
                已收集
              </th>
              <th className="px-4 py-3 font-medium">最後擷取</th>
              <th className="px-4 py-3 font-medium">狀態</th>
            </tr>
          </thead>
          <tbody>
            {sources.map((s) => (
              <tr
                key={s.id}
                className="border-t border-ink-200/70 bg-white dark:border-ink-800/70 dark:bg-ink-900"
              >
                <td className="px-4 py-3 font-medium">{s.name}</td>
                <td className="px-4 py-3 text-xs text-ink-500 dark:text-ink-400">
                  {s.kind}
                </td>
                <td className="hidden px-4 py-3 text-xs md:table-cell">
                  {s.items_count.toLocaleString()}
                </td>
                <td className="px-4 py-3 text-xs text-ink-500 dark:text-ink-400">
                  {s.last_fetched_at ? timeAgo(s.last_fetched_at) : "—"}
                </td>
                <td className="px-4 py-3">
                  <StatusBadge
                    enabled={s.is_enabled}
                    hasError={!!s.last_error}
                    error={s.last_error}
                  />
                </td>
              </tr>
            ))}
            {sources.length === 0 && (
              <tr>
                <td
                  colSpan={5}
                  className="bg-white px-4 py-12 text-center text-xs text-ink-500 dark:bg-ink-900 dark:text-ink-400"
                >
                  尚未有 source data。
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}

function StatusBadge({
  enabled,
  hasError,
  error,
}: {
  enabled: boolean;
  hasError: boolean;
  error: string | null;
}) {
  if (!enabled) {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-ink-200 px-2 py-0.5 text-xs font-medium text-ink-700 dark:bg-ink-800 dark:text-ink-300">
        <XCircle className="h-3 w-3" />
        Paused
      </span>
    );
  }
  if (hasError) {
    return (
      <span
        title={error ?? ""}
        className="inline-flex items-center gap-1 rounded-full bg-amber-500/10 px-2 py-0.5 text-xs font-medium text-amber-600 dark:text-amber-400"
      >
        <AlertCircle className="h-3 w-3" />
        Error
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2 py-0.5 text-xs font-medium text-emerald-600 dark:text-emerald-400">
      <CheckCircle2 className="h-3 w-3" />
      OK
    </span>
  );
}
