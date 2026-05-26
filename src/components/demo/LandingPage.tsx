"use client";

import { useRef, useState, useEffect } from "react";
import { motion, useScroll, useTransform, useMotionValue, useSpring, AnimatePresence } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import {
  ArrowRight,
  X,
  List,
  Broadcast,
  ChartLine,
  MagnifyingGlass,
  Target,
  Waveform,
  TrendUp,
  Users,
  Handshake,
} from "@phosphor-icons/react";
import { DemoCarousel } from "./DemoCarousel";

const springConfig = { type: "spring" as const, stiffness: 100, damping: 20 };

const navLinks = [
  { label: "Work", href: "#work" },
  { label: "Services", href: "#services" },
  { label: "Demos", href: "#demos" },
  { label: "Contact", href: "#contact" },
];

const fadeUpVariants = {
  hidden: { opacity: 0, y: 32 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.7, delay: i * 0.12, ease: [0.16, 1, 0.3, 1] },
  }),
};

const staggerContainer = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1 } },
};

export function LandingPage() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end start"],
  });

  const heroY = useTransform(scrollYProgress, [0, 0.3], [0, -80]);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.35], [1, 0]);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 60);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div ref={containerRef} className="min-h-screen bg-zinc-950 text-zinc-200 overflow-x-hidden">
      {/* Fixed Navbar */}
      <nav
        className={`fixed top-0 left-0 right-0 z-50 h-16 flex items-center justify-between px-6 lg:px-12
          transition-all duration-500 ${
            scrolled
              ? "bg-zinc-950/90 backdrop-blur-xl border-b border-white/[0.06]"
              : "bg-transparent"
          }`}
      >
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="flex items-center gap-3"
        >
          <div className="w-8 h-8 rounded-lg bg-zinc-800 border border-white/10 flex items-center justify-center">
            <Broadcast className="w-4 h-4 text-zinc-400" weight="duotone" />
          </div>
          <span className="text-sm font-semibold tracking-tight">RADAR</span>
        </motion.div>

        {/* Desktop Nav */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="hidden md:flex items-center gap-8"
        >
          {navLinks.map((link) => (
            <a
              key={link.label}
              href={link.href}
              className="text-sm text-zinc-500 hover:text-white transition-colors"
            >
              {link.label}
            </a>
          ))}
        </motion.div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="hidden md:block"
        >
          <Link
            href="#contact"
            className="text-sm font-medium text-white/70 hover:text-white transition-colors"
          >
            airadar.team@gmail.com
          </Link>
        </motion.div>

        {/* Mobile Menu Toggle */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="md:hidden p-2"
        >
          {mobileMenuOpen ? (
            <X className="w-5 h-5 text-zinc-400" />
          ) : (
            <List className="w-5 h-5 text-zinc-400" />
          )}
        </button>
      </nav>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 bg-zinc-950/98 backdrop-blur-2xl md:hidden pt-20"
          >
            <div className="flex flex-col items-center gap-8 p-6">
              {navLinks.map((link, i) => (
                <motion.a
                  key={link.label}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="text-2xl font-light text-zinc-400 hover:text-white"
                >
                  {link.label}
                </motion.a>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Hero - Asymmetric editorial layout */}
      <motion.section
        style={{ y: heroY, opacity: heroOpacity }}
        className="relative z-10 min-h-[100dvh] flex items-center overflow-hidden"
      >
        {/* Background grid */}
        <div className="absolute inset-0 opacity-[0.03]">
          <div
            className="w-full h-full"
            style={{
              backgroundImage: "linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)",
              backgroundSize: "64px 64px",
            }}
          />
        </div>

        {/* Content - Left aligned, NOT centered */}
        <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-12 py-32 w-full">
          <div className="max-w-3xl">

            {/* Eyebrow */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="mb-8"
            >
              <span className="text-[11px] font-medium uppercase tracking-[0.3em] text-zinc-500">
                AI-Powered Creative Marketing
              </span>
            </motion.div>

            {/* Headline - NO gradient text, strong typography */}
            <motion.h1
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
              className="text-5xl md:text-6xl lg:text-7xl font-semibold tracking-tight leading-[1.0] mb-8"
            >
              We find your customers before they find your competitor.
            </motion.h1>

            {/* Subheadline - NO corporate speak */}
            <motion.p
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.2 }}
              className="text-lg text-zinc-500 leading-relaxed max-w-xl mb-12"
            >
              Radar helps visionary brands cut through the noise. We combine strategic thinking with execution that actually converts.
            </motion.p>

            {/* CTA row - minimal */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="flex items-center gap-6"
            >
              <Link
                href="#contact"
                className="group inline-flex items-center gap-3 px-6 py-3 bg-white text-zinc-950 text-sm font-medium rounded-lg hover:bg-zinc-100 transition-colors"
              >
                Get In Touch
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link
                href="#work"
                className="text-sm text-zinc-500 hover:text-white transition-colors"
              >
                See our work
              </Link>
            </motion.div>
          </div>
        </div>

        {/* Decorative element - right side, NOT a terminal mockup */}
        <div className="hidden lg:block absolute right-12 top-1/2 -translate-y-1/2 w-96 h-96">
          <div className="relative w-full h-full">
            {/* Abstract radar visualization */}
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
              className="absolute inset-0"
            >
              <div className="absolute inset-0 rounded-full border border-zinc-800" />
              <div className="absolute inset-8 rounded-full border border-zinc-800/50" />
              <div className="absolute inset-16 rounded-full border border-zinc-800/30" />
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-px h-1/2 bg-gradient-to-b from-zinc-600 to-transparent" />
            </motion.div>
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
              className="absolute inset-0"
              style={{ animationDirection: "reverse" }}
            >
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-px h-1/3 bg-gradient-to-b from-zinc-500 to-transparent" />
            </motion.div>
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-white" />
          </div>
        </div>
      </motion.section>

      {/* Live Signal Section - THE GOOD ONE, keep this exact structure */}
      <section className="relative z-10 py-24 px-6 lg:px-12">
        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-[1.2fr_1fr] gap-12 lg:gap-16 items-center">
            {/* Left column - Content */}
            <div>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-zinc-800 bg-zinc-900/50 mb-6"
              >
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-[10px] font-semibold uppercase tracking-widest text-zinc-400">
                  Live Signal Stream
                </span>
              </motion.div>

              <motion.h2
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.05 }}
                className="text-3xl md:text-4xl font-semibold tracking-tight mb-4"
              >
                Real-time intelligence on AI adoption patterns.
              </motion.h2>

              <motion.p
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.1 }}
                className="text-zinc-500 leading-relaxed"
              >
                We track global AI deployments, workforce impacts, and technology shifts. Our signal feeds aggregate data from hiring platforms, product launches, and industry reports — giving you the intelligence to make better decisions.
              </motion.p>
            </div>

            {/* Right column - Metrics */}
            <div className="space-y-4">
              {[
                { icon: Target, value: "10", label: "Sources", sub: "Curated AI signal feeds", delay: 0.1 },
                { icon: Waveform, value: "12h", label: "Refresh", sub: "Automatic ingest cycle", delay: 0.2 },
                { icon: ChartLine, value: "Blog", label: "Output", sub: "Analysis and reports", delay: 0.3 },
              ].map((metric, i) => (
                <motion.div
                  key={metric.label}
                  initial={{ opacity: 0, x: 20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: metric.delay }}
                  className="group flex items-center gap-4 p-5 rounded-xl border border-zinc-800/50 bg-zinc-900/30 hover:bg-zinc-900/50 hover:border-zinc-700/50 transition-colors"
                >
                  <div className="w-12 h-12 rounded-lg bg-zinc-800/80 border border-zinc-700/50 flex items-center justify-center">
                    <metric.icon className="w-5 h-5 text-zinc-400" weight="duotone" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-baseline gap-2">
                      <span className="text-2xl font-semibold text-white">{metric.value}</span>
                      <span className="text-sm text-zinc-400">{metric.label}</span>
                    </div>
                    <p className="text-xs text-zinc-600">{metric.sub}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Work Section - Case studies with real content */}
      <section id="work" className="relative z-10 py-24 px-6 lg:px-12 border-t border-zinc-900">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-end justify-between mb-16">
            <div>
              <span className="text-[11px] font-medium uppercase tracking-[0.3em] text-zinc-600 block mb-4">
                Selected Work
              </span>
              <h2 className="text-3xl md:text-4xl font-semibold tracking-tight">
                Projects with real results.
              </h2>
            </div>
            <Link
              href="#contact"
              className="hidden md:flex items-center gap-2 text-sm text-zinc-500 hover:text-white transition-colors"
            >
              View all
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {/* Project grid - asymmetric */}
          <div className="grid md:grid-cols-2 gap-6">
            {/* Project 1 - larger */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="group relative aspect-[4/3] rounded-2xl overflow-hidden bg-zinc-900 border border-zinc-800"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-zinc-800 to-zinc-900" />
              <div className="absolute inset-0 p-8 flex flex-col justify-end">
                <span className="text-[10px] font-medium uppercase tracking-widest text-zinc-500 mb-2">
                  Brand Strategy
                </span>
                <h3 className="text-xl font-semibold mb-2">Meridian Health</h3>
                <p className="text-sm text-zinc-500">Repositioning an established healthcare brand for the AI era. +47% patient inquiries in 60 days.</p>
              </div>
            </motion.div>

            {/* Project 2 */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="group relative aspect-[4/3] rounded-2xl overflow-hidden bg-zinc-900 border border-zinc-800"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-zinc-800 to-zinc-900" />
              <div className="absolute inset-0 p-8 flex flex-col justify-end">
                <span className="text-[10px] font-medium uppercase tracking-widest text-zinc-500 mb-2">
                  Growth Marketing
                </span>
                <h3 className="text-xl font-semibold mb-2">Orbital Labs</h3>
                <p className="text-sm text-zinc-500">Launch campaign for developer tooling. 3,200 signups in week one.</p>
              </div>
            </motion.div>

            {/* Project 3 - full width */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="group relative aspect-[21/9] rounded-2xl overflow-hidden bg-zinc-900 border border-zinc-800 md:col-span-2"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-zinc-800 to-zinc-900" />
              <div className="absolute inset-0 p-8 md:p-12 flex flex-col justify-end md:flex-row md:items-end md:justify-between gap-4">
                <div>
                  <span className="text-[10px] font-medium uppercase tracking-widest text-zinc-500 mb-2 block">
                    Full-Scale Campaign
                  </span>
                  <h3 className="text-xl md:text-2xl font-semibold mb-2">Vantage Financial</h3>
                  <p className="text-sm text-zinc-500 max-w-md">Integrated brand refresh, web redesign, and performance marketing for a fintech challenger bank.</p>
                </div>
                <div className="flex gap-8">
                  <div>
                    <span className="text-2xl font-semibold text-white">+89%</span>
                    <p className="text-xs text-zinc-600 mt-1">Conversion lift</p>
                  </div>
                  <div>
                    <span className="text-2xl font-semibold text-white">2.4x</span>
                    <p className="text-xs text-zinc-600 mt-1">ROI</p>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Services - NO bento grid, editorial list */}
      <section id="services" className="relative z-10 py-24 px-6 lg:px-12 border-t border-zinc-900">
        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-[1fr_1.5fr] gap-16">
            {/* Left - Sticky label */}
            <div className="lg:sticky lg:top-32 lg:self-start">
              <span className="text-[11px] font-medium uppercase tracking-[0.3em] text-zinc-600 block mb-4">
                What We Do
              </span>
              <h2 className="text-3xl md:text-4xl font-semibold tracking-tight mb-6">
                Strategy to execution, no handoff chains.
              </h2>
              <p className="text-zinc-500 leading-relaxed">
                Most agencies hand you a strategy deck and disappear. We stay through execution, because the best strategies fail without flawless implementation.
              </p>
            </div>

            {/* Right - Service list */}
            <div className="space-y-0 divide-y divide-zinc-800/50">
              {[
                {
                  num: "01",
                  title: "Brand Strategy & Identity",
                  desc: "Positioning, visual systems, and messaging that actually differentiates. We build brands that earn attention instead of begging for it.",
                },
                {
                  num: "02",
                  title: "Digital Experience Design",
                  desc: "Websites and applications that convert. Clean, fast, accessible. No bloat, no dark patterns.",
                },
                {
                  num: "03",
                  title: "Content & Distribution",
                  desc: "Strategic content that travels. We create what you need to reach customers wherever they are.",
                },
                {
                  num: "04",
                  title: "Performance Marketing",
                  desc: "Paid acquisition with real attribution. We care about ROAS, not vanity metrics.",
                },
              ].map((service, i) => (
                <motion.div
                  key={service.num}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.08 }}
                  className="group py-8 first:pt-0 last:pb-0"
                >
                  <div className="flex items-start gap-6">
                    <span className="text-[11px] font-mono text-zinc-700 pt-1">{service.num}</span>
                    <div>
                      <h3 className="text-lg font-medium mb-2 group-hover:text-white transition-colors">
                        {service.title}
                      </h3>
                      <p className="text-sm text-zinc-500 leading-relaxed">
                        {service.desc}
                      </p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Demo Carousel Section */}
      <section id="demos" className="relative z-10 py-24 px-6 lg:px-12 border-t border-zinc-900">
        <div className="max-w-6xl mx-auto">
          <div className="mb-12">
            <span className="text-[11px] font-medium uppercase tracking-[0.3em] text-zinc-600 block mb-4">
              Demos
            </span>
            <h2 className="text-3xl md:text-4xl font-semibold tracking-tight">
              See it in motion.
            </h2>
          </div>
          <DemoCarousel />
        </div>
      </section>

      {/* Contact - Minimal, direct */}
      <section id="contact" className="relative z-10 py-24 px-6 lg:px-12 border-t border-zinc-900">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-semibold tracking-tight mb-6">
            Ready to cut through the noise?
          </h2>
          <p className="text-zinc-500 mb-12 leading-relaxed">
            We take on a limited number of projects each quarter. If you have something interesting brewing, let&apos;s talk.
          </p>

          <a
            href="mailto:airadar.team@gmail.com"
            className="inline-flex items-center gap-3 px-8 py-4 bg-white text-zinc-950 text-sm font-medium rounded-lg hover:bg-zinc-100 transition-colors"
          >
            airadar.team@gmail.com
            <ArrowRight className="w-4 h-4" />
          </a>
        </div>
      </section>

      {/* Footer - Minimal */}
      <footer className="relative z-10 py-12 px-6 lg:px-12 border-t border-zinc-900">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <div className="w-7 h-7 rounded bg-zinc-800 border border-white/10 flex items-center justify-center">
              <Broadcast className="w-3.5 h-3.5 text-zinc-500" weight="duotone" />
            </div>
            <span className="text-sm font-medium text-zinc-500">RADAR AI</span>
          </div>

          <p className="text-xs text-zinc-600">
            AI-Powered Creative Marketing for Visionary Brands.
          </p>

          <div className="flex items-center gap-6">
            <span className="inline-flex items-center gap-2 px-2.5 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded text-[10px] text-emerald-400 uppercase tracking-wider">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Active
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
}