import { Bot, DatabaseZap, Radio, ShieldCheck } from "lucide-react";
import type { Lang } from "@/lib/site";

const DEFAULT_SIGNALS = [
  "OPENAI BLOG",
  "ANTHROPIC",
  "GOOGLE AI",
  "HUGGING FACE",
  "ARXIV",
  "GITHUB TRENDING",
  "REDDIT ML",
  "HACKER NEWS",
  "TECHCRUNCH",
  "LOCAL LLAMA",
];

const cardCopies = {
  zh: [
    {
      icon: Radio,
      label: "訊號收集",
      title: "追蹤 AI 實驗室與開發者社群",
      body: "我們持續觀察官方 blog、研究社群、開發者平台與科技媒體，將零散更新整理成可閱讀的 AI 訊號。",
    },
    {
      icon: DatabaseZap,
      label: "知識整理",
      title: "由原始資料變成文章洞察",
      body: "每條來源都會先被分類、篩選和排序，再轉化成趨勢文章、工具介紹和實用教學。",
    },
    {
      icon: ShieldCheck,
      label: "編輯判斷",
      title: "保留人的觀點與取捨",
      body: "Radar AI Studio 不只是自動搬運新聞，我們重視背景、影響和實際用途，讓內容更有判斷力。",
    },
  ],
  en: [
    {
      icon: Radio,
      label: "Signal Intake",
      title: "Tracking AI labs and builder communities",
      body: "We monitor official blogs, research communities, developer platforms and technology media, turning noisy updates into readable AI signals.",
    },
    {
      icon: DatabaseZap,
      label: "Knowledge Layer",
      title: "Raw items become editorial insight",
      body: "Every source item is classified, filtered and ranked before becoming trend analysis, tool coverage or practical tutorials.",
    },
    {
      icon: ShieldCheck,
      label: "Editorial Control",
      title: "Human judgment before scale",
      body: "Radar AI Studio is not just automated reposting. We care about context, impact and practical usefulness.",
    },
  ],
} satisfies Record<Lang, Array<{ icon: typeof Radio; label: string; title: string; body: string }>>;

export function ProtocolExperience({
  lang = "zh",
  sources = [],
}: {
  lang?: Lang;
  sources?: string[];
}) {
  const displaySources = sources.length > 0 ? sources : DEFAULT_SIGNALS;
  const sourceCount = sources.length > 0 ? sources.length : DEFAULT_SIGNALS.length;

  const copy =
    lang === "zh"
      ? {
          eyebrow: "AI Intelligence Protocol",
          title: "當 AI 世界持續更新，我們幫你整理真正重要的訊號。",
          desc: "Radar AI Studio 追蹤模型更新、工具發佈、研究進展與產業變化，將資訊整理成清晰、可信、可行動的內容。",
          sources: "追蹤來源",
          cycle: "更新節奏",
          cycleValue: "每日",
        }
      : {
          eyebrow: "AI Intelligence Protocol",
          title: "When the AI world keeps moving, we surface the signals that matter.",
          desc: "Radar AI Studio tracks model updates, tool launches, research progress and industry shifts, then turns them into clear, trusted and useful content.",
          sources: "Tracked sources",
          cycle: "Update cycle",
          cycleValue: "Daily",
        };

  return (
    <section className="relative overflow-hidden bg-white py-20 text-ink-950 dark:bg-black dark:text-white md:py-28">
      <div className="absolute inset-0 bg-[linear-gradient(180deg,#fff,rgba(248,250,252,.96),#fff)] dark:bg-[linear-gradient(180deg,#000,rgba(2,6,23,.94),#000)]" />
      <div className="absolute inset-0 bg-[linear-gradient(rgba(15,23,42,.055)_1px,transparent_1px),linear-gradient(90deg,rgba(15,23,42,.055)_1px,transparent_1px)] bg-[size:42px_42px] opacity-35 [mask-image:radial-gradient(circle_at_center,black,transparent_74%)] dark:bg-[linear-gradient(rgba(255,255,255,.035)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.035)_1px,transparent_1px)]" />

      <div className="container-page relative z-10">
        <div className="mx-auto max-w-3xl text-center">
          <div className="mx-auto mb-6 inline-flex items-center gap-2 rounded-full border border-blue-200 bg-blue-50 px-4 py-2 text-[10px] font-semibold uppercase tracking-[0.28em] text-blue-700 backdrop-blur dark:border-white/10 dark:bg-white/[0.06] dark:text-blue-200/80">
            <Bot className="h-3.5 w-3.5" />
            {copy.eyebrow}
          </div>
          <h2 className="font-display text-3xl font-bold tracking-tight text-ink-950 dark:text-white md:text-5xl">
            {copy.title}
          </h2>
          <p className="mx-auto mt-5 max-w-2xl text-sm leading-7 text-ink-600 dark:text-white/60 md:text-base">
            {copy.desc}
          </p>
        </div>

        <div className="mt-12 grid gap-4 md:grid-cols-3">
          {cardCopies[lang].map((card) => {
            const Icon = card.icon;
            return (
              <div
                key={card.title}
                className="rounded-lg border border-ink-200 bg-white/80 p-5 shadow-soft backdrop-blur dark:border-white/10 dark:bg-white/[0.035]"
              >
                <div className="mb-4 inline-flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50 text-blue-600 dark:bg-blue-400/10 dark:text-blue-300">
                  <Icon className="h-5 w-5" />
                </div>
                <p className="text-[11px] font-semibold uppercase tracking-widest text-ink-500 dark:text-white/40">
                  {card.label}
                </p>
                <h3 className="mt-2 font-display text-lg font-semibold">{card.title}</h3>
                <p className="mt-2 text-sm leading-6 text-ink-600 dark:text-white/58">{card.body}</p>
              </div>
            );
          })}
        </div>

        <div className="mt-10 overflow-hidden rounded-lg border border-ink-200 bg-white/70 py-4 shadow-soft backdrop-blur-xl dark:border-white/10 dark:bg-white/[0.035]">
          <div className="protocol-rail flex w-max gap-3 px-4">
            {[...displaySources, ...displaySources].map((signal, index) => (
              <span
                key={`${signal}-${index}`}
                className="inline-flex items-center gap-2 rounded-full border border-blue-200 bg-white px-4 py-2 text-[10px] font-semibold uppercase tracking-[0.22em] text-ink-600 shadow-sm dark:border-blue-300/10 dark:bg-black/45 dark:text-white/62"
              >
                <span className="h-1.5 w-1.5 rounded-full bg-blue-400 shadow-[0_0_14px_rgba(96,165,250,.9)]" />
                {signal}
              </span>
            ))}
          </div>
        </div>

        <div className="mx-auto mt-6 grid max-w-md grid-cols-2 gap-3">
          <Metric label={copy.sources} value={`${sourceCount}+`} />
          <Metric label={copy.cycle} value={copy.cycleValue} />
        </div>
      </div>
    </section>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-ink-200 bg-white/70 px-5 py-4 text-center dark:border-white/10 dark:bg-white/[0.035]">
      <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-ink-500 dark:text-white/35">
        {label}
      </p>
      <p className="mt-2 font-display text-3xl font-bold text-ink-950 dark:text-white">{value}</p>
    </div>
  );
}
