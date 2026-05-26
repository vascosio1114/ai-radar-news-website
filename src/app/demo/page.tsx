"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { motion, useScroll, useTransform } from "framer-motion";
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

export default function RedesignedDemoPage() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end start"],
  });

  const heroScale = useTransform(scrollYProgress, [0, 0.2], [1, 0.94]);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.25], [1, 0]);
  const globeY = useTransform(scrollYProgress, [0, 0.3], [0, -60]);
  const sectionOpacity = useTransform(scrollYProgress, [0.1, 0.3], [0, 1]);

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

      {/* Hero Section — Asymmetric Split Screen */}
      <motion.section
        style={{ opacity: heroOpacity, scale: heroScale }}
        className="relative z-10 px-6 md:px-10 pt-8 pb-20"
      >
        <div className="max-w-7xl mx-auto w-full">
          <div className="grid lg:grid-cols-2 gap-12 items-center">

            {/* Left: Hero Text — asymmetric left-aligned */}
            <div className="space-y-8">
              <motion.div
                custom={0}
                variants={fadeUp}
                initial="hidden"
                animate="visible"
                className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/[0.03] border border-white/[0.08] backdrop-blur-xl"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-xs text-white/50">{s.live}</span>
              </motion.div>

              <motion.h1
                custom={1}
                variants={fadeUp}
                initial="hidden"
                animate="visible"
                className="text-4xl md:text-5xl lg:text-[4.5rem] font-bold leading-[1.05] tracking-tight"
              >
                {s.heroTitle}
                <br />
                <span className="bg-gradient-to-r from-emerald-400 via-cyan-400 to-blue-400 text-transparent bg-clip-text">
                  {s.heroTitleAccent}
                </span>
              </motion.h1>

              <motion.p
                custom={2}
                variants={fadeUp}
                initial="hidden"
                animate="visible"
                className="text-base text-white/45 max-w-md leading-relaxed"
              >
                {s.heroSub}
              </motion.p>

              {/* Stats Row — asymmetric Bento tiles */}
              <motion.div
                custom={3}
                variants={fadeUp}
                initial="hidden"
                animate="visible"
                className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-2"
              >
                {[
                  { icon: Briefcase, value: formatLargeNumber(mockJobImpact.latest.estimated_affected_roles), label: "Workers exposed", delta: `+${formatLargeNumber(mockJobImpact.latest.estimated_affected_roles - mockJobImpact.points[0].estimated_affected_roles)}`, deltaColor: "text-rose-400", bg: "bg-amber-500/20", ic: "text-amber-400" },
                  { icon: Zap, value: "247", label: "AI stories", delta: "2m ago", deltaColor: "text-emerald-400", bg: "bg-cyan-500/20", ic: "text-cyan-400" },
                  { icon: TrendingUp, value: "89", label: "Cos moving", delta: "+12 this week", deltaColor: "text-violet-400", bg: "bg-violet-500/20", ic: "text-violet-400" },
                  { icon: Users, value: "2.4M", label: "Subscribers", delta: "+18K today", deltaColor: "text-rose-400", bg: "bg-rose-500/20", ic: "text-rose-400" },
                ].map((stat, i) => (
                  <motion.div
                    key={i}
                    whileHover={{ scale: 1.03 }}
                    transition={{ type: "spring", stiffness: 300, damping: 20 }}
                    className="group relative overflow-hidden rounded-2xl p-4 backdrop-blur-xl border border-white/[0.06] bg-gradient-to-br from-white/[0.04] to-white/[0.01] hover:border-white/10 transition-colors cursor-pointer"
                  >
                    <div className={`w-9 h-9 rounded-xl ${stat.bg} flex items-center justify-center mb-3`}>
                      <stat.icon className={`w-4.5 h-4.5 ${stat.ic}`} />
                    </div>
                    <p className="text-xl md:text-2xl font-bold tracking-tight">{stat.value}</p>
                    <p className="text-xs text-white/35 mt-0.5">{stat.label}</p>
                    <p className={`text-xs mt-1.5 ${stat.deltaColor}`}>{stat.delta}</p>
                  </motion.div>
                ))}
              </motion.div>

              {/* CTA Buttons */}
              <motion.div
                custom={4}
                variants={fadeUp}
                initial="hidden"
                animate="visible"
                className="flex flex-wrap items-center gap-4"
              >
                <Link
                  href="/en/news"
                  className="group relative px-6 py-3 rounded-full bg-gradient-to-r from-emerald-500 to-cyan-500 font-medium text-sm overflow-hidden inline-flex items-center gap-2"
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

            {/* Right: Abstract Visual — orb with orbiting rings */}
            <motion.div
              style={{ y: globeY }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 1, delay: 0.3 }}
              className="relative hidden lg:flex h-[540px] items-center justify-center"
            >
              {/* Central orb glow */}
              <div className="absolute inset-0 flex items-center justify-center">
                <motion.div
                  animate={{ scale: [1, 1.08, 1], rotate: [0, 180, 360] }}
                  transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                  className="w-72 h-72 rounded-full bg-gradient-to-br from-emerald-500/20 via-cyan-500/15 to-transparent blur-3xl"
                />
              </div>

              {/* Orbiting rings */}
              {[...Array(3)].map((_, i) => (
                <motion.div
                  key={i}
                  animate={{ rotate: 360 }}
                  transition={{ duration: 20 + i * 8, repeat: Infinity, ease: "linear", delay: i * 2 }}
                  className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/[0.08]"
                  style={{ width: 180 + i * 80, height: 180 + i * 80 }}
                />
              ))}

              {/* Floating data points */}
              {[...Array(8)].map((_, i) => (
                <motion.div
                  key={i}
                  animate={{ y: [-20, 20, -20], opacity: [0.3, 0.7, 0.3] }}
                  transition={{ duration: 3 + i * 0.4, repeat: Infinity, ease: "easeInOut", delay: i * 0.4 }}
                  className="absolute w-2 h-2 rounded-full"
                  style={{
                    left: `${15 + (i % 4) * 22}%`,
                    top: `${12 + Math.floor(i / 4) * 62}%`,
                    backgroundColor: i % 2 === 0 ? "#10b981" : "#06b6d4",
                    boxShadow: i % 2 === 0 ? "0 0 14px #10b981" : "0 0 14px #06b6d4",
                  }}
                />
              ))}

              {/* Central core */}
              <div className="relative w-40 h-40">
                <div className="absolute inset-0 rounded-full border border-emerald-400/20" />
                <div className="absolute inset-3 rounded-full border border-cyan-400/20" />
                <div className="absolute inset-6 rounded-full bg-gradient-to-br from-emerald-500/30 to-cyan-500/30 backdrop-blur-xl border border-white/10">
                  <div className="absolute top-4 left-1/2 -translate-x-1/2 w-2 h-2 rounded-full bg-white/70" />
                  <div className="absolute bottom-8 right-5 w-1.5 h-1.5 rounded-full bg-white/50" />
                  <div className="absolute bottom-10 left-6 w-1 h-1 rounded-full bg-white/40" />
                </div>
              </div>

              {/* Glow effect */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-72 h-72 bg-gradient-to-br from-emerald-500/10 to-cyan-500/10 rounded-full blur-3xl" />
            </motion.div>
          </div>
        </div>
      </motion.section>

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