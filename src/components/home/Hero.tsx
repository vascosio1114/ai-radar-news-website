import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";

export function Hero() {
  return (
    <section className="relative overflow-hidden">
      {/* Backdrop: grid + radial glow */}
      <div className="pointer-events-none absolute inset-0 -z-10 bg-grid-light bg-grid dark:bg-grid-dark [mask-image:radial-gradient(ellipse_at_center,black_30%,transparent_70%)]" />
      <div className="pointer-events-none absolute left-1/2 top-0 -z-10 h-[640px] w-[1200px] -translate-x-1/2 rounded-full bg-accent-500/20 blur-3xl dark:bg-accent-500/30 animate-pulse-glow" />

      <div className="container-page relative pt-20 pb-16 md:pt-28 md:pb-24">
        <div className="mx-auto max-w-3xl text-center">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-ink-200 bg-white/70 px-3 py-1 text-xs font-medium text-ink-600 backdrop-blur dark:border-ink-800 dark:bg-ink-900/60 dark:text-ink-300">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-accent-400 opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-accent-500" />
            </span>
            每日更新 · 繁體中文
          </div>

          <h1 className="font-display text-4xl font-bold tracking-tight sm:text-6xl md:text-7xl">
            <span className="text-gradient">AI 浪潮</span>
            <br className="hidden sm:block" />
            <span className="text-ink-900 dark:text-white">由你開始追上</span>
          </h1>

          <p className="mx-auto mt-6 max-w-2xl text-base leading-relaxed text-ink-500 dark:text-ink-400 md:text-lg">
            最新 AI 新聞、AI 工具評測、實用教學同趨勢分析。
            一個地方，幫你睇懂 AI 點樣改變世界。
          </p>

          <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link
              href="/news"
              className="group inline-flex items-center gap-2 rounded-full bg-ink-900 px-6 py-3 text-sm font-semibold text-white transition hover:bg-ink-800 dark:bg-white dark:text-ink-900 dark:hover:bg-ink-100"
            >
              睇今日熱門
              <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
            </Link>
            <Link
              href="/tools"
              className="inline-flex items-center gap-2 rounded-full border border-ink-200 bg-white/60 px-6 py-3 text-sm font-semibold text-ink-700 backdrop-blur transition hover:border-accent-400 hover:text-accent-600 dark:border-ink-800 dark:bg-ink-900/60 dark:text-ink-200 dark:hover:text-accent-400"
            >
              <Sparkles className="h-4 w-4" />
              探索 AI 工具
            </Link>
          </div>

          {/* Stats strip */}
          <div className="mx-auto mt-16 grid max-w-2xl grid-cols-3 gap-4">
            {[
              { v: "300+", k: "AI 新聞" },
              { v: "120+", k: "AI 工具" },
              { v: "每日", k: "更新" },
            ].map((s) => (
              <div
                key={s.k}
                className="glass rounded-2xl px-4 py-5 text-center"
              >
                <div className="font-display text-2xl font-semibold text-ink-900 dark:text-white">
                  {s.v}
                </div>
                <div className="mt-1 text-xs text-ink-500 dark:text-ink-400">
                  {s.k}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
