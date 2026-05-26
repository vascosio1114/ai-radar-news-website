"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { motion, useScroll, useTransform, useMotionValue, useSpring } from "framer-motion";
import {
  ArrowRight,
  Bot,
  Radio,
  DatabaseZap,
  ShieldCheck,
  TrendingUp,
  ChevronRight,
  Star,
  Layers,
  Cpu,
  BarChart3,
  Lock,
  Mail,
  Search,
  Bell,
  Globe,
  Zap,
  Users,
  Briefcase,
  Play,
  ArrowUpRight,
  CpuIcon,
  Sun,
  Moon,
} from "lucide-react";

// ============================================================
// REDESIGNED LANDING PAGE — AI Radar
// Design: Asymmetric Split Hero + Motion-Engine Bento Grid
// Baseline: DESIGN_VARIANCE=8, MOTION_INTENSITY=6, VISUAL_DENSITY=4
// ============================================================

const Navbar = () => {
  const [theme, setTheme] = useState<"dark" | "light">("dark");

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 h-[72px] flex items-center justify-between px-6 md:px-10
      bg-[rgba(7,8,15,0.82)] backdrop-blur-[24px] border-b border-white/[0.06]">
      <div className="text-lg font-bold tracking-tight text-[#4dabf7]">RADAR</div>

      <div className="hidden md:flex items-center gap-8">
        {["Blog", "Tools", "Trends", "Community"].map((item) => (
          <motion.a
            key={item}
            href="#"
            whileHover={{ color: "#4dabf7", scale: 1.05 }}
            transition={{ type: "spring", stiffness: 500, damping: 20 }}
            className="text-sm text-white/50"
          >
            {item}
          </motion.a>
        ))}
      </div>

      <button
        onClick={() => setTheme(t => t === "dark" ? "light" : "dark")}
        className="p-2 rounded-xl hover:bg-white/5 transition-colors"
      >
        {theme === "dark" ? <Sun className="w-5 h-5 text-white/50" /> : <Moon className="w-5 h-5 text-white/50" />}
      </button>
    </nav>
  );
};

const fadeUp = {
  hidden: { opacity: 0, y: 28 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, delay: i * 0.1, ease: [0.16, 1, 0.3, 1] },
  }),
};

const stagger = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08 } },
};

const cardVariants = {
  hidden: { opacity: 0, y: 24 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, delay: i * 0.07, ease: [0.16, 1, 0.3, 1] },
  }),
};

function formatLargeNumber(value: number) {
  if (value >= 1_000_000_000) return `${(value / 1_000_000_000).toFixed(1)}B`;
  if (value >= 1_000_000) return `${Math.round(value / 1_000_000)}M`;
  if (value >= 1_000) return `${Math.round(value / 1_000)}K`;
  return value.toLocaleString("en-US");
}

const s = {
  eyebrow: "AI Signal System",
  heroTitle: "AI is replacing humans",
  heroTitleAccent: "at full speed.",
  heroSub:
    "Track AI workforce impact, company moves and tool trends in real time. Stay ahead of the signal.",
  cta: "Start exploring",
  ctaSecondary: "Watch demo",
  live: "Live · Updated 2m ago",
  latestNews: "Latest articles",
  viewAll: "View all",
  newsletterTitle: "Get the Daily AI Brief",
  newsletterDesc: "Weekly AI signal digest, straight to your inbox.",
  newsletterPlaceholder: "Enter your email",
  newsletterButton: "Subscribe",
  protocolEyebrow: "AI Intelligence Protocol",
  protocolTitle: "Not a news site — an AI signal system.",
  protocolDesc:
    "The platform collects global AI movements and turns them into blog posts, newsletters, dashboards and learning products.",
  protocolCta: "Read the blog",
  metrics: {
    sources: "Sources",
    refresh: "Refresh",
    output: "Output",
  },
  cards: {
    signal: {
      label: "Signal Intake",
      title: "10 sources / 12h cycle",
      body: "Scans AI labs, research communities, dev platforms and tech media, turning noise into readable signals.",
    },
    knowledge: {
      label: "Knowledge Layer",
      title: "Raw data → blog intelligence",
      body: "Every item is stored first, then ranked and transformed into contextual blog intelligence.",
    },
    editorial: {
      label: "Editorial Control",
      title: "Human judgment, at scale",
      body: "An editorial layer ensures content has taste, context and point of view — not just automated reposting.",
    },
  },
};

const mockJobImpact = {
  latest: { day: "2026-01", estimated_affected_roles: 1892000, index: 72.4 },
  change_pct: 3.2,
  points: [
    { day: "2025-01", estimated_affected_roles: 1200000, index: 55 },
    { day: "2026-01", estimated_affected_roles: 1892000, index: 72.4 },
  ],
};

