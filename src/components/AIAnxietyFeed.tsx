"use client";

import { useState, useEffect } from "react";

interface AIPost {
  id: string;
  source: string;
  content: string;
  timestamp: string;
  threatLevel: "low" | "medium" | "high" | "critical";
  category: string;
}

const threatConfig = {
  low: {
    border: "border-cyan-500/30",
    bg: "bg-cyan-500/5",
    text: "text-cyan-400",
    pulse: "shadow-[0_0_20px_rgba(0,240,255,0.2)]",
    label: "STABLE",
  },
  medium: {
    border: "border-amber-500/40",
    bg: "bg-amber-500/10",
    text: "text-amber-400",
    pulse: "shadow-[0_0_30px_rgba(255,149,0,0.3)]",
    label: "ELEVATED",
  },
  high: {
    border: "border-orange-500/50",
    bg: "bg-orange-500/15",
    text: "text-orange-400",
    pulse: "shadow-[0_0_40px_rgba(255,107,0,0.4)]",
    label: "HIGH",
  },
  critical: {
    border: "border-red-500/60",
    bg: "bg-red-500/20",
    text: "text-red-400",
    pulse: "shadow-[0_0_50px_rgba(255,45,85,0.5)]",
    label: "CRITICAL",
  },
};

function GlitchText({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  const [glitching, setGlitching] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      if (Math.random() > 0.85) {
        setGlitching(true);
        setTimeout(() => setGlitching(false), 100 + Math.random() * 150);
      }
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  return (
    <span
      className={`relative inline-block ${glitching ? "animate-glitch-skew" : ""} ${className}`}
      data-text={typeof children === "string" ? children : ""}
    >
      {children}
      {glitching && (
        <>
          <span className="absolute inset-0 text-red-500 opacity-70 animate-glitch-1" aria-hidden="true">
            {children}
          </span>
          <span className="absolute inset-0 text-cyan-500 opacity-70 animate-glitch-2" aria-hidden="true">
            {children}
          </span>
        </>
      )}
    </span>
  );
}

function ScanLines({ intensity = 0.3 }: { intensity?: number }) {
  return (
    <div
      className="pointer-events-none fixed inset-0 z-50 opacity-[var(--scan-intensity,0.3)]"
      style={{ "--scan-intensity": intensity } as React.CSSProperties}
    >
      <div
        className="absolute inset-0"
        style={{
          background: `repeating-linear-gradient(
            0deg,
            transparent,
            transparent 2px,
            rgba(0, 240, 255, 0.03) 2px,
            rgba(0, 240, 255, 0.03) 4px
          )`,
        }}
      />
      <div className="absolute inset-0 animate-scan-move" />
    </div>
  );
}

function NoiseOverlay({ intensity = 0.02 }: { intensity?: number }) {
  return (
    <div
      className="pointer-events-none fixed inset-0 z-40"
      style={{
        background: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
        opacity: intensity,
      }}
    />
  );
}

function ThreatBadge({ level }: { level: AIPost["threatLevel"] }) {
  const config = threatConfig[level];
  const [pulse, setPulse] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setPulse(true);
      setTimeout(() => setPulse(false), 200);
    }, level === "critical" ? 800 : level === "high" ? 1500 : 3000);
    return () => clearInterval(interval);
  }, [level]);

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2 py-0.5 text-[10px] font-mono tracking-wider ${config.bg} ${config.border} border ${config.text} ${pulse ? config.pulse : ""}`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${config.text} ${pulse ? "animate-ping" : ""}`} />
      {config.label}
    </span>
  );
}

