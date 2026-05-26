import { useRef, useState } from "react"
import { motion, useSpring, useMotionValue, useTransform } from "framer-motion"
import { Radio, DatabaseZap, ShieldCheck } from "lucide-react"

const cards = [
  {
    icon: Radio,
    title: "Signal Intake",
    body: "10 Sources / 12h Cycle",
  },
  {
    icon: DatabaseZap,
    title: "Knowledge Layer",
    body: "Raw → Blog Intelligence",
  },
  {
    icon: ShieldCheck,
    title: "Editorial Control",
    body: "Human Before Scale",
  },
]

function WaveDivider() {
  return (
    <svg width="100%" height="60" viewBox="0 0 1440 60" preserveAspectRatio="none" style={{ display: "block", overflow: "visible" }}>
      <motion.path
        d="M0,30 C240,50 480,10 720,30 C960,50 1200,10 1440,30 L1440,60 L0,60 Z"
        fill="rgba(255,255,255,0.03)"
        animate={{
          d: [
            "M0,30 C240,50 480,10 720,30 C960,50 1200,10 1440,30 L1440,60 L0,60 Z",
            "M0,30 C240,10 480,50 720,30 C960,10 1200,50 1440,30 L1440,60 L0,60 Z",
            "M0,30 C240,50 480,10 720,30 C960,50 1200,10 1440,30 L1440,60 L0,60 Z",
          ],
        }}
        transition={{ duration: 3, ease: "easeInOut", repeat: Infinity }}
      />
    </svg>
  )
}

function ClickRipple({ x, y }: { x: number; y: number }) {
  return (
    <motion.div
      initial={{ scale: 0, opacity: 1 }}
      animate={{ scale: 2.5, opacity: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      style={{
        position: "absolute",
        left: x,
        top: y,
        width: "40px",
        height: "40px",
        borderRadius: "50%",
        border: "2px solid rgba(77, 171, 247, 0.8)",
        transform: "translate(-50%, -50%)",
        pointerEvents: "none",
      }}
    />
  )
}

function FeatureCard({
  icon: Icon,
  title,
  body,
  index,
}: {
  icon: React.ComponentType<{ size?: number; color?: string; strokeWidth?: number }>
  title: string
  body: string
  index: number
}) {
  const cardRef = useRef<HTMLDivElement>(null)
  const [ripples, setRipples] = useState<Array<{ id: number; x: number; y: number }>>([])
  const [isHovered, setIsHovered] = useState(false)

  const rawX = useMotionValue(0)
  const rawY = useMotionValue(0)

  const rotateX = useSpring(useTransform(rawY, [-0.5, 0.5], [8, -8]), { stiffness: 200, damping: 20 })
  const rotateY = useSpring(useTransform(rawX, [-0.5, 0.5], [-8, 8]), { stiffness: 200, damping: 20 })

  const variants = {
    hidden: { opacity: 0, scale: 0.95 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: { duration: 0.65, ease: [0.16, 1, 0.3, 1], delay: index * 0.15 },
    },
  }

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!cardRef.current) return
    const rect = cardRef.current.getBoundingClientRect()
    const x = (e.clientX - rect.left) / rect.width
    const y = (e.clientY - rect.top) / rect.height
    rawX.set(x - 0.5)
    rawY.set(y - 0.5)
  }

  const handleMouseLeave = () => {
    rawX.set(0)
    rawY.set(0)
    setIsHovered(false)
  }

  const handleClick = (e: React.MouseEvent) => {
    if (!cardRef.current) return
    const rect = cardRef.current.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top
    const id = Date.now()
    setRipples((prev) => [...prev, { id, x, y }])
    setTimeout(() => setRipples((prev) => prev.filter((r) => r.id !== id)), 600)
  }

  return (
    <motion.div
      ref={cardRef}
      variants={variants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-50px" }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onMouseEnter={() => setIsHovered(true)}
      onClick={handleClick}
      style={{ rotateX, rotateY, transformStyle: "preserve-3d", perspective: 1000 }}
      whileHover={{
        scale: 1.03,
        y: -8,
        boxShadow: "0 24px 60px -12px rgba(77,171,247,0.25)",
        transition: { type: "spring", stiffness: 400, damping: 28 },
      }}
    >
      <div
        style={{
          backgroundColor: "rgba(255, 255, 255, 0.7)",
          backdropFilter: "blur(2rem)",
          WebkitBackdropFilter: "blur(2rem)",
          borderRadius: "24px",
          padding: "32px",
          border: "1px solid rgba(11, 11, 15, 0.12)",
          position: "relative",
          overflow: "hidden",
        }}
        className="feature-card-light"
      />

      <motion.div
        animate={{ opacity: isHovered ? 1 : 0 }}
        transition={{ duration: 0.2 }}
        style={{
          position: "absolute",
          inset: 0,
          borderRadius: "24px",
          border: "1px solid rgba(77, 171, 247, 0.8)",
          boxShadow: "0 0 20px rgba(77, 171, 247, 0.4)",
          pointerEvents: "none",
        }}
      />

      {ripples.map((ripple) => (
        <ClickRipple key={ripple.id} x={ripple.x} y={ripple.y} />
      ))}

      <motion.div
        style={{
          width: "48px",
          height: "48px",
          borderRadius: "50%",
          backgroundColor: "rgba(77, 171, 247, 0.1)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          marginBottom: "16px",
        }}
        whileHover={{
          backgroundColor: "rgba(77, 171, 247, 0.2)",
          boxShadow: "0 0 20px rgba(77, 171, 247, 0.6)",
          transition: { type: "spring", stiffness: 400, damping: 28 },
        }}
      >
        <Icon size={24} color="rgba(77, 171, 247, 1)" strokeWidth={1.5} />
      </motion.div>

      <div
        style={{
          fontFamily: "GF;Inter-700",
          fontSize: "20px",
          lineHeight: 1.6,
          letterSpacing: "-0.02em",
          color: "rgb(11, 11, 15)",
          marginBottom: "8px",
        }}
        className="feature-card-title"
      >
        {title}
      </div>

      <div
        style={{
          fontFamily: "GF;Inter-400",
          fontSize: "14px",
          lineHeight: 1.6,
          color: "rgb(74, 79, 114)",
        }}
        className="feature-card-body"
      >
        {body}
      </div>

      <style>
        {`
          .dark .feature-card-light { background-color: rgba(7, 8, 15, 0.7) !important; border-color: rgba(13, 15, 26, 0.6) !important; }
          .dark .feature-card-title { color: rgb(232, 233, 240) !important; }
          .dark .feature-card-body { color: rgba(232, 233, 240, 0.58) !important; }
        `}
      </style>
    </motion.div>
  )
}

export default function FeatureCards() {
  return (
    <div
      style={{
        backgroundColor: "rgb(11, 11, 15)",
        padding: "80px 0",
        position: "relative",
        overflow: "hidden",
      }}
      className="feature-cards-section"
    >
      <div style={{ position: "absolute", top: 0, left: 0, right: 0, transform: "translateY(-99%)" }}>
        <WaveDivider />
      </div>

      <div
        style={{
          maxWidth: "80rem",
          marginLeft: "auto",
          marginRight: "auto",
          paddingLeft: "2rem",
          paddingRight: "2rem",
        }}
      >
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(3, 1fr)",
            gap: "24px",
          }}
        >
          {cards.map((card, index) => (
            <FeatureCard key={card.title} {...card} index={index} />
          ))}
        </div>
      </div>

      <style>
        {`
          .dark .feature-cards-section { background-color: rgb(3, 4, 9) !important; }
        `}
      </style>
    </div>
  )
}