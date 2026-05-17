import { Radar } from "lucide-react";
import { SITE_NAME } from "@/lib/site";
import type { Lang } from "@/lib/i18n";

export async function Hero({ lang = "zh" }: { lang?: Lang }) {
  const tagline = lang === "zh" ? "中文 AI Blog" : "Chinese AI Blog";

  return (
    <section className="relative overflow-hidden">
      <div className="pointer-events-none absolute inset-0 -z-10 bg-grid-light bg-grid dark:bg-grid-dark [mask-image:radial-gradient(ellipse_at_center,black_28%,transparent_70%)]" />
      <div className="pointer-events-none absolute left-1/2 top-0 -z-10 h-[420px] w-[900px] -translate-x-1/2 rounded-full bg-accent-500/20 blur-3xl dark:bg-accent-500/25" />

      <div className="container-page flex min-h-[46vh] items-center justify-center py-20 md:min-h-[56vh]">
        <div className="text-center">
          <div className="mx-auto flex h-28 w-28 items-center justify-center rounded-[2rem] border border-ink-200/80 bg-white/75 shadow-soft backdrop-blur dark:border-ink-800 dark:bg-ink-950/80">
            <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-ink-950 text-white shadow-glow dark:bg-white dark:text-ink-950">
              <Radar className="h-10 w-10" />
            </div>
          </div>
          <h1 className="mt-7 font-display text-4xl font-bold tracking-tight text-ink-950 dark:text-white md:text-6xl">
            {SITE_NAME}
          </h1>
          <p className="mt-3 text-sm font-medium uppercase tracking-[0.35em] text-accent-600 dark:text-accent-400">
            {tagline}
          </p>
        </div>
      </div>
    </section>
  );
}
