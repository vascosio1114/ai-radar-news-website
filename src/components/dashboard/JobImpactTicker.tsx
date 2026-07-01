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
    .map((value, index) => {
      const x = pad + (index / Math.max(1, values.length - 1)) * (width - pad * 2);
      const y = pad + (1 - (value - min) / range) * (height - pad * 2);
      return `${index === 0 ? "M" : "L"} ${x.toFixed(2)} ${y.toFixed(2)}`;
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
  const values = trend.points.map((point) => point.estimated_affected_roles);
  const width = 860;
  const height = 260;
  const line = buildPath(values, width, height);
  const latest = trend.latest;
  const isUp = trend.change_pct >= 0;
  const max = Math.max(1, ...values);
  const min = Math.min(...values);
  const startLabel = trend.points[0];
  const lastLabel = trend.points.at(-1);

  const copy =
    lang === "zh"
      ? {
          badge: "AI Workforce Exposure Watch",
          title: "AI 對工作流程的影響正在擴大",
          description:
            "這張圖用公開研究作為參考，估算受 AI 工作流程改變影響的職位規模。它不是裁員或失業數字，而是用來觀察 AI 對工作的長期影響。",
          affectedRoles: "估算受影響工作者",
          people: "人",
          monthlyChange: "月度變化",
          impactIndex: "影響指數",
          now: "現在",
          range: "範圍",
          chartLabel: "AI 對工作流程影響的估算趨勢圖",
          firstLabel: "2026",
          secondLabel: "生成式 AI 採用",
          thirdLabel: "企業流程落地",
          affectedCurve: "估算受影響工作者趨勢",
          modelNote: "研究參考模型，並非官方就業數據",
          methodology:
            "方法說明：此趨勢用 Goldman Sachs、IMF、McKinsey 與 World Economic Forum 的公開研究作為參考點，再整理成編輯模型，用來觀察 AI 對工作流程的潛在影響。",
          sources: "參考來源：Goldman Sachs Research、IMF、McKinsey Global Institute、World Economic Forum。",
          referenceCap: "研究參考上限",
          globalExposure: "全球職位曝險",
          labourShift: "2030 勞動市場變化",
          referenceCapValue: "3億+",
          globalExposureValue: "約 40%",
          labourShiftValue: "9,200萬 / 1.7億",
        }
      : {
          badge: "AI Workforce Exposure Watch",
          title: "Estimated workforce exposure to AI",
          description:
            "This chart uses public research as reference anchors. It estimates roles exposed to AI-driven workflow change; it is not a layoff or unemployment figure.",
          affectedRoles: "Estimated affected workers",
          people: "workers",
          monthlyChange: "Monthly change",
          impactIndex: "Exposure index",
          now: "Now",
          range: "Range",
          chartLabel: "Estimated workforce exposure to AI line chart",
          firstLabel: "2026",
          secondLabel: "GenAI adoption",
          thirdLabel: "Enterprise rollout",
          affectedCurve: "Estimated affected workers curve",
          modelNote: "Research-informed model, not official unemployment data",
          methodology:
            "Methodology: the trend uses public research from Goldman Sachs, the IMF, McKinsey and the World Economic Forum as reference anchors, then smooths them into an editorial model for observing AI workflow exposure.",
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
      <div className="overflow-hidden rounded-lg border border-emerald-200 bg-white shadow-soft dark:border-emerald-400/25 dark:bg-black">
        <div className="relative p-6 md:p-8">
          <div className="relative z-10">
            <div className="flex flex-col justify-between gap-5 lg:flex-row lg:items-start">
              <div>
                <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-semibold uppercase tracking-widest text-emerald-700 dark:border-emerald-400/25 dark:bg-emerald-400/10 dark:text-emerald-300">
                  <TrendingUp className="h-3.5 w-3.5" />
                  {copy.badge}
                </div>
                <h2 className="font-display text-2xl font-bold tracking-tight text-ink-950 dark:text-white md:text-3xl">
                  {copy.title}
                </h2>
                <p className="mt-2 max-w-2xl text-sm leading-6 text-ink-600 dark:text-emerald-50/65">
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

            <div className="mt-7 rounded-lg border border-emerald-100 bg-white/80 p-4 dark:border-emerald-400/15 dark:bg-black/70">
              <div className="mb-3 flex flex-col gap-1 text-xs text-ink-500 dark:text-emerald-50/55 sm:flex-row sm:items-center sm:justify-between">
                <span>
                  {startLabel ? formatMonth(startLabel.day, lang) : "2026"} -{" "}
                  {lastLabel ? formatMonth(lastLabel.day, lang) : copy.now}
                </span>
                <span>
                  {copy.range} {formatLargeNumber(min, lang)} - {formatLargeNumber(max, lang)}
                </span>
              </div>

              <div className="relative h-[280px] overflow-hidden rounded-lg bg-gradient-to-b from-white to-emerald-50/50 dark:from-black dark:to-[#020403]">
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
                  </defs>

                  {[0.2, 0.4, 0.6, 0.8].map((y) => (
                    <line key={y} x1="18" x2={width - 18} y1={height * y} y2={height * y} stroke="currentColor" strokeOpacity="0.09" />
                  ))}

                  {line && (
                    <>
                      <path d={`${line} L ${width - 18} ${height - 18} L 18 ${height - 18} Z`} fill="url(#jobImpactFillGreen)" />
                      <path d={line} fill="none" stroke="url(#jobImpactStrokeGreen)" strokeWidth="4.5" strokeLinecap="round" strokeLinejoin="round" />
                    </>
                  )}
                </svg>

                <div className="pointer-events-none absolute bottom-3 left-4 right-4 flex justify-between text-[10px] font-medium text-ink-400 dark:text-emerald-50/35">
                  <span>{copy.firstLabel}</span>
                  <span>{copy.secondLabel}</span>
                  <span>{copy.thirdLabel}</span>
                  <span>{copy.now}</span>
                </div>
              </div>

              <div className="mt-4 grid gap-2 text-xs text-ink-500 dark:text-emerald-50/55 md:grid-cols-2">
                <div className="inline-flex items-center gap-2">
                  <span className="h-2 w-6 rounded-full bg-gradient-to-r from-lime-400 to-emerald-400" />
                  {copy.affectedCurve}
                </div>
                <div className="inline-flex items-center gap-1 md:justify-end">
                  <Info className="h-3.5 w-3.5" />
                  {copy.modelNote}
                </div>
              </div>
            </div>

            <div className="mt-4 grid gap-3 lg:grid-cols-[1fr_0.8fr]">
              <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-4 text-xs leading-6 text-emerald-900 dark:border-emerald-500/15 dark:bg-emerald-500/10 dark:text-emerald-100/78">
                <p>{copy.methodology}</p>
                <p className="mt-2 text-emerald-700/75 dark:text-emerald-100/45">{copy.sources}</p>
              </div>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
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
    <div className="rounded-lg border border-ink-200/70 bg-white/75 p-4 backdrop-blur dark:border-emerald-400/15 dark:bg-zinc-950/80">
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