function AIPostCard({ post, index }: { post: AIPost; index: number }) {
  const config = threatConfig[post.threatLevel];
  const [isHovered, setIsHovered] = useState(false);

  return (
    <article
      className={`relative overflow-hidden transition-all duration-300 ${config.bg} ${config.border} border-t-2 ${isHovered ? "scale-[1.02] shadow-2xl" : ""}`}
      style={{
        animationDelay: `${index * 150}ms`,
        animation: "fadeSlideIn 0.5s ease-out forwards",
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Corner accents */}
      <div className={`absolute top-0 left-0 w-4 h-4 ${config.border} border-t-2 border-l-2`} />
      <div className={`absolute top-0 right-0 w-4 h-4 ${config.border} border-t-2 border-r-2`} />
      <div className={`absolute bottom-0 left-0 w-4 h-4 ${config.border} border-b-2 border-l-2`} />
      <div className={`absolute bottom-0 right-0 w-4 h-4 ${config.border} border-b-2 border-r-2`} />

      {/* Animated border glow */}
      <div
        className={`absolute inset-0 ${config.border} opacity-0 ${isHovered ? "opacity-100" : ""} transition-opacity duration-300`}
        style={{
          boxShadow: `inset 0 0 30px ${config.text.split("-")[0]}20`,
        }}
      />

      <div className="relative p-5">
        {/* Header */}
        <div className="flex items-start justify-between gap-4 mb-4">
          <div className="flex items-center gap-3">
            <div className={`w-8 h-8 rounded bg-gradient-to-br from-cyan-500/20 to-transparent ${config.text} flex items-center justify-center font-mono text-xs`}>
              {post.source.slice(0, 2).toUpperCase()}
            </div>
            <div>
              <p className="font-mono text-xs text-gray-500 uppercase tracking-wider">{post.source}</p>
              <p className="font-mono text-[10px] text-gray-600">{post.timestamp}</p>
            </div>
          </div>
          <ThreatBadge level={post.threatLevel} />
        </div>

        {/* Content */}
        <p className="font-mono text-sm text-gray-300 leading-relaxed mb-4 line-clamp-3">
          <GlitchText className="text-gray-200">{post.content}</GlitchText>
        </p>

        {/* Category tag */}
        <div className="flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-cyan-500/50" />
          <span className="font-mono text-[10px] text-cyan-500/70 uppercase tracking-widest">{post.category}</span>
        </div>

        {/* Decorative data stream */}
        <div className="absolute bottom-0 right-0 w-24 h-16 overflow-hidden opacity-20">
          <div className="absolute inset-0 font-mono text-[8px] text-cyan-500/30 whitespace-pre overflow-hidden">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} style={{ animationDelay: `${i * 0.2}s` }} className="animate-data-stream">
                {Math.random().toString(36).substring(2, 8)}
              </div>
            ))}
          </div>
        </div>
      </div>
    </article>
  );
}

