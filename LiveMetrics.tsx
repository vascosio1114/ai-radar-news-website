import { motion } from "framer-motion"
import { useState, useMemo } from "react"
import { Sparkles, Radar, Cpu } from "lucide-react"

const PARTICLE_COUNT = 42

function generateParticles() {
  return Array.from({ length: PARTICLE_COUNT }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    y: Math.random() * 100,
    size: 2 + Math.random() * 5,
    duration: 6 + Math.random() * 8,
    delay: Math.random() * -14,
  }))
}

function Particle({ particle }: { particle: { id: number; x: number; y: number; size: number; duration: number; delay: number } }) {
  return (
    <motion.div
      className="absolute rounded-full bg-cyan-400"
      style={{
        left: `${particle.x}%`,
        top: `${particle.y}%`,
        width: particle.size,
        height: particle.size,
      }}
      animate={{
        y: [0, -18, 0],
        opacity: [0.3, 0.7, 0.3],
      }}
      transition={{
        duration: particle.duration,
        delay: particle.delay,
        repeat: Infinity,
        ease: "easeInOut",
      }}
    />
  )
}

function MetricCard({ icon: Icon, value, label, description }: { icon: React.ElementType; value: string; label: string; description: string }) {
  const [isHovered, setIsHovered] = useState(false)

  return (
    <motion.div
      className="relative overflow-hidden rounded-2xl border border-white/10 bg-white/[0.07] p-5 backdrop-blur-md"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      whileHover={{ backgroundColor: "rgba(255,255,255,0.1)" }}
      transition={{ duration: 0.2 }}
    >
      {isHovered && (
        <motion.div
          className="pointer-events-none absolute inset-0"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
        >
          <motion.div
            className="absolute inset-0"
            style={{
              background: "linear-gradient(125deg, transparent 40%, rgba(77,171,247,0.3) 45%, rgba(21,170,191,0.3) 50%, transparent 55%)",
            }}
            animate={{ x: ["-100%", "200%"] }}
            transition={{ duration: 1.2, ease: "easeOut" }}
          />
        </motion.div>
      )}
      <div className="relative z-10 flex items-center gap-4">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/[0.08]">
          <Icon className="h-5 w-5 text-cyan-400" strokeWidth={1.5} />
        </div>
        <div>
          <p className="text-sm text-white/50">{label}</p>
          <p className="text-2xl font-semibold text-white">{value}</p>
          <p className="mt-0.5 text-xs text-white/40">{description}</p>
        </div>
      </div>
    </motion.div>
  )
}

export default function LiveMetrics() {
  const particles = useMemo(() => generateParticles(), [])

  return (
    <div className="relative overflow-hidden rounded-3xl border border-white/80 bg-[#0a0a0f] p-10 lg:p-[80px_40px]">
      <div className="absolute inset-0 bg-[#0a0a0f]" />
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: "radial-gradient(ellipse 24% 20% at 18% 20%, rgba(0,229,255,0.15) 0%, transparent 50%), radial-gradient(ellipse 18% 10% at 78% 10%, rgba(0,255,136,0.12) 0%, transparent 50%)",
        }}
      />
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: `linear-gradient(rgba(255,255,255,0.045) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.045) 1px, transparent 1px)`,
          backgroundSize: "34px 34px",
          maskImage: "radial-gradient(ellipse 80% 80% at 50% 50%, black 20%, transparent 70%)",
          WebkitMaskImage: "radial-gradient(ellipse 80% 80% at 50% 50%, black 20%, transparent 70%)",
        }}
      />
      {particles.map((particle) => (
        <Particle key={particle.id} particle={particle} />
      ))}
      <div className="relative z-10 grid grid-cols-1 gap-12 lg:grid-cols-[1.1fr_0.9fr] lg:gap-16">
        <div className="flex flex-col items-start justify-center">
          <motion.div
            className="mb-6 inline-flex items-center gap-2 rounded-full border border-cyan-400/30 bg-cyan-400/10 px-4 py-1.5"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Sparkles className="h-4 w-4 text-cyan-400" strokeWidth={1.5} />
            <span className="text-sm font-medium text-cyan-400">持續更新的 AI 訊號流</span>
          </motion.div>
          <motion.h2
            className="mb-4 text-3xl font-bold text-white lg:text-5xl"
            style={{ fontFamily: "Inter", fontWeight: 700 }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            持續更新的 AI 訊號流
          </motion.h2>
          <motion.p
            className="max-w-xl text-base text-white/68 lg:text-lg"
            style={{ maxWidth: "36rem" }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            即時追蹤全球 AI 資訊動態，從研究論文到產品發布，所有重要訊號一手掌握。零延遲的智能情報樞紐。
          </motion.p>
        </div>
        <div className="flex flex-col gap-4">
          <MetricCard icon={Radar} value="10" label="Sources" description="AI signal feeds" />
          <MetricCard icon={Cpu} value="12h" label="Refresh" description="auto ingest" />
          <MetricCard icon={Sparkles} value="Blog" label="Output" description="analysis" />
        </div>
      </div>
    </div>
  )
}