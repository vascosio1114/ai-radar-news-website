import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";
import { getUIStrings, type Lang } from "@/lib/i18n";
import { getStats, getHotTopics } from "@/lib/dashboard/queries";
import { HotTopics } from "@/components/home/HotTopics";

export async function Hero({ lang = "zh" }: { lang?: Lang }) {
  const s = getUIStrings(lang);

  // 拎 live data；如果 Supabase 出事就 fallback default
  let liveStats: { items_24h: number; total_items: number; active_sources: number } | null = null;
  let topics: Awaited<ReturnType<typeof getHotTopics>> = [];
  try {
    const [stats, hot] = await Promise.all([getStats(), getHotTopics()]);
    liveStats = {
      items_24h: stats.items_24h,
      total_items: stats.total_items,
      active_sources: stats.active_sources,
    };
    topics = hot;
  } catch (e) {
    // Silent — Hero 仍然 render 用 hardcoded fallback
    console.warn("[Hero] live data fetch failed", e);
  }

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
            {s.heroBadge}
          </div>

          <h1 className="font-display text-4xl font-bold tracking-tight sm:text-6xl md:text-7xl">
            <span className="text-gradient">{s.heroTitle1}</span>
            <br className="hidden sm:block" />
            <span className="text-ink-900 dark:text-white">{s.heroTitle2}</span>
          </h1>

          <p className="mx-auto mt-6 max-w-2xl text-base leading-relaxed text-ink-500 dark:text-ink-400 md:text-lg">
            {s.heroDesc}
          </p>

          <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link
              href={`/${lang}/news`}
              className="group inline-flex items-center gap-2 rounded-full bg-ink-900 px-6 py-3 text-sm font-semibold text-white transition hover:bg-ink-800 dark:bg-white dark:text-ink-900 dark:hover:bg-ink-100"
            >
              {s.heroCta1}
              <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
            </Link>
            <Link
              href={`/${lang}/tools`}
              className="inline-flex items-center gap-2 rounded-full border border-ink-200 bg-white/60 px-6 py-3 text-sm font-semibold text-ink-700 backdrop-blur transition hover:border-accent-400 hover:text-accent-600 dark:border-ink-800 dark:bg-ink-900/60 dark:text-ink-200 dark:hover:text-accent-400"
            >
              <Sparkles className="h-4 w-4" />
              {s.heroCta2}
            </Link>
          </div>

          {/* Stats strip — use live data when available, fall back to i18n strings */}
          <div className="mx-auto mt-16 grid max-w-2xl grid-cols-3 gap-4">
            {[
              liveStats
                ? { v: liveStats.total_items.toLocaleString(), k: lang === "zh" ? "AI 新聞總數" : "AI items" }
                : { v: s.heroStat1Val, k: s.heroStat1Key },
              liveStats
                ? { v: `${liveStats.items_24h}`, k: lang === "zh" ? "今日新增" : "Added today" }
                : { v: s.heroStat2Val, k: s.heroStat2Key },
              liveStats
                ? { v: `${liveStats.active_sources}`, k: lang === "zh" ? "Source 數量" : "Sources" }
                : { v: s.heroStat3Val, k: s.heroStat3Key },
            ].map((stat) => (
              <div
                key={stat.k}
                className="glass rounded-2xl px-4 py-5 text-center"
              >
                <div className="font-display text-2xl font-semibold text-ink-900 dark:text-white">
                  {stat.v}
                </div>
                <div className="mt-1 text-xs text-ink-500 dark:text-ink-400">
                  {stat.k}
                </div>
              </div>
            ))}
          </div>

          {/* Hot topics ticker — link to /dashboard */}
          <HotTopics topics={topics} lang={lang} />
        </div>
      </div>
    </section>
  );
}
