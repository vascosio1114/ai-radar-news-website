import { ArrowUpRight, Bot, DatabaseZap, Newspaper, Radio, ShieldCheck } from "lucide-react";
import type { Lang } from "@/lib/site";

const signals = [
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

const cards = [
  {
    icon: Radio,
    label: "Signal Intake",
    title: "10 sources / 12h cycle",
    body: "Agent 持續掃描 AI labs、research、developer community 同科技媒體，將 noise 變成可讀訊號。",
  },
  {
    icon: DatabaseZap,
    label: "Knowledge Layer",
    title: "Raw items → blog intelligence",
    body: "每一條 source 都會入庫，方便之後 ranking、filter、整理成中文 blog 文章。",
  },
  {
    icon: ShieldCheck,
    label: "Editorial Control",
    title: "Human approve before scale",
    body: "先保留人工 editorial taste，等內容有觀點、有質感，而唔係純粹機械式新聞搬運。",
  },
];

export function ProtocolExperience({ lang = "zh" }: { lang?: Lang }) {
  const copy =
    lang === "zh"
      ? {
          eyebrow: "AI Intelligence Protocol",
          title: "唔係新聞站，係一個 AI 訊號系統。",
          desc: "網站背後會每日收集世界各地嘅 AI movement，再由我哋整理成 blog、newsletter、dashboard 同未來課程入口。",
          cta: "查看 Blog 文章",
        }
      : {
          eyebrow: "AI Intelligence Protocol",
          title: "Not a news site — an AI signal system.",
          desc: "The platform collects AI movements globally and turns them into blog posts, newsletters, dashboards and future learning products.",
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
            {[...signals, ...signals].map((signal, index) => (
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

        <div className="mt-10 grid gap-4 lg:grid-cols-3">
          {cards.map((card, index) => (
            <div
              key={card.title}
              className="protocol-card group relative overflow-hidden rounded-[1.75rem] border border-white/10 bg-gradient-to-b from-white/[0.075] to-white/[0.025] p-6 backdrop-blur-xl transition duration-500 hover:-translate-y-1 hover:border-blue-300/35"
              style={{ animationDelay: `${index * 150}ms` }}
            >
              <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-blue-300/50 to-transparent opacity-0 transition group-hover:opacity-100" />
              <div className="mb-6 flex items-center justify-between">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-black/45 text-blue-300 shadow-[0_0_24px_rgba(37,99,235,.14)]">
                  <card.icon className="h-5 w-5" />
                </div>
                <span className="text-[10px] font-semibold uppercase tracking-[0.28em] text-white/36">
                  0{index + 1}
                </span>
              </div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-blue-200/60">
                {card.label}
              </p>
              <h3 className="mt-3 font-display text-xl font-semibold text-white">
                {card.title}
              </h3>
              <p className="mt-3 text-sm leading-6 text-white/50">
                {card.body}
              </p>
            </div>
          ))}
        </div>

        <div className="mt-10 grid gap-4 rounded-[2rem] border border-white/10 bg-black/45 p-4 backdrop-blur-xl md:grid-cols-4">
          <Metric label="Sources" value="10" />
          <Metric label="Refresh Cycle" value="12H" />
          <Metric label="Output" value="Blog" />
          <a
            href={`/${lang}/news`}
            className="group flex items-center justify-between rounded-2xl border border-blue-300/15 bg-blue-500/10 px-5 py-4 text-sm font-semibold text-blue-100 transition hover:bg-blue-500/15"
          >
            {copy.cta}
            <ArrowUpRight className="h-4 w-4 transition group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
          </a>
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
