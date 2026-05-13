import type { DailyPoint } from "@/lib/dashboard/queries";

export function DailyChart({ data }: { data: DailyPoint[] }) {
  const max = Math.max(1, ...data.map((d) => d.count));
  const total = data.reduce((s, d) => s + d.count, 0);

  return (
    <section className="container-page section-pad pt-0">
      <div className="rounded-2xl border border-ink-200/70 bg-white p-6 dark:border-ink-800/70 dark:bg-ink-900">
        <div className="flex items-end justify-between">
          <div>
            <div className="text-xs font-semibold uppercase tracking-widest text-ink-500 dark:text-ink-400">
              過去 7 日趨勢
            </div>
            <div className="mt-1 font-display text-2xl font-semibold">
              共 {total.toLocaleString()} 條 items
            </div>
          </div>
          <div className="text-xs text-ink-500 dark:text-ink-400">
            最高峰 <span className="font-semibold text-ink-900 dark:text-white">{max}</span> / 日
          </div>
        </div>

        <div className="mt-6 flex h-40 items-end gap-2">
          {data.map((p) => {
            const h = max === 0 ? 0 : (p.count / max) * 100;
            const label = new Date(p.day).toLocaleDateString("zh-Hant-HK", {
              month: "short",
              day: "numeric",
            });
            return (
              <div key={p.day} className="flex flex-1 flex-col items-center gap-1">
                <div className="relative flex w-full flex-1 items-end">
                  <div
                    className="w-full rounded-t-md bg-gradient-to-t from-accent-500 to-accent-400 transition-all hover:from-accent-600 hover:to-accent-500"
                    style={{ height: `${Math.max(2, h)}%` }}
                    title={`${label}: ${p.count}`}
                  />
                </div>
                <div className="text-[10px] text-ink-500 dark:text-ink-400">
                  {label}
                </div>
                <div className="text-xs font-semibold">{p.count}</div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
