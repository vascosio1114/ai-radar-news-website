'use client';

import { useRef, useEffect, useState } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import {
  Search,
  Bell,
  ArrowRight,
  ChevronRight,
  Star,
  Globe,
  Shield,
  AlertTriangle,
  CheckCircle,
  Briefcase,
  BookOpen,
  TrendingDown,
  Mail,
  Twitter,
  Linkedin,
  Disc,
  Cpu,
  Zap,
  Network,
  Lock,
  BarChart3,
  Bot,
  Hexagon,
  Layers,
  Terminal,
  Activity,
  Crosshair,
  TrendingUp,
  Users,
  Globe2,
} from 'lucide-react';

// ============================================================
// HIGH-TECH SAAS — AI Radar
// Sharp geometric aesthetic: circuit patterns, node networks,
// electric cyan accents, precise grid layouts
// ============================================================

export default function HighTechDemoPage() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll();

  const heroY = useTransform(scrollYProgress, [0, 0.2], [0, -50]);

  const [nodes, setNodes] = useState<{ id: number; x: number; y: number; connections: number[] }[]>([]);
  const [activeNode, setActiveNode] = useState(0);

  // Generate network nodes
  useEffect(() => {
    const generateNodes = () => {
      const newNodes = Array.from({ length: 24 }, (_, i) => ({
        id: i,
        x: Math.random() * 100,
        y: Math.random() * 100,
        connections: Array.from({ length: Math.floor(Math.random() * 3) }, () => Math.floor(Math.random() * 24)),
      }));
      setNodes(newNodes);
    };
    generateNodes();
  }, []);

  // Cycle active node
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveNode((prev) => (prev + 1) % 24);
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  const metrics = [
    { label: 'Jobs Automated', value: '1,892', delta: '+12%', positive: false, icon: Briefcase },
    { label: 'News Tracked', value: '14,234', delta: '+8%', positive: true, icon: Network },
    { label: 'Companies', value: '847', delta: '+23', positive: true, icon: Layers },
    { label: 'Displacement Events', value: '3,421', delta: '+18%', positive: false, icon: TrendingDown },
  ];

  const sectors = [
    { name: 'Customer Support', risk: 94, status: 'CRITICAL', color: '#ef4444' },
    { name: 'Content Writing', risk: 89, status: 'HIGH', color: '#f97316' },
    { name: 'Legal Research', risk: 76, status: 'HIGH', color: '#f97316' },
    { name: 'Data Analysis', risk: 71, status: 'ELEVATED', color: '#eab308' },
    { name: 'Graphic Design', risk: 58, status: 'MODERATE', color: '#22c55e' },
    { name: 'Project Management', risk: 31, status: 'LOW', color: '#06b6d4' },
  ];

  const feedItems = [
    { time: '2m ago', source: 'OPENAI', headline: 'GPT-5 autonomous agents displace 1,400 Shopify support roles', critical: true },
    { time: '15m ago', source: 'ANTHROPIC', headline: 'Claude 4 breaks 1M token context barrier — full document analysis now standard', critical: false },
    { time: '32m ago', source: 'MSFT', headline: 'Microsoft cuts 2,500 middle-management positions amid Copilot rollout', critical: true },
    { time: '1h ago', source: 'DEEPMIND', headline: 'AlphaFold 4 enables fully autonomous scientific discovery pipeline', critical: false },
    { time: '2h ago', source: 'META', headline: 'Llama 4 open-sourced — local deployment now viable for enterprise', critical: false },
  ];

  const tools = [
    { name: 'ChatGPT', type: 'AI Assistant', impact: 98, users: '180M', color: '#10B981' },
    { name: 'Midjourney', type: 'Image Gen', impact: 91, users: '15M', color: '#8B5CF6' },
    { name: 'Copilot', type: 'Code AI', impact: 89, users: '50M', color: '#6366F1' },
    { name: 'Claude', type: 'AI Assistant', impact: 94, users: '10M', color: '#F59E0B' },
    { name: 'Gemini', type: 'AI Assistant', impact: 87, users: '20M', color: '#3B82F6' },
  ];

  return (
    <div ref={containerRef} className="min-h-screen bg-[#020209] text-white overflow-x-hidden">

      {/* Background: Circuit Grid Pattern */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        {/* Grid lines */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `
              linear-gradient(rgba(6,182,212,0.5) 1px, transparent 1px),
              linear-gradient(90deg, rgba(6,182,212,0.5) 1px, transparent 1px)
            `,
            backgroundSize: '60px 60px',
          }}
        />
        {/* Radial glow top */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[600px] bg-gradient-to-b from-cyan-500/10 to-transparent" />
        {/* Circuit traces decoration */}
        <svg className="absolute inset-0 w-full h-full opacity-[0.04]">
          <pattern id="circuit" patternUnits="userSpaceOnUse" width="100" height="100">
            <path d="M0 50 H30 V30 H50 V70 H70 V50 H100" fill="none" stroke="rgba(6,182,212,0.5)" strokeWidth="0.5"/>
            <circle cx="30" cy="30" r="2" fill="none" stroke="rgba(6,182,212,0.5)" strokeWidth="0.5"/>
            <circle cx="50" cy="70" r="2" fill="none" stroke="rgba(6,182,212,0.5)" strokeWidth="0.5"/>
            <circle cx="70" cy="50" r="2" fill="none" stroke="rgba(6,182,212,0.5)" strokeWidth="0.5"/>
          </pattern>
          <rect width="100%" height="100%" fill="url(#circuit)" />
        </svg>
      </div>

      {/* Navigation */}
      <nav className="relative z-50 flex items-center justify-between px-6 md:px-10 py-4 border-b border-white/5">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex items-center gap-4"
        >
          <div className="relative flex items-center justify-center w-10 h-10">
            <Hexagon className="w-8 h-8 text-cyan-400" strokeWidth={1.5} />
            <Globe2 className="absolute w-4 h-4 text-cyan-400" />
          </div>
          <div>
            <h1 className="text-base font-semibold tracking-tight">AI RADAR</h1>
            <p className="text-[10px] text-cyan-400/60 uppercase tracking-widest">Threat Intelligence</p>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="hidden md:flex items-center gap-1"
        >
          {['Feed', 'Sectors', 'Companies', 'Analytics'].map((item, i) => (
            <a
              key={item}
              href="#"
              className="px-4 py-2 text-sm text-white/50 hover:text-white hover:bg-white/5 rounded-lg transition-colors"
            >
              {item}
            </a>
          ))}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex items-center gap-2"
        >
          <button className="p-2 rounded-lg text-white/40 hover:text-white hover:bg-white/5 transition">
            <Search className="w-[18px] h-[18px]" />
          </button>
          <button className="p-2 rounded-lg text-white/40 hover:text-white hover:bg-white/5 transition relative">
            <Bell className="w-[18px] h-[18px]" />
            <span className="absolute top-1 right-1 w-1.5 h-1.5 bg-cyan-400 rounded-full" />
          </button>
          <button className="px-4 py-2 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-lg text-sm font-medium text-black">
            Subscribe
          </button>
        </motion.div>
      </nav>

      {/* Hero Section */}
      <motion.section style={{ y: heroY }} className="relative z-10 px-6 md:px-10 pt-12 pb-16">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">

            {/* Left: Content */}
            <div className="space-y-8">
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="space-y-6"
              >
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-cyan-400/10 border border-cyan-400/20">
                  <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
                  <span className="text-xs text-cyan-400 uppercase tracking-widest">Real-time Threat Detection</span>
                </div>

                <h1 className="text-4xl md:text-5xl font-bold leading-[1.1] tracking-tight">
                  Track AI&apos;s Impact on Your{' '}
                  <span className="relative">
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-400">Industry</span>
                    <svg className="absolute -bottom-1 left-0 w-full" viewBox="0 0 200 12" fill="none">
                      <motion.path
                        d="M2 8 C50 2, 150 2, 198 8"
                        stroke="url(#underline)"
                        strokeWidth="3"
                        strokeLinecap="round"
                        initial={{ pathLength: 0 }}
                        animate={{ pathLength: 1 }}
                        transition={{ duration: 1, delay: 0.5 }}
                      />
                      <defs>
                        <linearGradient id="underline" x1="0" y1="0" x2="1" y2="0">
                          <stop offset="0%" stopColor="#06B6D4" />
                          <stop offset="100%" stopColor="#3B82F6" />
                        </linearGradient>
                      </defs>
                    </svg>
                  </span>
                </h1>

                <p className="text-lg text-white/50 max-w-lg leading-relaxed">
                  Monitor AI displacement events across 847 companies and 2,400+ job roles. Get actionable intelligence before automation reaches your sector.
                </p>
              </motion.div>

              {/* Metrics Row */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="grid grid-cols-2 lg:grid-cols-4 gap-3"
              >
                {metrics.map((metric, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 + i * 0.08 }}
                    className="group relative p-4 bg-white/[0.03] border border-white/[0.06] hover:border-cyan-400/30 transition-colors rounded-xl"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <metric.icon className="w-4 h-4 text-white/40" />
                      <span className={`text-xs font-medium ${metric.positive ? 'text-emerald-400' : 'text-rose-400'}`}>
                        {metric.delta}
                      </span>
                    </div>
                    <p className="text-2xl font-bold tracking-tight">{metric.value}</p>
                    <p className="text-xs text-white/40 mt-1">{metric.label}</p>
                  </motion.div>
                ))}
              </motion.div>

              {/* CTA */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                className="flex items-center gap-4"
              >
                <button className="group relative px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-xl font-medium text-sm overflow-hidden">
                  <span className="absolute inset-0 bg-gradient-to-r from-cyan-400 to-blue-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                  <span className="relative flex items-center gap-2 text-black">
                    Start Free Trial
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                  </span>
                </button>
                <button className="px-6 py-3 rounded-xl border border-white/10 text-sm text-white/70 hover:text-white hover:border-white/20 transition-colors">
                  View Demo
                </button>
              </motion.div>
            </div>

            {/* Right: Network Visualization */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="relative hidden lg:flex h-[480px]"
            >
              {/* Network nodes SVG */}
              <svg className="absolute inset-0 w-full h-full">
                {/* Connection lines */}
                {nodes.flatMap((node) =>
                  node.connections.slice(0, 2).map((targetId) => {
                    const target = nodes[targetId];
                    if (!target) return null;
                    return (
                      <motion.line
                        key={`${node.id}-${targetId}`}
                        x1={`${node.x}%`}
                        y1={`${node.y}%`}
                        x2={`${target.x}%`}
                        y2={`${target.y}%`}
                        stroke="rgba(6,182,212,0.15)"
                        strokeWidth="1"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 0.3 }}
                      />
                    );
                  })
                )}

                {/* Node points */}
                {nodes.map((node, i) => (
                  <motion.circle
                    key={node.id}
                    cx={`${node.x}%`}
                    cy={`${node.y}%`}
                    r={activeNode === node.id ? 8 : 4}
                    fill={activeNode === node.id ? '#06B6D4' : '#0ea5e9'}
                    initial={{ opacity: 0, scale: 0 }}
                    animate={{
                      opacity: activeNode === node.id ? 1 : 0.4,
                      scale: 1,
                    }}
                    transition={{ delay: i * 0.02 }}
                  />
                ))}
              </svg>

              {/* Central network hub */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 60, repeat: Infinity, ease: 'linear' }}
                  className="relative w-32 h-32"
                >
                  {/* Outer ring */}
                  <div className="absolute inset-0 border border-cyan-400/20 rounded-full" />
                  <div className="absolute inset-2 border border-cyan-400/15 rounded-full" />
                  <div className="absolute inset-4 border border-cyan-400/10 rounded-full" />

                  {/* Hexagon nodes on ring */}
                  {[0, 60, 120, 180, 240, 300].map((angle) => (
                    <motion.div
                      key={angle}
                      className="absolute w-3 h-3 bg-cyan-400"
                      style={{
                        top: '50%',
                        left: '50%',
                        transform: `rotate(${angle}deg) translateY(-52px) translateX(-50%)`,
                      }}
                      animate={{ opacity: [0.3, 1, 0.3] }}
                      transition={{
                        duration: 2,
                        repeat: Infinity,
                        delay: angle / 60,
                      }}
                    />
                  ))}
                </motion.div>

                {/* Center globe */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-16 h-16 rounded-full bg-gradient-to-br from-cyan-500/40 to-blue-500/40 backdrop-blur-xl border border-cyan-400/30 flex items-center justify-center">
                  <Network className="w-7 h-7 text-cyan-400" />
                </div>
              </div>

              {/* Glow effect */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-gradient-to-br from-cyan-500/10 to-blue-500/10 rounded-full blur-3xl" />

              {/* Floating data labels */}
              <div className="absolute top-8 left-8 px-3 py-1.5 bg-black/60 backdrop-blur-xl border border-white/10 rounded text-xs font-mono text-cyan-400">
                <span className="text-white/40">NET_STATUS:</span> ACTIVE
              </div>
              <div className="absolute bottom-12 right-8 px-3 py-1.5 bg-black/60 backdrop-blur-xl border border-white/10 rounded text-xs font-mono text-emerald-400">
                <span className="text-white/40">NODES:</span> 24/847
              </div>
            </motion.div>
          </div>
        </div>
      </motion.section>

      {/* Main Content */}
      <section className="relative z-20 px-6 md:px-10 pb-20">
        <div className="max-w-7xl mx-auto space-y-8">

          {/* Feed + Risk Grid */}
          <div className="grid lg:grid-cols-3 gap-6">

            {/* Live Feed */}
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="lg:col-span-2 bg-white/[0.02] border border-white/[0.06] overflow-hidden"
            >
              <div className="px-6 py-4 border-b border-white/[0.06] flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Activity className="w-4 h-4 text-cyan-400" />
                  <h2 className="font-semibold tracking-tight">LIVE DISPLACEMENT FEED</h2>
                </div>
                <div className="flex items-center gap-2">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75" />
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-400" />
                  </span>
                  <span className="text-xs text-white/40 uppercase tracking-widest">Live</span>
                </div>
              </div>

              <div className="divide-y divide-white/[0.04]">
                {feedItems.map((item, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.08 }}
                    className="group px-6 py-4 hover:bg-white/[0.02] transition-colors cursor-pointer flex items-start gap-4"
                  >
                    <div className={`w-10 h-10 shrink-0 rounded-lg flex items-center justify-center ${
                      item.critical
                        ? 'bg-rose-500/20 text-rose-400'
                        : 'bg-cyan-500/20 text-cyan-400'
                    }`}>
                      <Bot className="w-5 h-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-1">
                        <span className="text-[10px] font-mono text-cyan-400/70 tracking-widest">{item.source}</span>
                        <span className="text-[10px] text-white/20">·</span>
                        <span className="text-[10px] text-white/40">{item.time}</span>
                        {item.critical && (
                          <span className="text-[10px] px-1.5 py-0.5 bg-rose-500/20 text-rose-400 border border-rose-500/30">CRITICAL</span>
                        )}
                      </div>
                      <p className="text-sm leading-snug group-hover:text-white transition-colors">{item.headline}</p>
                    </div>
                    <ChevronRight className="w-5 h-5 text-white/20 group-hover:text-white/60 group-hover:translate-x-1 transition-all shrink-0 mt-1" />
                  </motion.div>
                ))}
              </div>

              <div className="px-6 py-4 border-t border-white/[0.06]">
                <button className="w-full py-2.5 text-sm text-white/40 hover:text-white bg-white/[0.02] hover:bg-white/[0.05] border border-white/[0.06] hover:border-white/[0.1] transition-all rounded-lg flex items-center justify-center gap-2">
                  View all events
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </motion.div>

            {/* Sector Risk Index */}
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="bg-white/[0.02] border border-white/[0.06] overflow-hidden"
            >
              <div className="px-6 py-4 border-b border-white/[0.06]">
                <div className="flex items-center gap-3">
                  <Crosshair className="w-4 h-4 text-cyan-400" />
                  <h2 className="font-semibold tracking-tight">SECTOR RISK INDEX</h2>
                </div>
              </div>

              <div className="p-4 space-y-4">
                {sectors.map((sector, i) => (
                  <motion.div
                    key={sector.name}
                    initial={{ opacity: 0, y: 10 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.06 }}
                    className="space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-sm">{sector.name}</span>
                      <div className="flex items-center gap-2">
                        <span
                          className="text-[10px] px-1.5 py-0.5 border"
                          style={{ color: sector.color, borderColor: `${sector.color}40` }}
                        >
                          {sector.status}
                        </span>
                        <span className="text-sm font-bold" style={{ color: sector.color }}>{sector.risk}%</span>
                      </div>
                    </div>
                    <div className="h-1 bg-white/[0.06] overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        whileInView={{ width: `${sector.risk}%` }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.2 + i * 0.1, duration: 0.8 }}
                        className="h-full"
                        style={{ backgroundColor: sector.color }}
                      />
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>

          {/* Tools Impact */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="bg-white/[0.02] border border-white/[0.06]"
          >
            <div className="px-6 py-4 border-b border-white/[0.06] flex items-center gap-3">
              <Cpu className="w-4 h-4 text-cyan-400" />
              <h2 className="font-semibold tracking-tight">AI TOOLS — DISPLACEMENT IMPACT</h2>
            </div>

            <div className="grid md:grid-cols-5 gap-4 p-6">
              {tools.map((tool, i) => (
                <motion.div
                  key={tool.name}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.08 }}
                  className="group relative p-4 bg-white/[0.02] border border-white/[0.06] hover:border-white/[0.1] transition-colors rounded-xl"
                >
                  <div
                    className="absolute top-0 right-0 w-16 h-16 rounded-bl-full opacity-10"
                    style={{ backgroundColor: tool.color }}
                  />
                  <div className="relative">
                    <div
                      className="w-10 h-10 rounded-lg flex items-center justify-center mb-3"
                      style={{ backgroundColor: `${tool.color}20` }}
                    >
                      <Cpu className="w-5 h-5" style={{ color: tool.color }} />
                    </div>
                    <p className="font-semibold mb-1">{tool.name}</p>
                    <p className="text-xs text-white/40 mb-3">{tool.type}</p>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1">
                        <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
                        <span className="text-xs">{tool.impact / 10}</span>
                      </div>
                      <span className="text-xs text-white/40">{tool.users}</span>
                    </div>
                    <div className="mt-3 h-1 bg-white/[0.06] overflow-hidden rounded-full">
                      <div
                        className="h-full rounded-full"
                        style={{ width: `${tool.impact}%`, backgroundColor: tool.color }}
                      />
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Newsletter */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="relative overflow-hidden bg-gradient-to-r from-cyan-500/10 via-transparent to-blue-500/10 border border-white/[0.06]"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/[0.03] to-blue-500/[0.03]" />
            <div className="absolute top-0 right-0 w-80 h-80 bg-cyan-500/10 rounded-full blur-3xl" />
            <div className="absolute bottom-0 left-0 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl" />

            <div className="relative px-8 py-10 flex flex-col md:flex-row items-center justify-between gap-8">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-cyan-500/30 to-blue-500/30 border border-cyan-400/30 flex items-center justify-center">
                  <Mail className="w-6 h-6 text-cyan-400" />
                </div>
                <div>
                  <h3 className="text-xl font-bold">Get the Daily Threat Brief</h3>
                  <p className="text-white/50 text-sm">Join 50,000+ professionals tracking AI displacement</p>
                </div>
              </div>
              <div className="flex items-center gap-3 w-full md:w-auto">
                <input
                  type="email"
                  placeholder="you@company.com"
                  className="flex-1 md:w-72 px-5 py-3 bg-white/[0.05] border border-white/[0.1] text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-cyan-400/50 transition-colors rounded-xl"
                />
                <button className="px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-xl font-medium text-sm text-black whitespace-nowrap">
                  Subscribe
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-20 border-t border-white/[0.06] px-6 md:px-10 py-12">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-8 mb-12">
            <div className="col-span-2 md:col-span-1">
              <div className="flex items-center gap-3 mb-4">
                <Hexagon className="w-6 h-6 text-cyan-400" strokeWidth={1.5} />
                <span className="font-semibold">AI RADAR</span>
              </div>
              <p className="text-sm text-white/40">Real-time intelligence on AI workforce displacement.</p>
            </div>
            {[
              { title: 'Product', links: ['Features', 'Pricing', 'API', 'Changelog'] },
              { title: 'Resources', links: ['Blog', 'Newsletter', 'Reports', 'Methodology'] },
              { title: 'Company', links: ['About', 'Careers', 'Press', 'Contact'] },
              { title: 'Legal', links: ['Privacy', 'Terms', 'Cookies'] },
            ].map((col, i) => (
              <div key={i}>
                <h4 className="font-semibold mb-4 text-sm">{col.title}</h4>
                <ul className="space-y-2">
                  {col.links.map((link) => (
                    <li key={link}>
                      <a href="#" className="text-sm text-white/40 hover:text-white transition-colors">
                        {link}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <div className="pt-8 border-t border-white/[0.06] flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-sm text-white/30">© 2024 AI Radar. All rights reserved.</p>
            <div className="flex items-center gap-4">
              <Twitter className="w-5 h-5 text-white/30 hover:text-white transition-colors cursor-pointer" />
              <Linkedin className="w-5 h-5 text-white/30 hover:text-white transition-colors cursor-pointer" />
              <Disc className="w-5 h-5 text-white/30 hover:text-white transition-colors cursor-pointer" />
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}