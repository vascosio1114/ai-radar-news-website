import { ArrowDownRight, ArrowUpRight, Info, TrendingUp } from "lucide-react";
import type { JobImpactTrend } from "@/lib/dashboard/queries";
import type { Lang } from "@/lib/site";

function formatMonth(day: string, lang: Lang) {
  return new Date(`${day}-01T00:00:00Z`).toLocaleDateString(
    lang === "zh" ? "zh-Hant-HK" : "en-US",
    { year: "numeric", month: "short" }
  );
}

function formatLargeNumber(value: number, lang: Lang) {
  if (lang === "zh") {
    if (value >= 100_000_000) return `${(value / 100_000_000).toFixed(1).replace(/\.0$/, "")}億`;
    if (value >= 10_000) return `${Math.round(value / 10_000).toLocaleString("zh-Hant-HK")}萬`;
    return value.toLocaleString("zh-Hant-HK");
  }

  if (value >= 1_000_000_000) return `${(value / 1_000_000_000).toFixed(1).replace(/\.0$/, "")}B`;
  if (value >= 1_000_000) return `${Math.round(value / 1_000_000).toLocaleString("en-US")}M`;
  if (value >= 1_000) return `${Math.round(value / 1_000).toLocaleString("en-US")}K`;
  return value.toLocaleString("en-US");
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

export function JobImpactTicker({
  trend,
  lang = "zh",
}: {
  trend: JobImpactTrend;
  lang?: Lang;
}) {
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

  const copy =
    lang === "zh"
      ? {
          badge: "AI 就業影響觀察",
          title: "AI 對就業人數的影響估算",
          description:
            "此圖以 Goldman Sachs、IMF、McKinsey 與 World Economic Forum 等公開研究為參考，呈現 AI 可能影響或重塑的職位規模。數字代表「受影響／曝險」估算，並不等同裁員或失業人數。",
          affectedRoles: "估算受影響人數",
          people: "人",
          monthlyChange: "月度變化",
          signalTotal: "研究訊號累計",
          impactIndex: "曝險指數",
          now: "目前",
          range: "估算區間",
          chartLabel: "AI 對就業人數影響估算曲線",
          firstLabel: "2023",
          secondLabel: "生成式 AI 普及",
          thirdLabel: "企業導入",
          affectedCurve: "估算受影響人數曲線",
          indexLine: "AI 就業曝險指數",
          modelNote: "研究參考模型，非官方失業統計",
          methodology:
            "方法說明：曲線以公開研究作為錨點，再以編輯模型平滑呈現趨勢。Goldman Sachs 估計全球約 3 億個全職等值職位可能受 AI 自動化影響；IMF 指出接近 40% 的全球就業暴露於 AI；McKinsey 估計生成式 AI 與既有技術可自動化佔員工時間 60–70% 的工作活動；WEF 則預測至 2030 年將有 9,200 萬個職位被取代、1.7 億個新職位被創造。",
          sources: "參考：Goldman Sachs Research、IMF、McKinsey Global Institute、World Economic Forum。",
          referenceCap: "研究參考上限",
          globalExposure: "全球職位曝險",
          labourShift: "2030 勞動轉型",
          referenceCapValue: "3億+",
          globalExposureValue: "約 40%",
          labourShiftValue: "9,200萬 / 1.7億",
        }
      : {
          badge: "AI Workforce Exposure Watch",
          title: "Estimated workforce exposure to AI",
          description:
            "This chart uses public research from Goldman Sachs, the IMF, McKinsey and the World Economic Forum as reference anchors. The numbers estimate roles affected or exposed to AI-driven workflow change; they are not layoff or unemployment figures.",
          affectedRoles: "Estimated affected workers",
          people: "workers",
          monthlyChange: "Monthly change",
          signalTotal: "Research signals",
          impactIndex: "Exposure index",
          now: "Now",
          range: "Range",
          chartLabel: "Estimated workforce exposure to AI line chart",
          firstLabel: "2023",
          secondLabel: "GenAI adoption",
          thirdLabel: "Enterprise rollout",
          affectedCurve: "Estimated affected workers curve",
          indexLine: "AI workforce exposure index",
          modelNote: "Research-informed model, not official unemployment data",
          methodology:
            "Methodology: the curve uses public research as anchor points, then smooths them into an editorial trend model. Goldman Sachs estimates that roughly 300 million full-time-equivalent jobs globally could be exposed to AI automation; the IMF says nearly 40% of global employment is exposed to AI; McKinsey estimates that generative AI and existing technologies could automate work activities absorbing 60–70% of employee time; WEF projects 92 million jobs displaced and 170 million created by 2030.",
          sources: "Sources: Goldman Sachs Research, IMF, McKinsey Global Institute, World Economic Forum.",
          referenceCap: "Research exposure estimate",
          globalExposure: "Global job exposure",
          labourShift: "2030 labour-market shift",
          referenceCapValue: "300M+",
          globalExposureValue: "~40%",
          labourShiftValue: "92M / 170M",
        };

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
                  {copy.badge}
                </div>
                <h2 className="font-display text-2xl font-bold tracking-tight text-ink-950 dark:text-white md:text-3xl">
                  {copy.title}
                </h2>
                <p className="mt-2 max-w-2xl text-sm leading-6 text-ink-500 dark:text-emerald-50/65">
                  {copy.description}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3 sm:min-w-[380px]">
                <Metric label={copy.affectedRoles} value={formatLargeNumber(latest.estimated_affected_roles, lang)} suffix={copy.people} />
                <Metric label={copy.monthlyChange} value={`${isUp ? "+" : ""}${trend.change_pct}%`} tone={isUp ? "up" : "down"} />
                <Metric label={copy.referenceCap} value={copy.referenceCapValue} />
                <Metric label={copy.globalExposure} value={copy.globalExposureValue} />
              </div>
            </div>

            <div className="mt-7 rounded-2xl border border-ink-200/70 bg-white/80 p-4 dark:border-emerald-400/15 dark:bg-black/70">
              <div className="mb-3 flex flex-col gap-1 text-xs text-ink-500 dark:text-emerald-50/55 sm:flex-row sm:items-center sm:justify-between">
                <span>{startLabel ? formatMonth(startLabel.day, lang) : "2023"} → {lastLabel ? formatMonth(lastLabel.day, lang) : copy.now}</span>
                <span>{copy.range} {formatLargeNumber(min, lang)} – {formatLargeNumber(max, lang)}</span>
              </div>

              <div className="relative h-[280px] overflow-hidden rounded-xl bg-gradient-to-b from-ink-50 to-white dark:from-black dark:to-[#020403]">
                <svg viewBox={`0 0 ${width} ${height}`} className="h-full w-full" role="img" aria-label={copy.chartLabel}>
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
                    const month = Number(p.day.slice(5, 7));
                    const isMilestone = month === 1 || p.day === "2023-03" || p.day === "2024-01" || p.day === "2025-01";
                    return isMilestone ? (
                      <circle key={p.day} cx={x} cy={y} r="3.5" fill="#020403" stroke="#86efac" strokeWidth="2" />
                    ) : null;
                  })}
                </svg>

                <div className="pointer-events-none absolute bottom-3 left-4 right-4 flex justify-between text-[10px] font-medium text-ink-400 dark:text-emerald-50/35">
                  <span>{copy.firstLabel}</span>
                  <span>{copy.secondLabel}</span>
                  <span>{copy.thirdLabel}</span>
                  <span>{copy.now}</span>
                </div>
              </div>

              <div className="mt-4 grid gap-2 text-xs text-ink-500 dark:text-emerald-50/55 md:grid-cols-3">
                <div className="inline-flex items-center gap-2">
                  <span className="h-2 w-6 rounded-full bg-gradient-to-r from-lime-400 to-emerald-400" />
                  {copy.affectedCurve}
                </div>
                <div className="inline-flex items-center gap-2">
                  <span className="h-px w-6 border-t border-dashed border-lime-300" />
                  {copy.indexLine}
                </div>
                <div className="inline-flex items-center gap-1 md:justify-end">
                  <Info className="h-3.5 w-3.5" />
                  {copy.modelNote}
                </div>
              </div>
            </div>

            <div className="mt-4 grid gap-3 lg:grid-cols-[1fr_0.8fr]">
              <div className="rounded-2xl border border-emerald-500/15 bg-emerald-500/10 p-4 text-xs leading-6 text-emerald-900 dark:text-emerald-100/78">
                <p>{copy.methodology}</p>
                <p className="mt-2 text-emerald-700/75 dark:text-emerald-100/45">{copy.sources}</p>
              </div>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-1">
                <Metric label={copy.labourShift} value={copy.labourShiftValue} />
                <Metric label={copy.impactIndex} value={latest.index.toLocaleString(lang === "zh" ? "zh-Hant-HK" : "en-US")} />
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
