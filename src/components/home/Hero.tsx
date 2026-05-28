"use client";

import Image from "next/image";
import {
  motion,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
  AnimatePresence,
} from "framer-motion";
import type { Lang } from "@/lib/i18n";

const springTransition = { type: "spring", stiffness: 100, damping: 20 };

const containerVariants = {
  hidden: {},
  visible: {
    staggerChildren: 0.15,
    delayChildren: 0.2,
  },
};

const logoVariants = {
  hidden: { opacity: 0, scale: 0.94, filter: "blur(8px)" },
  visible: {
    opacity: 1,
    scale: 1,
    filter: "blur(0px)",
    transition: { duration: 1.2, ease: [0.16, 1, 0.3, 1] },
  },
};

const taglineVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { duration: 0.6, ease: "easeOut" },
  },
};

const systemBootVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { duration: 0.5, ease: "easeOut" },
  },
};

const scrollIndicatorVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { duration: 0.4, ease: "easeOut" },
  },
};

const orbPulseVariants = {
  pulse: {
    scale: [1, 1.08, 1],
    opacity: [0.7, 1, 0.7],
    transition: { duration: 4, repeat: Infinity, ease: "easeInOut" },
  },
};

export function Hero({
  lang = "zh",
  stats = { articles: 300, tools: 120 },
}: {
  lang?: Lang;
  stats?: { articles: number; tools: number };
}) {
  const prefersReducedMotion = useReducedMotion();
  const { scrollYProgress } = useScroll();

  // Parallax transforms
  const backgroundY = useTransform(
    scrollYProgress,
    [0, 1],
    [0, -120]
  );

  // Logo transforms on scroll
  const logoOpacity = useTransform(scrollYProgress, [0, 0.16, 0.32], [1, 0.82, 0]);
  const logoScale = useTransform(scrollYProgress, [0, 0.32], [1, 0.86]);
  const logoY = useTransform(scrollYProgress, [0, 0.32], [0, -72]);

  // Ambient glow
  const ambientOpacity = useTransform(scrollYProgress, [0, 0.38], [1, 0.42]);

  // Veil
  const veilOpacity = useTransform(scrollYProgress, [0, 0.2, 0.48], [0.1, 0.42, 0.82]);

  // System boot text
  const systemOpacity = useTransform(scrollYProgress, [0.04, 0.2, 0.38], [0, 1, 0]);

  // Spring-smoothed orb positions
  const orb1X = useSpring(0, { stiffness: 50, damping: 20 });
  const orb1Y = useSpring(0, { stiffness: 50, damping: 20 });
  const orb2X = useSpring(0, { stiffness: 50, damping: 20 });
  const orb2Y = useSpring(0, { stiffness: 50, damping: 20 });
  const orb3X = useSpring(0, { stiffness: 50, damping: 20 });
  const orb3Y = useSpring(0, { stiffness: 50, damping: 20 });

  // Mouse tracking for orbs
  const handleMouseMove = (e: React.MouseEvent<HTMLElement>) => {
    if (prefersReducedMotion) return;
    const x = (e.clientX / window.innerWidth - 0.5) * 30;
    const y = (e.clientY / window.innerHeight - 0.5) * 20;
    orb1X.set(x);
    orb1Y.set(y);
    orb2X.set(-x * 0.8);
    orb2Y.set(-y * 0.6);
    orb3X.set(x * 0.6);
    orb3Y.set(y * 0.9);
  };

  const tagline = lang === "zh" ? "Signal detection online" : "Signal detection online";

  const MotionSection = motion.section;
  const MotionDiv = motion.div;

  if (prefersReducedMotion) {
    return (
      <section className="relative h-[62svh] min-h-[480px] overflow-hidden bg-white text-ink-950 dark:bg-black dark:text-white md:h-[72vh] md:min-h-[560px]">
        <div className="sticky top-0 flex min-h-[480px] items-center justify-center overflow-hidden md:min-h-[560px]">
          <div
            aria-hidden="true"
            className="absolute inset-0 bg-[url('/images/radar-ai-studio-light.jpeg')] bg-cover bg-center bg-no-repeat opacity-95 dark:hidden"
          />
          <div
            aria-hidden="true"
            className="absolute inset-0 hidden bg-[url('/images/radar-ai-studio-bg.jpeg')] bg-cover bg-center bg-no-repeat opacity-95 dark:block"
          />
          <div aria-hidden="true" className="absolute inset-0">
            <div className="absolute left-1/2 top-[42%] h-72 w-72 -translate-x-1/2 -translate-y-1/2 rounded-full bg-blue-500/10 blur-3xl dark:bg-blue-500/20" />
            <div className="absolute left-[18%] top-[22%] h-44 w-44 rounded-full bg-sky-400/[0.08] blur-3xl dark:bg-sky-400/10" />
            <div className="absolute right-[16%] bottom-[18%] h-52 w-52 rounded-full bg-blue-700/[0.08] blur-3xl dark:bg-blue-700/12" />
          </div>
          <div aria-hidden="true" className="cinematic-particles absolute inset-0" />
          <div aria-hidden="true" className="absolute inset-6 hidden border border-ink-950/[0.045] dark:border-white/[0.045] md:block" />
          <div aria-hidden="true" className="absolute left-6 top-6 hidden h-16 w-16 border-l border-t border-blue-500/20 dark:border-blue-300/25 md:block" />
          <div aria-hidden="true" className="absolute right-6 top-6 hidden h-16 w-16 border-r border-t border-blue-500/20 dark:border-blue-300/25 md:block" />
          <div aria-hidden="true" className="absolute bottom-6 left-6 hidden h-16 w-16 border-b border-l border-blue-500/15 dark:border-blue-300/18 md:block" />
          <div aria-hidden="true" className="absolute bottom-6 right-6 hidden h-16 w-16 border-b border-r border-blue-500/15 dark:border-blue-300/18 md:block" />
          <div
            aria-hidden="true"
            className="absolute inset-0 bg-[radial-gradient(circle_at_50%_42%,transparent_0%,rgba(255,255,255,0.10)_35%,rgba(255,255,255,0.70)_82%,#fff_100%)] dark:bg-[radial-gradient(circle_at_50%_42%,transparent_0%,rgba(0,0,0,0.16)_35%,rgba(0,0,0,0.82)_78%,#000_100%)]"
          />
          <div className="relative z-10 flex w-full max-w-5xl flex-col items-center px-6 text-center">
            <div className="h-px w-24 bg-gradient-to-r from-transparent via-blue-400/60 to-transparent" />
            <Image
              src="/images/radar-ai-studio-light.jpeg"
              alt="RADAR AI Studio"
              width={1536}
              height={1024}
              priority
              className="hidden"
              draggable={false}
            />
            <Image
              src="/images/radar-ai-studio-bg.jpeg"
              alt="RADAR AI Studio"
              width={1536}
              height={1024}
              priority
              className="mt-4 hidden w-full max-w-[min(86vw,760px)] select-none object-contain opacity-95 drop-shadow-[0_0_36px_rgba(37,99,235,0.18)] dark:block md:mt-6"
              draggable={false}
            />
            <div className="mt-3 h-px w-24 bg-gradient-to-r from-transparent via-ink-300 dark:via-white/45 to-transparent" />
          </div>
          <div className="pointer-events-none absolute bottom-6 left-1/2 z-20 hidden -translate-x-1/2 text-center sm:block md:bottom-10">
            <p className="rounded-full border border-ink-950/10 bg-white/60 px-5 py-2 text-[10px] font-medium uppercase tracking-[0.42em] text-ink-700 backdrop-blur-md dark:border-white/10 dark:bg-black/35 dark:text-white/65">
              {tagline}
            </p>
          </div>
          <div className="pointer-events-none absolute bottom-10 right-8 z-20 hidden text-right text-[10px] uppercase tracking-[0.28em] text-ink-500 dark:text-white/35 md:block">
            <div>System boot</div>
            <div className="mt-1 text-blue-600/70 dark:text-blue-300/60">Scroll to initialize</div>
          </div>
          <div className="pointer-events-none absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-white via-white/75 to-transparent dark:from-black dark:via-black/70 md:h-24" />
        </div>
      </section>
    );
  }

  return (
    <MotionSection
      onMouseMove={handleMouseMove}
      className="relative h-[62svh] min-h-[480px] overflow-hidden bg-white text-ink-950 dark:bg-black dark:text-white md:h-[72vh] md:min-h-[560px]"
    >
      <div className="sticky top-0 flex min-h-[480px] items-center justify-center overflow-hidden md:min-h-[560px]">
        {/* Parallax Background */}
        <MotionDiv
          aria-hidden="true"
          style={{ y: backgroundY }}
          className="absolute inset-0 bg-[url('/images/radar-ai-studio-light.jpeg')] bg-cover bg-center bg-no-repeat opacity-95 dark:hidden"
        />
        <MotionDiv
          aria-hidden="true"
          style={{ y: backgroundY }}
          className="absolute inset-0 hidden bg-[url('/images/radar-ai-studio-bg.jpeg')] bg-cover bg-center bg-no-repeat opacity-95 dark:block"
        />

        {/* Ambient Glow Orbs with Spring Physics */}
        <MotionDiv
          aria-hidden="true"
          style={{ opacity: ambientOpacity }}
          className="absolute inset-0"
        >
          {/* Orb 1 */}
          <MotionDiv
            style={{ x: orb1X, y: orb1Y }}
            animate="pulse"
            variants={orbPulseVariants}
            className="absolute left-1/2 top-[42%] h-72 w-72 -translate-x-1/2 -translate-y-1/2 rounded-full bg-blue-500/10 blur-3xl dark:bg-blue-500/20"
          />
          {/* Orb 2 */}
          <MotionDiv
            style={{ x: orb2X, y: orb2Y }}
            animate="pulse"
            variants={orbPulseVariants}
            className="absolute left-[18%] top-[22%] h-44 w-44 rounded-full bg-sky-400/[0.08] blur-3xl dark:bg-sky-400/10"
          />
          {/* Orb 3 */}
          <MotionDiv
            style={{ x: orb3X, y: orb3Y }}
            animate="pulse"
            variants={orbPulseVariants}
            className="absolute right-[16%] bottom-[18%] h-52 w-52 rounded-full bg-blue-700/[0.08] blur-3xl dark:bg-blue-700/12"
          />
        </MotionDiv>

        <div aria-hidden="true" className="cinematic-particles absolute inset-0" />
        <div aria-hidden="true" className="absolute inset-6 hidden border border-ink-950/[0.045] dark:border-white/[0.045] md:block" />
        <div aria-hidden="true" className="absolute left-6 top-6 hidden h-16 w-16 border-l border-t border-blue-500/20 dark:border-blue-300/25 md:block" />
        <div aria-hidden="true" className="absolute right-6 top-6 hidden h-16 w-16 border-r border-t border-blue-500/20 dark:border-blue-300/25 md:block" />
        <div aria-hidden="true" className="absolute bottom-6 left-6 hidden h-16 w-16 border-b border-l border-blue-500/15 dark:border-blue-300/18 md:block" />
        <div aria-hidden="true" className="absolute bottom-6 right-6 hidden h-16 w-16 border-b border-r border-blue-500/15 dark:border-blue-300/18 md:block" />

        {/* Veil */}
        <MotionDiv
          aria-hidden="true"
          style={{ opacity: veilOpacity }}
          className="absolute inset-0 bg-[radial-gradient(circle_at_50%_42%,transparent_0%,rgba(255,255,255,0.10)_35%,rgba(255,255,255,0.70)_82%,#fff_100%)] dark:bg-[radial-gradient(circle_at_50%_42%,transparent_0%,rgba(0,0,0,0.16)_35%,rgba(0,0,0,0.82)_78%,#000_100%)]"
        />

        {/* Staggered Reveal Content */}
        <MotionDiv
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="relative z-10 flex w-full max-w-5xl flex-col items-center px-6 text-center"
        >
          {/* Logo with staggered animation */}
          <MotionDiv
            variants={logoVariants}
            className="flex flex-col items-center"
          >
            <div className="h-px w-24 bg-gradient-to-r from-transparent via-blue-400/60 to-transparent" />
            <Image
              src="/images/radar-ai-studio-light.jpeg"
              alt="RADAR AI Studio"
              width={1536}
              height={1024}
              priority
              className="hidden"
              draggable={false}
            />
            <Image
              src="/images/radar-ai-studio-bg.jpeg"
              alt="RADAR AI Studio"
              width={1536}
              height={1024}
              priority
              className="mt-4 hidden w-full max-w-[min(86vw,760px)] select-none object-contain opacity-95 drop-shadow-[0_0_36px_rgba(37,99,235,0.18)] dark:block md:mt-6"
              draggable={false}
            />
            <div className="mt-3 h-px w-24 bg-gradient-to-r from-transparent via-ink-300 dark:via-white/45 to-transparent" />
          </MotionDiv>

          {/* Tagline Pill */}
          <MotionDiv variants={taglineVariants} className="mt-6">
            <p className="rounded-full border border-ink-950/10 bg-white/60 px-5 py-2 text-[10px] font-medium uppercase tracking-[0.42em] text-ink-700 backdrop-blur-md dark:border-white/10 dark:bg-black/35 dark:text-white/65">
              {tagline}
            </p>
          </MotionDiv>
        </MotionDiv>

        {/* Scroll Indicator */}
        <MotionDiv
          variants={scrollIndicatorVariants}
          initial="hidden"
          animate="visible"
          transition={{ delay: 1.8 }}
          className="pointer-events-none absolute bottom-10 right-8 z-20 hidden text-right text-[10px] uppercase tracking-[0.28em] text-ink-500 dark:text-white/35 md:block"
        >
          <div>System boot</div>
          <div className="mt-1 text-blue-600/70 dark:text-blue-300/60">Scroll to initialize</div>
          {/* Bouncing Chevron */}
          <motion.div
            animate={{ y: [0, 6, 0] }}
            transition={{ duration: 1.4, repeat: Infinity, ease: "easeInOut" }}
            className="mt-2 flex justify-end"
          >
            <svg
              width="12"
              height="12"
              viewBox="0 0 12 12"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M2 4L6 8L10 4"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </motion.div>
        </MotionDiv>

        {/* Dark mode gradient bottom */}
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-white via-white/75 to-transparent dark:from-black dark:via-black/70 md:h-24" />
      </div>
    </MotionSection>
  );
}