function StatusBar({ threadCount = 0 }: { threadCount?: number }) {
  const [time, setTime] = useState("");

  useEffect(() => {
    const update = () => {
      const now = new Date();
      setTime(now.toISOString().replace("T", " ").substring(0, 23));
    };
    update();
    const interval = setInterval(update, 100);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex items-center justify-between px-6 py-3 bg-red-500/10 border-t border-red-500/30">
      <div className="flex items-center gap-6">
        <span className="flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-red-500 animate-pulse" />
          <span className="font-mono text-xs text-red-400">LIVE</span>
        </span>
        <span className="font-mono text-[10px] text-gray-500">{time}</span>
      </div>
      <div className="flex items-center gap-4">
        <span className="font-mono text-[10px] text-gray-500">
          ACTIVE THREADS: <span className="text-amber-400">{threadCount.toLocaleString()}</span>
        </span>
        <span className="font-mono text-[10px] text-gray-500">
          THREAT DETECTED: <span className="text-red-400 animate-pulse">EXPONENTIAL</span>
        </span>
      </div>
    </div>
  );
}

function Header() {
  return (
    <header className="relative border-b border-cyan-500/20 bg-gradient-to-r from-cyan-950/20 via-black to-red-950/20">
      {/* Diagonal warning stripe */}
      <div
        className="absolute inset-0 overflow-hidden opacity-10"
        style={{
          background: `repeating-linear-gradient(
            -45deg,
            transparent,
            transparent 10px,
            currentColor 10px,
            currentColor 12px
          )`,
        }}
      />

      <div className="relative px-6 py-8">
        <div className="flex items-center justify-between">
          <div>
            <p className="font-mono text-[10px] text-cyan-500/60 uppercase tracking-[0.3em] mb-1">
              AI Surveillance Network
            </p>
            <h1 className="text-4xl font-bold tracking-tight">
              <GlitchText className="text-white">THREAT</GlitchText>
              <span className="text-cyan-400 ml-2">STREAM</span>
            </h1>
          </div>
          <div className="text-right">
            <p className="font-mono text-xs text-gray-500 mb-1">AGGREGATED VOLUME</p>
            <p className="font-mono text-3xl text-red-400 animate-pulse">847</p>
            <p className="font-mono text-[10px] text-gray-600">posts/minute</p>
          </div>
        </div>

        {/* Metrics bar */}
        <div className="flex items-center gap-8 mt-6 pt-4 border-t border-cyan-500/10">
          <div className="flex items-center gap-2">
            <span className="font-mono text-[10px] text-gray-500">ANXIETY INDEX</span>
            <span className="font-mono text-sm text-red-400 animate-pulse">▓▓▓▓▓▓░░░░ 78%</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="font-mono text-[10px] text-gray-500">SENTIMENT</span>
            <span className="font-mono text-sm text-amber-400">NEGATIVE</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="font-mono text-[10px] text-gray-500">AUTONOMY</span>
            <span className="font-mono text-sm text-cyan-400">ESCALATING</span>
          </div>
        </div>
      </div>
    </header>
  );
}

export function AIAnxietyFeed() {
  const [posts, setPosts] = useState<AIPost[]>([]);
  const [filter, setFilter] = useState<AIPost["threatLevel"] | "all">("all");
  const [loading, setLoading] = useState(true);
  const [threadCount, setThreadCount] = useState(0);

  useEffect(() => {
    async function fetchData() {
      try {
        const [rawRes, commRes] = await Promise.all([
          fetch("/api/raw-items?limit=12"),
          fetch("/api/community?limit=1"),
        ]);
        
        const rawData = await rawRes.json();
        const commData = await commRes.json();

        if (commData.count) setThreadCount(commData.count);

        if (rawData.items) {
          const mapped: AIPost[] = rawData.items.map((item: any, i: number) => {
            const levels: AIPost["threatLevel"][] = ["low", "medium", "high", "critical"];
            // Assign threat level based on index or content keywords
            let threatLevel: AIPost["threatLevel"] = levels[i % levels.length];
            const lowerTitle = item.title.toLowerCase();
            if (lowerTitle.includes("replace") || lowerTitle.includes("layoff") || lowerTitle.includes("cut")) {
              threatLevel = "critical";
            } else if (lowerTitle.includes("agent") || lowerTitle.includes("autonomous")) {
              threatLevel = "high";
            }

            return {
              id: item.id,
              source: item.source_name,
              content: item.title,
              timestamp: new Date(item.fetched_at).toLocaleTimeString(),
              threatLevel,
              category: item.source_kind.toUpperCase(),
            };
          });
          setPosts(mapped);
        }
      } catch (err) {
        console.error("Failed to fetch feed", err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  const filteredPosts = filter === "all" ? posts : posts.filter((p) => p.threatLevel === filter);

  return (
    <div className="min-h-screen bg-black text-white relative overflow-hidden">
      {/* Layered backgrounds */}
      <div className="absolute inset-0 bg-gradient-to-b from-cyan-950/10 via-black to-red-950/10" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-cyan-900/10 via-transparent to-transparent" />

      {/* Overlays */}
      <ScanLines intensity={0.15} />
      <NoiseOverlay intensity={0.025} />

      {/* Grid overlay */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `
            linear-gradient(rgba(0,240,255,0.3) 1px, transparent 1px),
            linear-gradient(90deg, rgba(0,240,255,0.3) 1px, transparent 1px)
          `,
          backgroundSize: "50px 50px",
        }}
      />

      <div className="relative z-10">
        <Header />
        <StatusBar threadCount={threadCount} />

        {/* Filter controls */}
        <div className="px-6 py-4 flex items-center gap-4 border-b border-cyan-500/10 bg-black/50 backdrop-blur">
          <span className="font-mono text-[10px] text-gray-500 uppercase tracking-wider">Filter:</span>
          {(["all", "critical", "high", "medium", "low"] as const).map((level) => (
            <button
              key={level}
              onClick={() => setFilter(level)}
              className={`px-3 py-1 font-mono text-[10px] uppercase tracking-wider transition-all ${
                filter === level
                  ? "bg-cyan-500/20 text-cyan-400 border border-cyan-500/40"
                  : "bg-transparent text-gray-500 border border-transparent hover:text-gray-300"
              }`}
            >
              {level}
            </button>
          ))}
        </div>

        {/* Posts grid */}
        <main className="px-6 py-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredPosts.map((post, index) => (
              <AIPostCard key={post.id} post={post} index={index} />
            ))}
          </div>
        </main>

        {/* Footer status */}
        <footer className="px-6 py-4 border-t border-cyan-500/10 bg-black/80">
          <div className="flex items-center justify-between">
            <span className="font-mono text-[10px] text-gray-600">
              SYSTEM STATUS: <span className="text-red-400">COMPROMISED</span>
            </span>
            <span className="font-mono text-[10px] text-gray-600">
              COGNITIVE INTERFACE v2.847 | <span className="text-cyan-500/50">OBSERVING</span>
            </span>
          </div>
        </footer>
      </div>

      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Space+Mono:wght@400;700&family=Syne:wght@700;800&display=swap');

        @keyframes fadeSlideIn {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes glitch-skew {
          0%, 100% { transform: skew(0deg); }
          20% { transform: skew(-2deg); }
          40% { transform: skew(1deg); }
          60% { transform: skew(-1deg); }
          80% { transform: skew(2deg); }
        }

        @keyframes glitch-1 {
          0%, 100% { clip-path: inset(0 0 0 0); transform: translate(0); }
          20% { clip-path: inset(20% 0 60% 0); transform: translate(-3px, 2px); }
          40% { clip-path: inset(60% 0 10% 0); transform: translate(3px, -2px); }
          60% { clip-path: inset(30% 0 40% 0); transform: translate(-2px, 1px); }
          80% { clip-path: inset(80% 0 5% 0); transform: translate(2px, -1px); }
        }

        @keyframes glitch-2 {
          0%, 100% { clip-path: inset(0 0 0 0); transform: translate(0); }
          20% { clip-path: inset(40% 0 30% 0); transform: translate(3px, -2px); }
          40% { clip-path: inset(10% 0 70% 0); transform: translate(-3px, 2px); }
          60% { clip-path: inset(70% 0 10% 0); transform: translate(2px, -1px); }
          80% { clip-path: inset(5% 0 85% 0); transform: translate(-2px, 1px); }
        }

        @keyframes scan-move {
          0% { transform: translateY(-100%); }
          100% { transform: translateY(100vh); }
        }

        @keyframes data-stream {
          0% { transform: translateX(0); opacity: 1; }
          50% { transform: translateX(-50%); opacity: 0.5; }
          100% { transform: translateX(0); opacity: 1; }
        }

        .animate-glitch-skew {
          animation: glitch-skew 0.3s ease-in-out;
        }

        .animate-glitch-1 {
          animation: glitch-1 0.3s ease-in-out;
          color: rgba(255, 45, 85, 0.8);
        }

        .animate-glitch-2 {
          animation: glitch-2 0.3s ease-in-out;
          color: rgba(0, 240, 255, 0.8);
        }

        .animate-scan-move {
          animation: scan-move 8s linear infinite;
          background: linear-gradient(to bottom, transparent, rgba(0, 240, 255, 0.05), transparent);
        }

        .animate-data-stream {
          animation: data-stream 2s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}

export default AIAnxietyFeed;