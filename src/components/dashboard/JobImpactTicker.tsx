import { AlertTriangle, ArrowDownRight, ArrowUpRight, Info, TrendingUp } from "lucide-react";
import type { JobImpactTrend } from "@/lib/dashboard/queries";

function formatMonth(day: string) {
  return new Date(`${day}-01T00:00:00Z`).toLocaleDateString("zh-Hant-HK", {
    year: "numeric",
    month: "short",
  });
}

function buildPath(values: number[], width: number, height: number, pad = 18) {
  if (values.length === 0) return "";
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = Math.max(1, max - min);
  return values
    .map((v, i) => {
      const x = pad + (i / Math.max(1, values.length - 1)) * (width - pad * 2);
      const y = pad + (1 - (v - min) / range) * (height - pad * 2);
      return `${i === 0 ? "M" : "L"} ${x.toFixed(2)} ${y.toFixed(2)}`;
    })
    .join(" ");
}

export function JobImpactTicker({ trend }: { trend: JobImpactTrend }) {
  const values = trend.points.map((p) => p.estimated_affected_roles);
  const indexValues = trend.points.map((p) => p.index);
  const width = 860;
  const height = 260;
  const line = buildPath(values, width, height);
  const indexLine = buildPath(indexValues, width, height);
  const latest = trend.latest;
  const isUp = trend.change_pct >= 0;
  const max = Math.max(1, ...values);
  const min = Math.min(...values);
  const startLabel = trend.points[0];
  const lastLabel = trend.points.at(-1);

  return (
    <section className="container-page section-pad pt-0">
      <div className="overflow-hidden rounded-3xl border border-emerald-500/20 bg-white shadow-soft dark:border-emerald-400/25 dark:bg-black">
        <div className="relative p-6 md:p-8">
          <div className="absolute inset-0 opacity-100 dark:bg-[radial-gradient(circle_at_15%_0%,rgba(34,197,94,0.18),transparent_34%),radial-gradient(circle_at_86%_18%,rgba(16,185,129,0.14),transparent_34%),linear-gradient(180deg,rgba(0,0,0,0),rgba(0,0,0,.28))]" />
          <div className="absolute inset-0 hidden dark:block dark:bg-[linear-gradient(rgba(34,197,94,.045)_1px,transparent_1px),linear-gradient(90deg,rgba(34,197,94,.045)_1px,transparent_1px)] dark:bg-[size:28px_28px]" />

          <div className="relative z-10">
            <div className="flex flex-col justify-between gap-5 lg:flex-row lg:items-start">
              <div>
                <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-emerald-500/25 bg-emerald-500/10 px-3 py-1 text-xs font-semibold uppercase tracking-widest text-emerald-600 dark:text-emerald-300">
                  <TrendingUp className="h-3.5 w-3.5" />
                  AI Job Impact Watch
                </div>
                <h2 className="font-display text-2xl font-bold tracking-tight text-ink-950 dark:text-white md:text-3xl">
                  疫情後 AI 就業影響曲線
                </h2>
                <p className="mt-2 max-w-2xl text-sm leading-6 text-ink-500 dark:text-emerald-50/65">
                  由 2020 疫情數碼化浪潮開始，到 ChatGPT、Copilot、AI agents 進入企業流程，
                  呢條線顯示 AI 對職位影響壓力嘅長期上升趨勢。數字係估算模型 / index，唔係官方失業統計。
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3 sm:min-w-[380px]">
                <Metric label="估算受影響職位" value={latest.estimated_affected_roles.toLocaleString()} suffix="人" />
                <Metric
                  label="月度變化"
                  value={`${isUp ? "+" : ""}${trend.change_pct}%`}
                  tone={isUp ? "up" : "down"}
                />
                <Metric label="模型訊號累計" value={trend.total_signal_count.toLocaleString()} suffix="pts" />
                <Metric label="影響指數" value={latest.index.toLocaleString()} />
              </div>
            </div>

            <div className="mt-7 rounded-2xl border border-ink-200/70 bg-white/80 p-4 dark:border-emerald-400/15 dark:bg-black/70">
              <div className="mb-3 flex items-center justify-between text-xs text-ink-500 dark:text-emerald-50/55">
                <span>{startLabel ? formatMonth(startLabel.day) : "2020"} → {lastLabel ? formatMonth(lastLabel.day) : "現在"}</span>
                <span>range {min.toLocaleString()} – {max.toLocaleString()}</span>
              </div>

              <div className="relative h-[280px] overflow-hidden rounded-xl bg-gradient-to-b from-ink-50 to-white dark:from-black dark:to-[#020403]">
                <svg viewBox={`0 0 ${width} ${height}`} className="h-full w-full" role="img" aria-label="AI job impact line chart from 2020 to today">
                  <defs>
                    <linearGradient id="jobImpactStrokeGreen" x1="0" x2="1" y1="0" y2="0">
                      <stop offset="0%" stopColor="#84cc16" />
                      <stop offset="48%" stopColor="#22c55e" />
                      <stop offset="100%" stopColor="#4ade80" />
                    </linearGradient>
                    <linearGradient id="jobImpactFillGreen" x1="0" x2="0" y1="0" y2="1">
                      <stop offset="0%" stopColor="#22c55e" stopOpacity="0.26" />
                      <stop offset="100%" stopColor="#22c55e" stopOpacity="0" />
                    </linearGradient>
                    <filter id="greenGlow">
                      <feGaussianBlur stdDeviation="4" result="coloredBlur" />
                      <feMerge>
                        <feMergeNode in="coloredBlur" />
                        <feMergeNode in="SourceGraphic" />
                      </feMerge>
                    </filter>
                  </defs>

                  {[0.2, 0.4, 0.6, 0.8].map((y) => (
                    <line key={y} x1="18" x2={width - 18} y1={height * y} y2={height * y} stroke="currentColor" strokeOpacity="0.09" />
                  ))}

                  {line && (
                    <>
                      <path d={`${line} L ${width - 18} ${height - 18} L 18 ${height - 18} Z`} fill="url(#jobImpactFillGreen)" />
                      <path d={indexLine} fill="none" stroke="#a3e635" strokeOpacity="0.22" strokeWidth="2" strokeDasharray="7 8" />
                      <path d={line} fill="none" stroke="url(#jobImpactStrokeGreen)" strokeWidth="4.5" strokeLinecap="round" strokeLinejoin="round" filter="url(#greenGlow)" />
                    </>
                  )}

                  {trend.points.map((p, i) => {
                    const range = Math.max(1, max - min);
                    const x = 18 + (i / Math.max(1, trend.points.length - 1)) * (width - 36);
                    const y = 18 + (1 - (p.estimated_affected_roles - min) / range) * (height - 36);
                    const isMilestone = p.day.endsWith("-01") || p.day === "2022-11" || p.day === "2023-03" || p.day === "2024-05";
                    return isMilestone ? (
                      <circle key={p.day} cx={x} cy={y} r="3.5" fill="#020403" stroke="#86efac" strokeWidth="2" />
                    ) : null;
                  })}
                </svg>

                <div className="pointer-events-none absolute bottom-3 left-4 right-4 flex justify-between text-[10px] font-medium text-ink-400 dark:text-emerald-50/35">
                  <span>2020</span>
                  <span>ChatGPT boom</span>
                  <span>AI agents</span>
                  <span>Now</span>
                </div>
              </div>

              <div className="mt-4 grid gap-2 text-xs text-ink-500 dark:text-emerald-50/55 md:grid-cols-3">
                <div className="inline-flex items-center gap-2">
                  <span className="h-2 w-6 rounded-full bg-gradient-to-r from-lime-400 to-emerald-400" />
                  估算受影響職位曲線
                </div>
                <div className="inline-flex items-center gap-2">
                  <span className="h-px w-6 border-t border-dashed border-lime-300" />
                  AI Job Impact Index
                </div>
                <div className="inline-flex items-center gap-1 md:justify-end">
                  <Info className="h-3.5 w-3.5" />
                  Modelled from pandemic-era AI adoption signals
                </div>
              </div>
            </div>

            <div className="mt-4 rounded-2xl border border-amber-500/20 bg-amber-500/10 p-4 text-xs leading-6 text-amber-800 dark:text-amber-100/80">
              <div className="flex gap-2">
                <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
                <p>
                  Methodology：呢個係 editorial model，用疫情後自動化、生成式 AI、企業重組、AI agents 採用等公開訊號建立長期趨勢。
                  佢適合用嚟觀察方向同變化速度；下一版可接 Layoffs tracker、政府勞工數據、公司公告做更嚴謹估算。
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function Metric({
  label,
  value,
  suffix,
  tone,
}: {
  label: string;
  value: string;
  suffix?: string;
  tone?: "up" | "down";
}) {
  return (
    <div className="rounded-2xl border border-ink-200/70 bg-white/75 p-4 backdrop-blur dark:border-emerald-400/15 dark:bg-zinc-950/80">
      <div className="text-[11px] font-semibold uppercase tracking-widest text-ink-500 dark:text-emerald-50/45">
        {label}
      </div>
      <div className="mt-2 flex items-center gap-1 font-display text-2xl font-bold text-ink-950 dark:text-emerald-50">
        {tone === "up" && <ArrowUpRight className="h-4 w-4 text-emerald-400" />}
        {tone === "down" && <ArrowDownRight className="h-4 w-4 text-rose-400" />}
        <span>{value}</span>
        {suffix && <span className="text-sm font-medium text-ink-500 dark:text-emerald-50/45">{suffix}</span>}
      </div>
    </div>
  );
}
