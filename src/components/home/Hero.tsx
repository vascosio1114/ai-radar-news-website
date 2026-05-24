"use client";

import Image from "next/image";
import { motion, useReducedMotion, useScroll, useTransform } from "framer-motion";
import type { Lang } from "@/lib/i18n";

export function Hero({
  lang = "zh",
  stats = { articles: 300, tools: 120 },
}: {
  lang?: Lang;
  stats?: { articles: number; tools: number };
}) {
  const prefersReducedMotion = useReducedMotion();
  const { scrollYProgress } = useScroll();
  // ... (keep transforms as is)

  const logoOpacity = useTransform(scrollYProgress, [0, 0.16, 0.32], [1, 0.82, 0]);
  const logoScale = useTransform(scrollYProgress, [0, 0.32], [1, 0.86]);
  const logoY = useTransform(scrollYProgress, [0, 0.32], [0, -72]);
  const ambientOpacity = useTransform(scrollYProgress, [0, 0.38], [1, 0.42]);
  const backgroundY = useTransform(scrollYProgress, [0, 0.45], [0, 90]);
  const veilOpacity = useTransform(scrollYProgress, [0, 0.2, 0.48], [0.1, 0.42, 0.82]);
  const systemOpacity = useTransform(scrollYProgress, [0.04, 0.2, 0.38], [0, 1, 0]);

  const tagline = lang === "zh" ? "Signal detection online" : "Signal detection online";

  return (
    <section className="relative h-[145vh] overflow-hidden bg-white text-ink-950 dark:bg-black dark:text-white">
      <div className="sticky top-0 flex h-screen items-center justify-center overflow-hidden">
        <motion.div
          aria-hidden="true"
          style={{ y: prefersReducedMotion ? 0 : backgroundY }}
          className="absolute inset-0 bg-[url('/images/radar-ai-studio-light.jpeg')] bg-cover bg-center bg-no-repeat opacity-95 dark:hidden"
        />
        <motion.div
          aria-hidden="true"
          style={{ y: prefersReducedMotion ? 0 : backgroundY }}
          className="absolute inset-0 hidden bg-[url('/images/radar-ai-studio-bg.jpeg')] bg-cover bg-center bg-no-repeat opacity-95 dark:block"
        />

        <motion.div
          aria-hidden="true"
          style={{ opacity: prefersReducedMotion ? 0.75 : ambientOpacity }}
          className="absolute inset-0"
        >
          <div className="absolute left-1/2 top-[42%] h-72 w-72 -translate-x-1/2 -translate-y-1/2 rounded-full bg-blue-500/10 blur-3xl dark:bg-blue-500/20" />
          <div className="absolute left-[18%] top-[22%] h-44 w-44 rounded-full bg-sky-400/[0.08] blur-3xl dark:bg-sky-400/10" />
          <div className="absolute right-[16%] bottom-[18%] h-52 w-52 rounded-full bg-blue-700/[0.08] blur-3xl dark:bg-blue-700/12" />
        </motion.div>

        <div aria-hidden="true" className="cinematic-particles absolute inset-0" />
        <div aria-hidden="true" className="absolute inset-6 hidden border border-ink-950/[0.045] dark:border-white/[0.045] md:block" />
        <div aria-hidden="true" className="absolute left-6 top-6 hidden h-16 w-16 border-l border-t border-blue-500/20 dark:border-blue-300/25 md:block" />
        <div aria-hidden="true" className="absolute right-6 top-6 hidden h-16 w-16 border-r border-t border-blue-500/20 dark:border-blue-300/25 md:block" />
        <div aria-hidden="true" className="absolute bottom-6 left-6 hidden h-16 w-16 border-b border-l border-blue-500/15 dark:border-blue-300/18 md:block" />
        <div aria-hidden="true" className="absolute bottom-6 right-6 hidden h-16 w-16 border-b border-r border-blue-500/15 dark:border-blue-300/18 md:block" />

        <motion.div
          aria-hidden="true"
          style={{ opacity: prefersReducedMotion ? 0.55 : veilOpacity }}
          className="absolute inset-0 bg-[radial-gradient(circle_at_50%_42%,transparent_0%,rgba(255,255,255,0.10)_35%,rgba(255,255,255,0.70)_82%,#fff_100%)] dark:bg-[radial-gradient(circle_at_50%_42%,transparent_0%,rgba(0,0,0,0.16)_35%,rgba(0,0,0,0.82)_78%,#000_100%)]"
        />

        <motion.div
          style={{
            opacity: prefersReducedMotion ? 1 : logoOpacity,
            scale: prefersReducedMotion ? 1 : logoScale,
            y: prefersReducedMotion ? 0 : logoY,
            filter: prefersReducedMotion ? "blur(0px)" : undefined,
          }}
          className="relative z-10 flex w-full max-w-5xl flex-col items-center px-6 text-center"
        >
          <div className="h-px w-24 bg-gradient-to-r from-transparent via-blue-400/60 to-transparent" />
          <Image
            src="/images/radar-ai-studio-light.jpeg"
            alt="RADAR AI Studio"
            width={1536}
            height={1024}
            priority
            className="mt-6 w-full max-w-[760px] select-none object-contain opacity-95 drop-shadow-[0_0_34px_rgba(37,99,235,0.10)] dark:hidden"
            draggable={false}
          />
          <Image
            src="/images/radar-ai-studio-bg.jpeg"
            alt="RADAR AI Studio"
            width={1536}
            height={1024}
            priority
            className="mt-6 hidden w-full max-w-[760px] select-none object-contain opacity-95 drop-shadow-[0_0_36px_rgba(37,99,235,0.18)] dark:block"
            draggable={false}
          />
          <div className="mt-3 h-px w-24 bg-gradient-to-r from-transparent via-ink-300 dark:via-white/45 to-transparent" />
        </motion.div>

        <motion.div
          style={{ opacity: prefersReducedMotion ? 0 : systemOpacity }}
          className="pointer-events-none absolute bottom-10 left-1/2 z-20 -translate-x-1/2 text-center"
        >
          <p className="rounded-full border border-ink-950/10 bg-white/60 px-5 py-2 text-[10px] font-medium uppercase tracking-[0.42em] text-ink-700 backdrop-blur-md dark:border-white/10 dark:bg-black/35 dark:text-white/65">
            {tagline}
          </p>
        </motion.div>

        <div className="pointer-events-none absolute bottom-10 right-8 z-20 hidden text-right text-[10px] uppercase tracking-[0.28em] text-ink-500 dark:text-white/35 md:block">
          <div>System boot</div>
          <div className="mt-1 text-blue-600/70 dark:text-blue-300/60">Scroll to initialize</div>
        </div>

        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-56 bg-gradient-to-t from-white via-white/75 to-transparent dark:from-black dark:via-black/70" />
      </div>
    </section>
  );
}