// ============================================================
// Hero Section Motion Variants & Values
// ============================================================

// Orb pulse animation variants
const orbPulseVariants = {
  pulse: {
    scale: [1, 1.08, 1],
    opacity: [0.7, 1, 0.7],
    transition: { duration: 4, repeat: Infinity, ease: "easeInOut" },
  },
};

// Cinematic bracket pulse variants
const bracketPulseVariants = {
  pulse: {
    opacity: [0.4, 1, 0.4],
    transition: { duration: 4, repeat: Infinity, ease: "easeInOut" },
  },
};

export default function RedesignedDemoPage() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end start"],
  });

  const heroScale = useTransform(scrollYProgress, [0, 0.2], [1, 0.94]);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.25], [1, 0]);
  const globeY = useTransform(scrollYProgress, [0, 1], [0, -120]);
  const sectionOpacity = useTransform(scrollYProgress, [0.1, 0.3], [0, 1]);

  // Scroll-driven veil opacity
  const veilOpacity = useTransform(scrollYProgress, [0, 0.2, 0.48], [0.1, 0.42, 0.82]);

  // Mouse tracking for ambient orbs using useSpring + useMotionValue
  const orb1X = useMotionValue(0);
  const orb1Y = useMotionValue(0);
  const orb1XSpring = useSpring(orb1X, { stiffness: 50, damping: 20 });
  const orb1YSpring = useSpring(orb1Y, { stiffness: 50, damping: 20 });

  const orb2X = useMotionValue(0);
  const orb2Y = useMotionValue(0);
  const orb2XSpring = useSpring(orb2X, { stiffness: 50, damping: 20 });
  const orb2YSpring = useSpring(orb2Y, { stiffness: 50, damping: 20 });

  const orb3X = useMotionValue(0);
  const orb3Y = useMotionValue(0);
  const orb3XSpring = useSpring(orb3X, { stiffness: 50, damping: 20 });
  const orb3YSpring = useSpring(orb3Y, { stiffness: 50, damping: 20 });

  // Handle mouse move for orb tracking
  const handleMouseMove = (e: React.MouseEvent) => {
    orb1X.set((e.clientX / window.innerWidth - 0.5) * 30);
    orb1Y.set((e.clientY / window.innerHeight - 0.5) * 30);
    orb2X.set((e.clientX / window.innerWidth - 0.5) * -20);
    orb2Y.set((e.clientY / window.innerHeight - 0.5) * -20);
    orb3X.set((e.clientX / window.innerWidth - 0.5) * 15);
    orb3Y.set((e.clientY / window.innerHeight - 0.5) * 15);
  };

  return (
    <div ref={containerRef} className="min-h-screen bg-black text-white overflow-x-hidden">
      <Navbar />

      {/* Ambient background */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(16,185,129,0.12),transparent_50%),radial-gradient(circle_at_85%_60%,rgba(59,130,246,0.08),transparent_40%),radial-gradient(circle_at_15%_80%,rgba(16,185,129,0.06),transparent_35%)]"/>
        <div className="cinematic-particles absolute inset-0 opacity-40" />
      </div>

      {/* Navigation */}
      <nav className="relative z-50 flex items-center justify-between px-6 md:px-10 py-4">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="flex items-center gap-3"
        >
          <div className="relative">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-cyan-500 flex items-center justify-center shadow-lg shadow-emerald-500/20">
              <Globe className="w-5 h-5 text-white" />
            </div>
            <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-emerald-500 to-cyan-500 blur-md opacity-40 -z-10" />
          </div>
          <div>
            <h1 className="text-lg font-bold tracking-tight">AI RADAR</h1>
            <p className="text-[10px] text-white/30 uppercase tracking-widest">Stay ahead</p>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="hidden md:flex items-center gap-8"
        >
          {["Feed", "Industries", "Tools", "Companies"].map((item) => (
            <a key={item} href="#" className="relative text-sm text-white/50 hover:text-white transition-colors group">
              {item}
              <span className="absolute -bottom-1 left-0 w-0 h-[1px] bg-gradient-to-r from-emerald-400 to-cyan-400 transition-all duration-300 group-hover:w-full" />
            </a>
          ))}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="flex items-center gap-3"
        >
          <button className="p-2 rounded-xl text-white/40 hover:text-white hover:bg-white/5 transition">
            <Search className="w-[18px] h-[18px]" />
          </button>
          <button className="p-2 rounded-xl text-white/40 hover:text-white hover:bg-white/5 transition relative">
            <Bell className="w-[18px] h-[18px]" />
            <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-rose-500 rounded-full" />
          </button>
          <Link
            href="/en/news"
            className="px-4 py-2 bg-gradient-to-r from-emerald-500 to-cyan-500 rounded-full text-sm font-medium hover:shadow-lg hover:shadow-emerald-500/25 transition-shadow"
          >
            {s.cta}
          </Link>
        </motion.div>
      </nav>

      {/* ============================================================ */}
      {/* HERO SECTION — Cinematic Parallax + Orbs + Corner Brackets */}
      {/* ============================================================ */}
      <motion.section
        style={{ opacity: heroOpacity, scale: heroScale }}
        className="relative z-10 min-h-[100dvh] flex flex-col items-center justify-center overflow-hidden"
        onMouseMove={handleMouseMove}
      >
        {/* Layer 1: Solid void-950 background */}
        <div className="absolute inset-0 bg-[#030409] z-0" />

        {/* Layer 2: Smoke Radial Gradient */}
        <div className="absolute inset-0 z-[1]" style={{ background: "radial-gradient(circle at 50% 42%, rgba(77,171,247,0.18) 0%, rgba(0,0,0,0.6) 65%, rgba(0,0,0,0.95) 100%)" }} />

        {/* Layer 3: Hero Image — parallax y offset */}
        <motion.div
          style={{ y: globeY }}
          className="absolute inset-0 z-[2] flex items-center justify-center pointer-events-none"
        >
          {/* Placeholder hero visual - radar sweep effect */}
          <div className="relative w-[600px] h-[600px] opacity-20">
            <div className="absolute inset-0 rounded-full border border-signal-blue/30" />
            <div className="absolute inset-12 rounded-full border border-signal-blue/20" />
            <div className="absolute inset-24 rounded-full border border-signal-blue/15" />
            <div className="absolute inset-36 rounded-full border border-signal-blue/10" />
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
              className="absolute inset-0"
            >
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-0.5 h-1/2 bg-gradient-to-b from-signal-blue/50 to-transparent origin-bottom" />
            </motion.div>
          </div>
        </motion.div>

        {/* Layer 4: 3 Ambient Glow Orbs with mouse tracking */}
        {/* Orb 1 - large, top-left */}
        <motion.div
          animate="pulse"
          variants={orbPulseVariants}
          className="absolute z-[3] w-[280px] h-[280px] rounded-full pointer-events-none"
          style={{
            top: "20%",
            left: "10%",
            background: "radial-gradient(circle, rgba(77,171,247,0.12) 0%, transparent 70%)",
            filter: "blur(80px)",
            x: orb1XSpring,
            y: orb1YSpring,
          }}
        />
        {/* Orb 2 - medium, top-right */}
        <motion.div
          animate="pulse"
          variants={orbPulseVariants}
          className="absolute z-[3] w-[200px] h-[200px] rounded-full pointer-events-none"
          style={{
            top: "16%",
            right: "15%",
            background: "radial-gradient(circle, rgba(77,247,228,0.08) 0%, transparent 70%)",
            filter: "blur(60px)",
            x: orb2XSpring,
            y: orb2YSpring,
          }}
        />
        {/* Orb 3 - small, bottom-right */}
        <motion.div
          animate="pulse"
          variants={orbPulseVariants}
          className="absolute z-[3] w-[160px] h-[160px] rounded-full pointer-events-none"
          style={{
            bottom: "18%",
            right: "20%",
            background: "radial-gradient(circle, rgba(26,26,40,0.08) 0%, transparent 70%)",
            filter: "blur(60px)",
            x: orb3XSpring,
            y: orb3YSpring,
          }}
        />

        {/* Layer 5: Grain Overlay - SVG feTurbulence */}
        <div className="absolute inset-0 z-[4] pointer-events-none opacity-[0.045]">
          <svg className="w-full h-full opacity-[0.045]" xmlns="http://www.w3.org/2000/svg">
            <filter id="grain">
              <feTurbulence type="fractalNoise" baseFrequency="0.80" numOctaves="4" stitchTiles="stitch" />
              <feColorMatrix type="saturate" values="0" />
            </filter>
            <rect width="100%" height="100%" filter="url(#grain)" />
          </svg>
        </div>

        {/* Layer 6: 4 Cinematic Corner Brackets */}
        {["top-left", "top-right", "bottom-left", "bottom-right"].map((position) => (
          <motion.div
            key={position}
            animate="pulse"
            variants={bracketPulseVariants}
            className="absolute z-[5] w-16 h-16 pointer-events-none"
            style={{
              ...(position === "top-left" && { top: "5%", left: "3%" }),
              ...(position === "top-right" && { top: "5%", right: "3%" }),
              ...(position === "bottom-left" && { bottom: "5%", left: "3%" }),
              ...(position === "bottom-right" && { bottom: "5%", right: "3%" }),
            }}
          >
            <div
              className="absolute w-full h-full"
              style={{
                borderColor: "rgba(77,171,247,0.20)",
                ...(position.includes("top") && { borderTopWidth: "2px" }),
                ...(position.includes("bottom") && { borderBottomWidth: "2px" }),
                ...(position.includes("left") && { borderLeftWidth: "2px" }),
                ...(position.includes("right") && { borderRightWidth: "2px" }),
              }}
            />
          </motion.div>
        ))}

        {/* Layer 7: Scroll Veil Gradient - opacity tied to scroll */}
        <motion.div
          style={{ opacity: veilOpacity, background: "linear-gradient(to bottom, rgba(3,4,9,0.1) 0%, rgba(3,4,9,0.42) 50%, rgba(3,4,9,0.82) 100%)" }}
          className="absolute inset-0 z-[6] pointer-events-none"
        />

        {/* Layer 8: Hero Logo Image - centered, max-w-[760px] */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
          className="relative z-[7] max-w-[760px] w-full px-6 mt-16"
        >
          <div className="relative drop-shadow-[0_0_60px_rgba(77,171,247,0.3)]">
            {/* Placeholder radar display */}
            <div className="w-full aspect-[2.4/1] rounded-3xl bg-gradient-to-br from-void-800/80 to-void-900/80 border border-signal-blue/20 backdrop-blur-xl flex items-center justify-center overflow-hidden">
              <div className="relative w-3/4 h-3/4">
                <div className="absolute inset-0 rounded-full border-2 border-signal-blue/30" />
                <div className="absolute inset-4 rounded-full border border-signal-cyan/20" />
                <div className="absolute inset-8 rounded-full border border-signal-blue/15" />
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 6, repeat: Infinity, ease: "linear" }}
                  className="absolute inset-0"
                >
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-1 h-1/2 bg-gradient-to-b from-signal-blue to-transparent origin-bottom rounded-full" />
                </motion.div>
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-signal-blue/40" />
              </div>
            </div>
          </div>
        </motion.div>

        {/* Layer 9: Tagline Badge — "SIGNAL DETECTION ONLINE" */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="relative z-[7] mt-8"
        >
          <div className="px-5 py-2 rounded-full border border-signal-blue/30 bg-void-800/50 backdrop-blur-xl">
            <span className="text-xs font-semibold uppercase tracking-[0.2em] text-signal-blue">
              Signal Detection Online
            </span>
          </div>
        </motion.div>

        {/* Hero text content below */}
        <div className="relative z-[7] text-center mt-12 px-6 max-w-3xl">
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
            className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight mb-6"
          >
            {s.heroTitle}
            <br />
            <span className="bg-gradient-to-r from-emerald-400 via-cyan-400 to-blue-400 text-transparent bg-clip-text">
              {s.heroTitleAccent}
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.5, ease: [0.16, 1, 0.3, 1] }}
            className="text-base md:text-lg text-white/50 max-w-xl mx-auto leading-relaxed"
          >
            {s.heroSub}
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.7, ease: [0.16, 1, 0.3, 1] }}
            className="flex flex-wrap items-center justify-center gap-4 mt-10"
          >
            <Link
              href="/en/news"
              className="group relative px-6 py-3 rounded-full bg-gradient-to-r from-emerald-500 to-cyan-500 font-medium text-sm overflow-hidden inline-flex items-center gap-2 hover:shadow-lg hover:shadow-emerald-500/25 transition-shadow"
            >
              <span className="absolute inset-0 bg-gradient-to-r from-emerald-400 to-cyan-400 opacity-0 group-hover:opacity-100 transition-opacity" />
              <span className="relative flex items-center gap-2">
                {s.cta}
                <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
              </span>
            </Link>
            <button className="group relative px-6 py-3 rounded-full border border-white/20 font-medium text-sm text-white/70 hover:text-white hover:border-white/30 transition-colors overflow-hidden inline-flex items-center gap-2">
              <span className="absolute inset-0 bg-white/[0.05] opacity-0 group-hover:opacity-100 transition-opacity" />
              <span className="relative flex items-center gap-2">
                <Play className="w-4 h-4" />
                {s.ctaSecondary}
              </span>
            </button>
          </motion.div>
        </div>
      </motion.section>

      {/* ============================================================ */}
      {/* PROTOCOL TICKER — Infinite Scroll Strip */}
      {/* ============================================================ */}
      {(() => {
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
        return (
          <motion.section
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
            className="relative z-20 h-20 flex items-center overflow-hidden"
            style={{
              background: "rgba(7,8,15,0.6)",
              borderTop: "1px solid rgba(77,171,247,0.10)",
              borderBottom: "1px solid rgba(77,171,247,0.10)",
            }}
          >
            <motion.div
              className="flex items-center"
              animate={{ x: ["0%", "-50%"] }}
              transition={{ duration: 34, ease: "linear", repeat: Infinity }}
              style={{ width: "max-content" }}
            >
              {/* 2x repeat for seamless loop */}
              {[...signals, ...signals].map((signal, i) => (
                <div
                  key={i}
                  className="flex items-center px-6"
                >
                  <span
                    className="w-1.5 h-1.5 rounded-full mr-3"
                    style={{
                      backgroundColor: "rgba(77,171,247,1)",
                      boxShadow: "0 0 14px rgba(77,171,247,0.9)",
                    }}
                  />
                  <span
                    className="text-[10px] font-semibold uppercase tracking-widest whitespace-nowrap"
                    style={{ fontFamily: "Inter, sans-serif", color: "rgba(255,255,255,0.55)" }}
                  >
                    {signal}
                  </span>
                </div>
              ))}
            </motion.div>
          </motion.section>
        );
      })()}

      {/* Bento Grid Section — Motion Engine Bento */}
      <motion.section style={{ opacity: sectionOpacity }} className="relative z-20 px-6 md:px-10 pb-24">
        <div className="max-w-7xl mx-auto space-y-8">

          {/* Bento Row 1: 2-column split (65/35) */}
          <motion.div
            variants={stagger}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-80px" }}
            className="grid lg:grid-cols-[1.6fr_1fr] gap-6"
          >
            {/* Live AI Feed — wide glass card */}
            <motion.div
              variants={cardVariants}
              className="rounded-[2rem] overflow-hidden backdrop-blur-xl border border-white/[0.06] bg-gradient-to-b from-white/[0.05] to-transparent"
            >
              <div className="px-6 py-5 border-b border-white/[0.06] flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="relative flex h-3 w-3">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75" />
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-rose-500" />
                  </span>
                  <h2 className="text-base font-semibold tracking-tight">LIVE AI FEED</h2>
                </div>
                <span className="text-xs text-white/30 uppercase tracking-widest">Real-time</span>
              </div>

              <div className="p-4 space-y-3">
                {[
                  { time: "2 mins ago", headline: "OpenAI announces GPT-5 with full autonomous agent capabilities", source: "OpenAI", accent: "from-emerald-400 to-teal-500" },
                  { time: "15 mins ago", headline: "Shopify replaces 1,400 customer support roles with AI chatbots", source: "Shopify", accent: "from-violet-400 to-purple-500" },
                  { time: "32 mins ago", headline: "Anthropic releases Claude 4 with 1M token context window", source: "Anthropic", accent: "from-amber-400 to-orange-500" },
                  { time: "1 hour ago", headline: "Microsoft laid off 2,500 more workers as AI automation accelerates", source: "Microsoft", accent: "from-blue-400 to-indigo-500" },
                ].map((item, i) => (
                  <motion.div
                    key={i}
                    whileHover={{ x: 4 }}
                    transition={{ type: "spring", stiffness: 400, damping: 30 }}
                    className="group flex items-start gap-4 p-4 rounded-2xl bg-white/[0.02] hover:bg-white/[0.05] border border-transparent hover:border-white/[0.06] transition-all cursor-pointer"
                  >
                    <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${item.accent} flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform`}>
                      <Bot className="w-5 h-5 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs text-white/35">{item.time}</span>
                        <span className="text-xs text-white/15">·</span>
                        <span className="text-xs text-white/45">{item.source}</span>
                      </div>
                      <p className="text-sm font-medium leading-snug text-white/75 group-hover:text-white transition-colors">{item.headline}</p>
                    </div>
                    <ChevronRight className="w-4 h-4 text-white/20 group-hover:text-white/60 group-hover:translate-x-0.5 transition-all shrink-0 mt-1.5" />
                  </motion.div>
                ))}
              </div>

              <div className="px-6 py-4 border-t border-white/[0.06]">
                <Link
                  href="/en/news"
                  className="w-full py-3 rounded-xl text-sm text-white/40 hover:text-white bg-white/[0.03] hover:bg-white/[0.06] border border-white/[0.06] hover:border-white/[0.1] transition-all flex items-center justify-center gap-2"
                >
                  {s.viewAll}
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </motion.div>

            {/* AI Risk Index — narrow glass card */}
            <motion.div
              variants={cardVariants}
              className="rounded-[2rem] overflow-hidden backdrop-blur-xl border border-white/[0.06] bg-gradient-to-b from-white/[0.05] to-transparent"
            >
              <div className="px-6 py-5 border-b border-white/[0.06]">
                <div className="flex items-center gap-3">
                  <span className="w-3 h-3 rounded-full bg-amber-400" />
                  <h2 className="text-base font-semibold tracking-tight">RISK INDEX</h2>
                </div>
              </div>

              <div className="p-4 space-y-4">
                {[
                  { title: "Graphic Design", percent: "87%", color: "#ef4444", bar: "87%" },
                  { title: "Content Writing", percent: "82%", color: "#ef4444", bar: "82%" },
                  { title: "Legal Services", percent: "64%", color: "#fbbf24", bar: "64%" },
                  { title: "Project Mgmt", percent: "23%", color: "#10b981", bar: "23%" },
                  { title: "Software Dev", percent: "51%", color: "#fbbf24", bar: "51%" },
                ].map((item, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 8 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.06 }}
                    className="space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-white/70">{item.title}</span>
                      <span className="text-xs font-semibold" style={{ color: item.color }}>{item.percent}</span>
                    </div>
                    <div className="h-1.5 rounded-full bg-white/[0.06] overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        whileInView={{ width: item.bar }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.2 + i * 0.08, duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
                        className="h-full rounded-full"
                        style={{ backgroundColor: item.color }}
                      />
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </motion.div>

          {/* Bento Row 2: Features 4-col grid */}
          <motion.div
            variants={stagger}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-80px" }}
            className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4"
          >
            {[
              { icon: Bot, title: "AI Agent Tracking", desc: "Monitor which roles AI is automating in real-time", gradient: "from-emerald-500/20 to-teal-500/20" },
              { icon: BarChart3, title: "Impact Analytics", desc: "Visualize job displacement trends across industries", gradient: "from-cyan-500/20 to-blue-500/20" },
              { icon: DatabaseZap, title: "Real-time Feed", desc: "Breaking news on AI deployments and layoffs", gradient: "from-amber-500/20 to-orange-500/20" },
              { icon: Lock, title: "Career Defense", desc: "Actionable strategies to stay ahead of automation", gradient: "from-violet-500/20 to-purple-500/20" },
            ].map((feature, i) => (
              <motion.div
                key={i}
                variants={cardVariants}
                whileHover={{ y: -4 }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
                className="group relative p-6 rounded-[1.75rem] backdrop-blur-xl border border-white/[0.06] bg-gradient-to-br from-white/[0.04] to-transparent overflow-hidden hover:border-white/[0.1] transition-colors cursor-pointer"
              >
                <div className={`absolute inset-0 bg-gradient-to-br ${feature.gradient} opacity-0 group-hover:opacity-100 transition-opacity`} />
                <div className="relative">
                  <div className="w-11 h-11 rounded-2xl bg-white/[0.06] flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    <feature.icon className="w-5 h-5 text-emerald-400" />
                  </div>
                  <h3 className="text-sm font-semibold mb-2">{feature.title}</h3>
                  <p className="text-xs text-white/40 leading-relaxed">{feature.desc}</p>
                </div>
              </motion.div>
            ))}
          </motion.div>

          {/* Bento Row 3: 2-column (Tools + Companies) */}
          <motion.div
            variants={stagger}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-80px" }}
            className="grid lg:grid-cols-2 gap-6"
          >
            {/* Trending AI Tools */}
            <motion.div
              variants={cardVariants}
              className="rounded-[2rem] overflow-hidden backdrop-blur-xl border border-white/[0.06] bg-gradient-to-b from-white/[0.05] to-transparent"
            >
              <div className="px-6 py-5 border-b border-white/[0.06] flex items-center gap-3">
                <span className="w-3 h-3 rounded-full bg-emerald-400" />
                <h2 className="text-base font-semibold tracking-tight">TRENDING AI TOOLS</h2>
              </div>

              <div className="p-4 space-y-2">
                {[
                  { rank: 1, name: "ChatGPT", category: "AI Assistant", rating: 4.9, users: "180M+", color: "#10b981" },
                  { rank: 2, name: "Midjourney", category: "Image Generation", rating: 4.8, users: "15M+", color: "#8b5cf6" },
                  { rank: 3, name: "Copilot", category: "Code AI", rating: 4.7, users: "50M+", color: "#6366f1" },
                  { rank: 4, name: "Claude", category: "AI Assistant", rating: 4.9, users: "10M+", color: "#f59e0b" },
                  { rank: 5, name: "Gemini", category: "AI Assistant", rating: 4.6, users: "20M+", color: "#3b82f6" },
                ].map((tool, i) => (
                  <motion.div
                    key={i}
                    whileHover={{ x: 4 }}
                    transition={{ type: "spring", stiffness: 400, damping: 30 }}
                    className="group flex items-center gap-4 p-4 rounded-2xl bg-white/[0.02] hover:bg-white/[0.05] border border-transparent hover:border-white/[0.06] transition-all cursor-pointer"
                  >
                    <div className="w-9 h-9 rounded-xl flex items-center justify-center text-sm font-bold" style={{ backgroundColor: `${tool.color}20`, color: tool.color }}>
                      {tool.rank}
                    </div>
                    <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-white/10 to-white/5 flex items-center justify-center">
                      <Cpu className="w-5 h-5 text-white/50" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-semibold">{tool.name}</p>
                      <p className="text-xs text-white/35">{tool.category}</p>
                    </div>
                    <div className="text-right">
                      <div className="flex items-center gap-1 text-amber-400 text-xs">
                        <Star className="w-3.5 h-3.5 fill-amber-400" />
                        {tool.rating}
                      </div>
                      <p className="text-xs text-white/30 mt-0.5">{tool.users}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            {/* AI Companies War */}
            <motion.div
              variants={cardVariants}
              className="rounded-[2rem] overflow-hidden backdrop-blur-xl border border-white/[0.06] bg-gradient-to-b from-white/[0.05] to-transparent"
            >
              <div className="px-6 py-5 border-b border-white/[0.06] flex items-center gap-3">
                <Layers className="w-4 h-4 text-violet-400" />
                <h2 className="text-base font-semibold tracking-tight">AI COMPANIES WAR</h2>
              </div>

              <div className="p-4 space-y-2">
                {[
                  { name: "OpenAI", model: "GPT-5", cap: "$300B", color: "#10b981" },
                  { name: "Anthropic", model: "Claude 4", cap: "$85B", color: "#f59e0b" },
                  { name: "Google DeepMind", model: "Gemini 2", cap: "$180B", color: "#6366f1" },
                  { name: "Microsoft", model: "Copilot AI", cap: "$290B", color: "#3b82f6" },
                  { name: "Meta AI", model: "Llama 4", cap: "$140B", color: "#8b5cf6" },
                ].map((company, i) => (
                  <motion.div
                    key={i}
                    whileHover={{ x: 4 }}
                    transition={{ type: "spring", stiffness: 400, damping: 30 }}
                    className="group flex items-center gap-4 p-4 rounded-2xl bg-white/[0.02] hover:bg-white/[0.05] border border-transparent hover:border-white/[0.06] transition-all cursor-pointer"
                  >
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: `${company.color}20` }}>
                      <div className="w-3.5 h-3.5 rounded" style={{ backgroundColor: company.color }} />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-semibold">{company.name}</p>
                      <p className="text-xs text-white/35">Latest: {company.model}</p>
                    </div>
                    <p className="text-lg font-bold" style={{ color: company.color }}>{company.cap}</p>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </motion.div>

          {/* Protocol Section */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.6 }}
            className="relative overflow-hidden rounded-[2.5rem] border border-white/[0.08] bg-[#030508] py-16 px-8 md:px-12"
          >
            {/* Background effects */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(16,185,129,0.15),transparent_50%),radial-gradient(circle_at_0%_80%,rgba(59,130,246,0.08),transparent_40%)]" />
            <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:48px_48px]" />

            <div className="relative">
              <div className="text-center mb-12">
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/[0.04] border border-white/[0.08] backdrop-blur-xl mb-5">
                  <Bot className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-xs text-white/50 uppercase tracking-widest">{s.protocolEyebrow}</span>
                </div>
                <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4">
                  {s.protocolTitle}
                </h2>
                <p className="text-white/45 max-w-xl mx-auto text-sm leading-relaxed">{s.protocolDesc}</p>
              </div>

              {/* Protocol Cards */}
              <div className="grid md:grid-cols-3 gap-4 mb-10">
                {[s.cards.signal, s.cards.knowledge, s.cards.editorial].map((card, i) => (
                  <motion.div
                    key={i}
                    whileHover={{ y: -4 }}
                    transition={{ type: "spring", stiffness: 300, damping: 20 }}
                    className="group relative overflow-hidden rounded-2xl p-6 border border-white/[0.08] bg-gradient-to-b from-white/[0.05] to-white/[0.01] hover:border-emerald-400/25 transition-colors"
                  >
                    <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-emerald-400/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                    <div className="mb-5">
                      <div className="w-11 h-11 rounded-2xl border border-white/10 bg-black/50 flex items-center justify-center">
                        {i === 0 ? <Radio className="w-5 h-5 text-emerald-400" /> :
                         i === 1 ? <DatabaseZap className="w-5 h-5 text-cyan-400" /> :
                         <ShieldCheck className="w-5 h-5 text-violet-400" />}
                      </div>
                    </div>
                    <p className="text-[10px] font-semibold uppercase tracking-widest text-white/35 mb-2">{card.label}</p>
                    <h3 className="text-base font-semibold mb-2">{card.title}</h3>
                    <p className="text-xs text-white/40 leading-relaxed">{card.body}</p>
                  </motion.div>
                ))}
              </div>

              {/* Metrics row */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 rounded-2xl border border-white/[0.06] bg-white/[0.03] p-3">
                <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] px-5 py-4">
                  <p className="text-[10px] font-semibold uppercase tracking-widest text-white/30">{s.metrics.sources}</p>
                  <p className="mt-2 text-2xl font-bold">10</p>
                </div>
                <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] px-5 py-4">
                  <p className="text-[10px] font-semibold uppercase tracking-widest text-white/30">{s.metrics.refresh}</p>
                  <p className="mt-2 text-2xl font-bold">12H</p>
                </div>
                <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] px-5 py-4">
                  <p className="text-[10px] font-semibold uppercase tracking-widest text-white/30">{s.metrics.output}</p>
                  <p className="mt-2 text-2xl font-bold">Blog</p>
                </div>
                <Link
                  href="/en/news"
                  className="group rounded-xl border border-emerald-400/20 bg-emerald-500/10 px-5 py-4 flex items-center justify-between text-sm font-semibold text-emerald-100 hover:bg-emerald-500/15 transition-colors"
                >
                  {s.protocolCta}
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                </Link>
              </div>
            </div>
          </motion.div>

          {/* Newsletter CTA */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.6 }}
            className="relative overflow-hidden rounded-[2.5rem] border border-white/[0.06] bg-gradient-to-r from-emerald-500/10 via-cyan-500/10 to-violet-500/10"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-cyan-500/5" />
            <div className="absolute top-0 right-0 w-72 h-72 bg-emerald-500/10 rounded-full blur-3xl" />
            <div className="absolute bottom-0 left-0 w-72 h-72 bg-cyan-500/10 rounded-full blur-3xl" />

            <div className="relative px-8 py-10 flex flex-col md:flex-row items-center justify-between gap-8">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-500/30 to-cyan-500/30 backdrop-blur-xl border border-white/10 flex items-center justify-center">
                  <Mail className="w-6 h-6 text-emerald-400" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold tracking-tight">{s.newsletterTitle}</h3>
                  <p className="text-white/45 text-sm mt-1">{s.newsletterDesc}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 w-full md:w-auto">
                <input
                  type="email"
                  placeholder={s.newsletterPlaceholder}
                  className="flex-1 md:w-72 px-5 py-3 rounded-full bg-white/[0.05] border border-white/[0.1] backdrop-blur-xl text-white placeholder:text-white/35 focus:outline-none focus:border-emerald-400/50 focus:bg-white/[0.08] transition-colors"
                />
                <button className="px-6 py-3 rounded-full bg-gradient-to-r from-emerald-500 to-cyan-500 font-medium text-sm whitespace-nowrap hover:shadow-lg hover:shadow-emerald-500/20 transition-shadow">
                  {s.newsletterButton}
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      </motion.section>

      {/* Footer */}
      <footer className="relative z-20 border-t border-white/[0.06] px-6 md:px-10 py-12">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-8 mb-12">
            <div className="col-span-2 md:col-span-1">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-500 to-cyan-500 flex items-center justify-center">
                  <Globe className="w-4 h-4 text-white" />
                </div>
                <span className="font-bold">AI RADAR</span>
              </div>
              <p className="text-sm text-white/30">Stay ahead or get replaced.</p>
            </div>
            {[
              { title: "Platform", links: ["Features", "Pricing", "API"] },
              { title: "Resources", links: ["Blog", "Newsletter", "Guides"] },
              { title: "Legal", links: ["Privacy", "Terms", "Cookies"] },
              { title: "Follow", links: ["Twitter", "LinkedIn", "Discord"] },
            ].map((col, i) => (
              <div key={i}>
                <h4 className="font-semibold mb-4 text-sm">{col.title}</h4>
                <ul className="space-y-2">
                  {col.links.map((link) => (
                    <li key={link}>
                      <a href="#" className="text-sm text-white/35 hover:text-white transition-colors">
                        {link}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <div className="pt-8 border-t border-white/[0.06] flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-sm text-white/25">2024 AI Radar. All rights reserved.</p>
            <div className="flex items-center gap-4">
              {["Twitter", "LinkedIn", "Discord"].map((social) => (
                <a key={social} href="#" className="text-sm text-white/25 hover:text-white transition-colors">
                  {social}
                </a>
              ))}
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}