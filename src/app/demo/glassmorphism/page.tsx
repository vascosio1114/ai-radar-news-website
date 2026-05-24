'use client';

import { motion, useScroll, useTransform } from 'framer-motion';
import { useRef } from 'react';
import {
  Search,
  Bell,
  Zap,
  TrendingUp,
  Users,
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
  BriefcaseIcon,
  ChartLineIcon,
  DollarSignIcon,
  Play,
  Layers,
  Cpu,
  Database,
  Lock,
  BarChart3,
  Bot,
} from 'lucide-react';

// ============================================================
// GLASSMORPHISM DEMO PAGE — AI Radar
// ============================================================

export default function GlassDemoPage() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll();

  const heroOpacity = useTransform(scrollYProgress, [0, 0.15], [1, 0]);
  const heroScale = useTransform(scrollYProgress, [0, 0.15], [1, 0.95]);
  const globeY = useTransform(scrollYProgress, [0, 0.2], [0, -80]);

  const statsItems = [
    { icon: Briefcase, value: '1,892', label: 'Jobs displaced today', delta: '+1,892', deltaColor: 'text-red-400', bgColor: 'bg-amber-500/20', iconColor: 'text-amber-400' },
    { icon: Zap, value: '247', label: 'AI news stories', delta: 'Updated 2m ago', deltaColor: 'text-emerald-400', bgColor: 'bg-cyan-500/20', iconColor: 'text-cyan-400' },
    { icon: TrendingUp, value: '89', label: 'Cos moving fast', delta: '+12 this week', deltaColor: 'text-violet-400', bgColor: 'bg-violet-500/20', iconColor: 'text-violet-400' },
    { icon: Users, value: '2.4M', label: 'Subscribers', delta: '+18K today', deltaColor: 'text-rose-400', bgColor: 'bg-rose-500/20', iconColor: 'text-rose-400' },
  ];

  const riskItems = [
    { icon: Shield, title: 'Graphic Design', risk: 'HIGH RISK', percent: '87%', color: '#EF4444', barWidth: '87%' },
    { icon: BookOpen, title: 'Content Writing', risk: 'HIGH RISK', percent: '82%', color: '#EF4444', barWidth: '82%' },
    { icon: Briefcase, title: 'Legal Services', risk: 'MEDIUM', percent: '64%', color: '#FBBF24', barWidth: '64%' },
    { icon: CheckCircle, title: 'Project Mgmt', risk: 'LOW RISK', percent: '23%', color: '#10B981', barWidth: '23%' },
    { icon: AlertTriangle, title: 'Software Dev', risk: 'MEDIUM', percent: '51%', color: '#FBBF24', barWidth: '51%' },
    { icon: TrendingDown, title: 'Data Analysis', risk: 'HIGH RISK', percent: '78%', color: '#EF4444', barWidth: '78%' },
  ];

  const feedItems = [
    { time: '2 mins ago', headline: 'OpenAI announces GPT-5 with full autonomous agent capabilities', source: 'OpenAI', accentColor: 'from-emerald-400 to-teal-500' },
    { time: '15 mins ago', headline: 'Shopify replaces 1,400 customer support roles with AI chatbots', source: 'Shopify', accentColor: 'from-violet-400 to-purple-500' },
    { time: '32 mins ago', headline: 'Anthropic releases Claude 4 with 1M token context window', source: 'Anthropic', accentColor: 'from-amber-400 to-orange-500' },
    { time: '1 hour ago', headline: 'Microsoft laid off 2,500 more workers as AI automation accelerates', source: 'Microsoft', accentColor: 'from-blue-400 to-indigo-500' },
    { time: '2 hours ago', headline: 'Google DeepMind achieves breakthrough in scientific research AI', source: 'Google', accentColor: 'from-cyan-400 to-blue-500' },
  ];

  const trendingTools = [
    { rank: 1, name: 'ChatGPT', category: 'AI Assistant', rating: 4.9, users: '180M+', color: '#10B981' },
    { rank: 2, name: 'Midjourney', category: 'Image Generation', rating: 4.8, users: '15M+', color: '#8B5CF6' },
    { rank: 3, name: 'Copilot', category: 'Code AI', rating: 4.7, users: '50M+', color: '#6366F1' },
    { rank: 4, name: 'Claude', category: 'AI Assistant', rating: 4.9, users: '10M+', color: '#F59E0B' },
    { rank: 5, name: 'Gemini', category: 'AI Assistant', rating: 4.6, users: '20M+', color: '#3B82F6' },
  ];

  const features = [
    { icon: Bot, title: 'AI Agent Tracking', desc: 'Monitor which roles AI is automating in real-time', gradient: 'from-violet-500/30 to-purple-500/30' },
    { icon: BarChart3, title: 'Impact Analytics', desc: 'Visualize job displacement trends across industries', gradient: 'from-cyan-500/30 to-blue-500/30' },
    { icon: Database, title: 'Real-time Feed', desc: 'Breaking news on AI deployments and layoffs', gradient: 'from-amber-500/30 to-orange-500/30' },
    { icon: Lock, title: 'Career Defense', desc: 'Actionable strategies to stay ahead of automation', gradient: 'from-emerald-500/30 to-teal-500/30' },
  ];

  return (
    <div ref={containerRef} className="min-h-screen bg-[#030508] text-white overflow-x-hidden">
      {/* Ambient background */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-br from-violet-950/40 via-transparent to-cyan-950/40" />
        <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-violet-600/20 rounded-full blur-[150px]" />
        <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-cyan-600/15 rounded-full blur-[120px]" />
        <div className="absolute top-1/2 right-1/3 w-[400px] h-[400px] bg-amber-600/10 rounded-full blur-[100px]" />
      </div>

      {/* Noise texture overlay */}
      <div className="fixed inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 256 256\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'n\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.9\' numOctaves=\'4\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23n)\'/%3E%3C/svg%3E")' }} />

      {/* Navigation */}
      <nav className="relative z-50 flex items-center justify-between px-6 md:px-10 py-4">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex items-center gap-3"
        >
          <div className="relative">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-cyan-500 flex items-center justify-center shadow-lg shadow-violet-500/25">
              <Globe className="w-5 h-5 text-white" />
            </div>
            <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-violet-500 to-cyan-500 blur-md opacity-50 -z-10" />
          </div>
          <div>
            <h1 className="text-lg font-bold tracking-tight">AI RADAR</h1>
            <p className="text-[10px] text-white/40 uppercase tracking-widest">Stay Ahead</p>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="hidden md:flex items-center gap-8"
        >
          {['Feed', 'Industries', 'Tools', 'Companies'].map((item, i) => (
            <a
              key={item}
              href="#"
              className="relative text-sm text-white/60 hover:text-white transition-colors group"
            >
              {item}
              <span className="absolute -bottom-1 left-0 w-0 h-[1px] bg-gradient-to-r from-violet-500 to-cyan-500 transition-all duration-300 group-hover:w-full" />
            </a>
          ))}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex items-center gap-3"
        >
          <button className="p-2 rounded-xl text-white/40 hover:text-white hover:bg-white/5 transition">
            <Search className="w-[18px] h-[18px]" />
          </button>
          <button className="p-2 rounded-xl text-white/40 hover:text-white hover:bg-white/5 transition relative">
            <Bell className="w-[18px] h-[18px]" />
            <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-rose-500 rounded-full" />
          </button>
          <button className="px-4 py-2 bg-gradient-to-r from-violet-500 to-cyan-500 rounded-full text-sm font-medium hover:shadow-lg hover:shadow-violet-500/30 transition-shadow">
            Subscribe
          </button>
        </motion.div>
      </nav>

      {/* Hero Section */}
      <motion.section
        style={{ opacity: heroOpacity, scale: heroScale }}
        className="relative z-10 px-6 md:px-10 pt-8 pb-16"
      >
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left: Hero Text */}
            <div className="space-y-8">
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="space-y-4"
              >
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/[0.03] border border-white/[0.08] backdrop-blur-xl">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="text-xs text-white/60">Live tracking · Updated 2 mins ago</span>
                </div>

                <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-[1.1] tracking-tight">
                  AI is replacing people{' '}
                  <span className="bg-gradient-to-r from-violet-400 via-cyan-400 to-emerald-400 text-transparent bg-clip-text">
                    faster than you think.
                  </span>
                </h1>

                <p className="text-lg text-white/50 max-w-lg">
                  Real-time intelligence on AI job displacement, company moves, and the tools reshaping the workforce.
                </p>
              </motion.div>

              {/* Stats Grid */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="grid grid-cols-2 gap-3"
              >
                {statsItems.map((stat, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 + i * 0.08 }}
                    className="group relative overflow-hidden rounded-2xl p-4 backdrop-blur-xl border border-white/[0.06] bg-gradient-to-br from-white/[0.04] to-white/[0.01] hover:border-white/10 transition-colors"
                  >
                    <div className="absolute inset-0 bg-gradient-to-br from-white/[0.03] to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                    <div className="relative">
                      <div className={`w-10 h-10 rounded-xl ${stat.bgColor} flex items-center justify-center mb-3`}>
                        <stat.icon className={`w-5 h-5 ${stat.iconColor}`} />
                      </div>
                      <p className="text-2xl md:text-3xl font-bold tracking-tight">{stat.value}</p>
                      <p className="text-sm text-white/40 mt-1">{stat.label}</p>
                      <p className={`text-xs mt-2 ${stat.deltaColor}`}>{stat.delta}</p>
                    </div>
                  </motion.div>
                ))}
              </motion.div>

              {/* CTA Buttons */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                className="flex flex-wrap items-center gap-4"
              >
                <button className="group relative px-6 py-3 rounded-full bg-gradient-to-r from-violet-500 to-cyan-500 font-medium text-sm overflow-hidden">
                  <span className="absolute inset-0 bg-gradient-to-r from-violet-400 to-cyan-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                  <span className="relative flex items-center gap-2">
                    Start Free Trial
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                  </span>
                </button>
                <button className="group relative px-6 py-3 rounded-full border border-white/20 font-medium text-sm text-white/70 hover:text-white hover:border-white/30 transition-colors overflow-hidden">
                  <span className="absolute inset-0 bg-white/[0.05] opacity-0 group-hover:opacity-100 transition-opacity" />
                  <span className="relative flex items-center gap-2">
                    <Play className="w-4 h-4" />
                    Watch Demo
                  </span>
                </button>
              </motion.div>
            </div>

            {/* Right: Abstract Globe Visualization */}
            <motion.div
              style={{ y: globeY }}
              className="relative hidden lg:block h-[520px]"
            >
              {/* Central orb */}
              <div className="absolute inset-0 flex items-center justify-center">
                <motion.div
                  animate={{
                    scale: [1, 1.05, 1],
                    rotate: [0, 180, 360],
                  }}
                  transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
                  className="w-64 h-64 rounded-full bg-gradient-to-br from-violet-500/30 via-cyan-500/20 to-transparent blur-3xl"
                />
              </div>

              {/* Floating orbs */}
              {[...Array(6)].map((_, i) => (
                <motion.div
                  key={i}
                  animate={{
                    y: [-20, 20, -20],
                    opacity: [0.3, 0.6, 0.3],
                  }}
                  transition={{
                    duration: 3 + i,
                    repeat: Infinity,
                    ease: 'easeInOut',
                    delay: i * 0.5,
                  }}
                  className={`absolute w-${12 + i * 4} h-${12 + i * 4} rounded-full bg-gradient-to-br ${
                    i % 3 === 0 ? 'from-violet-500/40 to-transparent' :
                    i % 3 === 1 ? 'from-cyan-500/40 to-transparent' :
                    'from-amber-500/40 to-transparent'
                  } blur-xl`}
                  style={{
                    left: `${15 + i * 12}%`,
                    top: `${10 + (i % 3) * 25}%`,
                    width: 48 + i * 16,
                    height: 48 + i * 16,
                  }}
                />
              ))}

              {/* Central globe */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 30, repeat: Infinity, ease: 'linear' }}
                  className="relative w-48 h-48"
                >
                  {/* Outer ring */}
                  <div className="absolute inset-0 rounded-full border border-violet-500/20" />
                  <div className="absolute inset-2 rounded-full border border-cyan-500/20" />
                  <div className="absolute inset-4 rounded-full border border-emerald-500/20" />

                  {/* Core */}
                  <div className="absolute inset-8 rounded-full bg-gradient-to-br from-violet-500/40 to-cyan-500/40 backdrop-blur-xl border border-white/10">
                    <div className="absolute inset-0 rounded-full bg-gradient-to-br from-violet-600/50 to-transparent" />
                    <div className="absolute top-3 left-1/2 -translate-x-1/2 w-2 h-2 rounded-full bg-white/80" />
                    <div className="absolute bottom-1/3 right-1/4 w-1 h-1 rounded-full bg-white/60" />
                    <div className="absolute bottom-1/2 left-1/4 w-1.5 h-1.5 rounded-full bg-white/40" />
                  </div>
                </motion.div>
              </div>

              {/* Data points floating around */}
              {[...Array(8)].map((_, i) => (
                <motion.div
                  key={i}
                  animate={{
                    y: [-30, 30, -30],
                    x: [-15, 15, -15],
                    opacity: [0.2, 0.5, 0.2],
                  }}
                  transition={{
                    duration: 4 + i * 0.5,
                    repeat: Infinity,
                    ease: 'easeInOut',
                    delay: i * 0.3,
                  }}
                  className="absolute w-2 h-2 rounded-full"
                  style={{
                    left: `${20 + (i % 4) * 18}%`,
                    top: `${15 + Math.floor(i / 4) * 60}%`,
                    backgroundColor: i % 2 === 0 ? '#8B5CF6' : '#06B6D4',
                    boxShadow: i % 2 === 0 ? '0 0 12px #8B5CF6' : '0 0 12px #06B6D4',
                  }}
                />
              ))}

              {/* Glow effect */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-gradient-to-br from-violet-500/10 to-cyan-500/10 rounded-full blur-3xl" />
            </motion.div>
          </div>
        </div>
      </motion.section>

      {/* Main Content */}
      <section className="relative z-20 px-6 md:px-10 pb-20">
        <div className="max-w-7xl mx-auto space-y-8">

          {/* Dashboard Grid */}
          <div className="grid lg:grid-cols-3 gap-6">

            {/* Live AI Feed - Glass Card */}
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="lg:col-span-2 rounded-3xl backdrop-blur-xl border border-white/[0.06] bg-gradient-to-b from-white/[0.05] to-transparent overflow-hidden"
            >
              <div className="px-6 py-5 border-b border-white/[0.06] flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="relative flex h-3 w-3">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75" />
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-rose-500" />
                  </span>
                  <h2 className="text-lg font-semibold tracking-tight">LIVE AI FEED</h2>
                </div>
                <span className="text-xs text-white/40 uppercase tracking-widest">Real-time</span>
              </div>

              <div className="p-4 space-y-3">
                {feedItems.map((item, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.08 }}
                    className="group flex items-start gap-4 p-4 rounded-2xl bg-white/[0.02] hover:bg-white/[0.05] border border-transparent hover:border-white/[0.06] transition-all cursor-pointer"
                  >
                    <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${item.accentColor} flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform`}>
                      <Bot className="w-6 h-6 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs text-white/40">{item.time}</span>
                        <span className="text-xs text-white/20">·</span>
                        <span className="text-xs text-white/50">{item.source}</span>
                      </div>
                      <p className="text-sm font-medium leading-snug group-hover:text-white transition-colors">{item.headline}</p>
                    </div>
                    <ChevronRight className="w-5 h-5 text-white/20 group-hover:text-white/60 group-hover:translate-x-1 transition-all shrink-0 mt-2" />
                  </motion.div>
                ))}
              </div>

              <div className="px-6 py-4 border-t border-white/[0.06]">
                <button className="w-full py-3 rounded-xl text-sm text-white/50 hover:text-white bg-white/[0.03] hover:bg-white/[0.06] border border-white/[0.06] hover:border-white/[0.1] transition-all flex items-center justify-center gap-2">
                  View all updates
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </motion.div>

            {/* AI Risk Dashboard - Glass Card */}
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="rounded-3xl backdrop-blur-xl border border-white/[0.06] bg-gradient-to-b from-white/[0.05] to-transparent overflow-hidden"
            >
              <div className="px-6 py-5 border-b border-white/[0.06]">
                <div className="flex items-center gap-3">
                  <span className="w-3 h-3 rounded-full bg-amber-400" />
                  <h2 className="text-lg font-semibold tracking-tight">RISK INDEX</h2>
                </div>
              </div>

              <div className="p-4 space-y-4">
                {riskItems.map((item, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 10 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.06 }}
                    className="space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <item.icon className="w-4 h-4" style={{ color: item.color }} />
                        <span className="text-sm font-medium">{item.title}</span>
                      </div>
                      <span className="text-xs font-semibold" style={{ color: item.color }}>{item.percent}</span>
                    </div>
                    <div className="h-1.5 rounded-full bg-white/[0.06] overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        whileInView={{ width: item.barWidth }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.3 + i * 0.1, duration: 0.8, ease: 'easeOut' }}
                        className="h-full rounded-full"
                        style={{ backgroundColor: item.color }}
                      />
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>

          {/* Features Section */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="py-8"
          >
            <div className="text-center mb-10">
              <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4">
                Everything you need to{' '}
                <span className="bg-gradient-to-r from-violet-400 to-cyan-400 text-transparent bg-clip-text">stay ahead</span>
              </h2>
              <p className="text-white/50 max-w-xl mx-auto">Powerful tools and insights to track AI&apos;s impact on jobs and make informed career decisions.</p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
              {features.map((feature, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="group relative p-6 rounded-3xl backdrop-blur-xl border border-white/[0.06] bg-gradient-to-br from-white/[0.04] to-transparent overflow-hidden hover:border-white/[0.1] transition-colors"
                >
                  <div className={`absolute inset-0 bg-gradient-to-br ${feature.gradient} opacity-0 group-hover:opacity-100 transition-opacity`} />
                  <div className="relative">
                    <div className="w-12 h-12 rounded-2xl bg-white/[0.06] flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                      <feature.icon className="w-6 h-6 text-violet-400" />
                    </div>
                    <h3 className="text-base font-semibold mb-2">{feature.title}</h3>
                    <p className="text-sm text-white/50 leading-relaxed">{feature.desc}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Trending Tools & Companies Grid */}
          <div className="grid lg:grid-cols-2 gap-6">

            {/* Trending AI Tools */}
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="rounded-3xl backdrop-blur-xl border border-white/[0.06] bg-gradient-to-b from-white/[0.05] to-transparent overflow-hidden"
            >
              <div className="px-6 py-5 border-b border-white/[0.06] flex items-center gap-3">
                <span className="w-3 h-3 rounded-full bg-emerald-400" />
                <h2 className="text-lg font-semibold tracking-tight">TRENDING AI TOOLS</h2>
              </div>

              <div className="p-4 space-y-3">
                {trendingTools.map((tool, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: 20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.08 }}
                    className="group flex items-center gap-4 p-4 rounded-2xl bg-white/[0.02] hover:bg-white/[0.05] border border-transparent hover:border-white/[0.06] transition-all cursor-pointer"
                  >
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold"
                      style={{ backgroundColor: `${tool.color}20`, color: tool.color }}
                    >
                      {tool.rank}
                    </div>
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-white/10 to-white/5 flex items-center justify-center">
                      <Cpu className="w-6 h-6 text-white/60" />
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold">{tool.name}</p>
                      <p className="text-xs text-white/40">{tool.category}</p>
                    </div>
                    <div className="text-right">
                      <div className="flex items-center gap-1 text-amber-400 text-sm">
                        <Star className="w-4 h-4 fill-amber-400" />
                        {tool.rating}
                      </div>
                      <p className="text-xs text-white/40 mt-1">{tool.users} users</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            {/* AI Companies War */}
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="rounded-3xl backdrop-blur-xl border border-white/[0.06] bg-gradient-to-b from-white/[0.05] to-transparent overflow-hidden"
            >
              <div className="px-6 py-5 border-b border-white/[0.06] flex items-center gap-3">
                <Layers className="w-5 h-5 text-violet-400" />
                <h2 className="text-lg font-semibold tracking-tight">AI COMPANIES WAR</h2>
              </div>

              <div className="p-4 space-y-3">
                {[
                  { name: 'OpenAI', model: 'GPT-5', cap: '$300B', color: '#10B981' },
                  { name: 'Anthropic', model: 'Claude 4', cap: '$85B', color: '#F59E0B' },
                  { name: 'Google DeepMind', model: 'Gemini 2', cap: '$180B', color: '#6366F1' },
                  { name: 'Microsoft', model: 'Copilot AI', cap: '$290B', color: '#3B82F6' },
                  { name: 'Meta AI', model: 'Llama 4', cap: '$140B', color: '#8B5CF6' },
                ].map((company, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: 20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.08 }}
                    className="group flex items-center gap-4 p-4 rounded-2xl bg-white/[0.02] hover:bg-white/[0.05] border border-transparent hover:border-white/[0.06] transition-all cursor-pointer"
                  >
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center"
                      style={{ backgroundColor: `${company.color}20` }}
                    >
                      <div className="w-4 h-4 rounded" style={{ backgroundColor: company.color }} />
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold">{company.name}</p>
                      <p className="text-xs text-white/40">Latest: {company.model}</p>
                    </div>
                    <p className="text-lg font-bold" style={{ color: company.color }}>{company.cap}</p>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>

          {/* Newsletter CTA - Glass Card */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="relative overflow-hidden rounded-3xl backdrop-blur-xl border border-white/[0.06] bg-gradient-to-r from-violet-500/10 via-cyan-500/10 to-emerald-500/10"
          >
            {/* Background effects */}
            <div className="absolute inset-0 bg-gradient-to-br from-violet-500/5 to-cyan-500/5" />
            <div className="absolute top-0 right-0 w-80 h-80 bg-violet-500/10 rounded-full blur-3xl" />
            <div className="absolute bottom-0 left-0 w-80 h-80 bg-cyan-500/10 rounded-full blur-3xl" />

            <div className="relative px-8 py-10 flex flex-col md:flex-row items-center justify-between gap-8">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-violet-500/30 to-cyan-500/30 backdrop-blur-xl border border-white/10 flex items-center justify-center">
                  <Mail className="w-7 h-7 text-violet-400" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold tracking-tight">Get the Daily AI Brief</h3>
                  <p className="text-white/50">Stay informed, stay ahead. No spam, unsubscribe anytime.</p>
                </div>
              </div>
              <div className="flex items-center gap-3 w-full md:w-auto">
                <input
                  type="email"
                  placeholder="Enter your email"
                  className="flex-1 md:w-72 px-5 py-3 rounded-full bg-white/[0.05] border border-white/[0.1] backdrop-blur-xl text-white placeholder:text-white/40 focus:outline-none focus:border-violet-500/50 focus:bg-white/[0.08] transition-colors"
                />
                <button className="px-6 py-3 rounded-full bg-gradient-to-r from-violet-500 to-cyan-500 font-medium text-sm whitespace-nowrap hover:shadow-lg hover:shadow-violet-500/20 transition-shadow">
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
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-500 to-cyan-500 flex items-center justify-center">
                  <Globe className="w-4 h-4 text-white" />
                </div>
                <span className="font-bold">AI RADAR</span>
              </div>
              <p className="text-sm text-white/40">Stay ahead or get replaced.</p>
            </div>
            {[
              { title: 'Platform', links: ['Features', 'Pricing', 'API'] },
              { title: 'Resources', links: ['Blog', 'Newsletter', 'Guides'] },
              { title: 'Legal', links: ['Privacy', 'Terms', 'Cookies'] },
              { title: 'Follow', links: ['Twitter', 'LinkedIn', 'Discord'] },
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
            <p className="text-sm text-white/30">2024 AI Radar. All rights reserved.</p>
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