import { ArrowUpRight, Bot, DatabaseZap, Radio, ShieldCheck } from "lucide-react";
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
  // ... (keep cardCopies as is)
  zh: [
    {
      icon: Radio,
      label: "訊號擷取",
      title: "10 個來源／每 12 小時更新",
      body: "系統會持續監測 AI 實驗室、研究社群、開發者平台與科技媒體，將分散資訊整理成可讀、可追蹤的核心訊號。",
    },
    {
      icon: DatabaseZap,
      label: "知識層",
      title: "原始資料 → Blog 洞察",
      body: "每筆來源資料都會先進入資料庫，方便後續排序、篩選，並整理成具備脈絡與觀點的中文專題文章。",
    },
    {
      icon: ShieldCheck,
      label: "編輯把關",
      title: "在擴張前保留人工判斷",
      body: "現階段會保留人工編輯判斷，確保內容具備觀點、脈絡與品質，而不是單純進行自動化資訊轉載。",
    },
  ],
  en: [
    {
      icon: Radio,
      label: "Signal Intake",
      title: "10 sources / 12h cycle",
      body: "The agent continuously scans AI labs, research communities, developer platforms and technology media, turning noisy updates into readable signals.",
    },
    {
      icon: DatabaseZap,
      label: "Knowledge Layer",
      title: "Raw items → blog intelligence",
      body: "Every source item is stored first, making it easier to rank, filter and transform signals into opinionated blog intelligence.",
    },
    {
      icon: ShieldCheck,
      label: "Editorial Control",
      title: "Human judgment before scale",
      body: "We keep an editorial layer in the loop so the content has taste, context and point of view — not just automated news reposting.",
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
          title: "你睡覺的時候，AI 世界已經發生了這些事",
          desc: "我們的系統 24/7 自動追蹤全球每一個實驗室、每一個社群、每一個部落格——讓你醒來時，世界已經在你手裡。",
          cta: "查看 Blog 文章",
        }
      : {
          eyebrow: "AI Intelligence Protocol",
          title: "While you slept, the AI world already changed",
          desc: "Our system runs 24/7 across every AI lab, community and blog worldwide — so when you wake up, you're already caught up.",
          cta: "Read the blog",
        };

  return (
    <section className="relative overflow-hidden bg-black py-20 text-white md:py-28">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_12%,rgba(37,99,235,.2),transparent_34%),radial-gradient(circle_at_12%_70%,rgba(59,130,246,.12),transparent_28%),linear-gradient(180deg,#000,rgba(2,6,23,.94),#000)]" />
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,.035)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.035)_1px,transparent_1px)] bg-[size:42px_42px] opacity-30 [mask-image:radial-gradient(circle_at_center,black,transparent_74%)]" />

      <div className="protocol-orbit absolute left-1/2 top-28 h-[520px] w-[520px] -translate-x-1/2 rounded-full border border-blue-400/10" />
      <div className="protocol-orbit protocol-orbit-slow absolute left-1/2 top-36 h-[380px] w-[380px] -translate-x-1/2 rounded-full border border-white/10" />

      <div className="container-page relative z-10">
        <div className="mx-auto max-w-3xl text-center">
          <div className="mx-auto mb-6 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.06] px-4 py-2 text-[10px] font-semibold uppercase tracking-[0.34em] text-blue-200/80 backdrop-blur">
            <Bot className="h-3.5 w-3.5" />
            {copy.eyebrow}
          </div>
          <h2 className="font-display text-3xl font-bold tracking-tight text-white md:text-6xl">
            {copy.title}
          </h2>
          <p className="mx-auto mt-5 max-w-2xl text-sm leading-7 text-white/58 md:text-base">
            {copy.desc}
          </p>
        </div>

        <div className="mt-14 overflow-hidden rounded-[2rem] border border-white/10 bg-white/[0.035] py-4 shadow-[0_0_80px_rgba(37,99,235,.12)] backdrop-blur-xl">
          <div className="protocol-rail flex w-max gap-3 px-4">
            {[...displaySources, ...displaySources].map((signal, index) => (
              <span
                key={`${signal}-${index}`}
                className="inline-flex items-center gap-2 rounded-full border border-blue-300/10 bg-black/45 px-4 py-2 text-[10px] font-semibold uppercase tracking-[0.28em] text-white/62"
              >
                <span className="h-1.5 w-1.5 rounded-full bg-blue-400 shadow-[0_0_14px_rgba(96,165,250,.9)]" />
                {signal}
              </span>
            ))}
          </div>
        </div>

      </div>
    </section>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.035] px-5 py-4">
      <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-white/35">{label}</p>
      <p className="mt-2 font-display text-3xl font-bold text-white">{value}</p>
    </div>
  );
}
