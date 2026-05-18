"use client";

import Image from "next/image";
import { motion, useReducedMotion, useScroll, useTransform } from "framer-motion";
import type { Lang } from "@/lib/i18n";

export function Hero({ lang = "zh" }: { lang?: Lang }) {
  const prefersReducedMotion = useReducedMotion();
  const { scrollYProgress } = useScroll();

  const logoOpacity = useTransform(scrollYProgress, [0, 0.16, 0.32], [1, 0.82, 0]);
  const logoScale = useTransform(scrollYProgress, [0, 0.32], [1, 0.86]);
  const logoY = useTransform(scrollYProgress, [0, 0.32], [0, -72]);
  const ambientOpacity = useTransform(scrollYProgress, [0, 0.38], [1, 0.42]);
  const backgroundY = useTransform(scrollYProgress, [0, 0.45], [0, 90]);
  const veilOpacity = useTransform(scrollYProgress, [0, 0.2, 0.48], [0.1, 0.42, 0.82]);
  const systemOpacity = useTransform(scrollYProgress, [0.04, 0.2, 0.38], [0, 1, 0]);

  const tagline = lang === "zh" ? "Signal detection online" : "Signal detection online";

  return (
    <section className="relative h-[145vh] overflow-hidden bg-black text-white">
      <div className="sticky top-0 flex h-screen items-center justify-center overflow-hidden">
        <motion.div
          aria-hidden="true"
          style={{ y: prefersReducedMotion ? 0 : backgroundY }}
          className="absolute inset-0 bg-[url('/images/radar-ai-studio-bg.jpeg')] bg-cover bg-center bg-no-repeat opacity-95"
        />

        <motion.div
          aria-hidden="true"
          style={{ opacity: prefersReducedMotion ? 0.75 : ambientOpacity }}
          className="absolute inset-0"
        >
          <div className="absolute left-1/2 top-[42%] h-72 w-72 -translate-x-1/2 -translate-y-1/2 rounded-full bg-blue-500/20 blur-3xl" />
          <div className="absolute left-[18%] top-[22%] h-44 w-44 rounded-full bg-sky-400/10 blur-3xl" />
          <div className="absolute right-[16%] bottom-[18%] h-52 w-52 rounded-full bg-blue-700/12 blur-3xl" />
        </motion.div>

        <div aria-hidden="true" className="cinematic-particles absolute inset-0" />
        <div aria-hidden="true" className="absolute inset-6 hidden border border-white/[0.045] md:block" />
        <div aria-hidden="true" className="absolute left-6 top-6 hidden h-16 w-16 border-l border-t border-blue-300/25 md:block" />
        <div aria-hidden="true" className="absolute right-6 top-6 hidden h-16 w-16 border-r border-t border-blue-300/25 md:block" />
        <div aria-hidden="true" className="absolute bottom-6 left-6 hidden h-16 w-16 border-b border-l border-blue-300/18 md:block" />
        <div aria-hidden="true" className="absolute bottom-6 right-6 hidden h-16 w-16 border-b border-r border-blue-300/18 md:block" />

        <motion.div
          aria-hidden="true"
          style={{ opacity: prefersReducedMotion ? 0.55 : veilOpacity }}
          className="absolute inset-0 bg-[radial-gradient(circle_at_50%_42%,transparent_0%,rgba(0,0,0,0.16)_35%,rgba(0,0,0,0.82)_78%,#000_100%)]"
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
            src="/images/radar-ai-studio-bg.jpeg"
            alt="RADAR AI Studio"
            width={1536}
            height={1024}
            priority
            className="mt-6 w-full max-w-[760px] select-none object-contain opacity-95 drop-shadow-[0_0_36px_rgba(37,99,235,0.18)]"
            draggable={false}
          />
          <div className="mt-3 h-px w-24 bg-gradient-to-r from-transparent via-white/45 to-transparent" />
        </motion.div>

        <motion.div
          style={{ opacity: prefersReducedMotion ? 0 : systemOpacity }}
          className="pointer-events-none absolute bottom-10 left-1/2 z-20 -translate-x-1/2 text-center"
        >
          <p className="rounded-full border border-white/10 bg-black/35 px-5 py-2 text-[10px] font-medium uppercase tracking-[0.42em] text-white/65 backdrop-blur-md">
            {tagline}
          </p>
        </motion.div>

        <div className="pointer-events-none absolute bottom-10 right-8 z-20 hidden text-right text-[10px] uppercase tracking-[0.28em] text-white/35 md:block">
          <div>System boot</div>
          <div className="mt-1 text-blue-300/60">Scroll to initialize</div>
        </div>

        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-56 bg-gradient-to-t from-black via-black/70 to-transparent" />
      </div>
    </section>
  );
}
