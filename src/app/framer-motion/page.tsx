"use client";

import { motion, useScroll, useTransform, useSpring, AnimatePresence } from "framer-motion";
import { useState, useRef } from "react";

const fadeIn = {
  hidden: { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: [0.25, 0.46, 0.45, 0.94] } }
};

const stagger = {
  visible: { transition: { staggerChildren: 0.12 } }
};

function FloatingOrb({ delay = 0, size = 200, color = "#6366f1", style = {} }: { delay?: number; size?: number; color?: string; style?: React.CSSProperties }) {
  return (
    <motion.div
      style={{
        position: "absolute",
        width: size,
        height: size,
        borderRadius: "50%",
        background: `radial-gradient(circle at 30% 30%, ${color}40, ${color}10, transparent)`,
        filter: "blur(40px)",
        ...style
      }}
      animate={{
        y: [0, -30, 0],
        x: [0, 15, 0],
        scale: [1, 1.1, 1]
      }}
      transition={{ duration: 8, repeat: Infinity, delay, ease: "easeInOut" }}
    />
  );
}

function MagneticButton({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState({ x: 0, y: 0 });

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const x = (e.clientX - rect.left - rect.width / 2) * 0.3;
    const y = (e.clientY - rect.top - rect.height / 2) * 0.3;
    setPosition({ x, y });
  };

  const handleMouseLeave = () => setPosition({ x: 0, y: 0 });

  return (
    <motion.div
      ref={ref}
      className={className}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      animate={{ x: position.x, y: position.y }}
      transition={{ type: "spring", stiffness: 150, damping: 15 }}
      style={{ display: "inline-block" }}
    >
      {children}
    </motion.div>
  );
}

function TextReveal({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) {
  return (
    <span style={{ overflow: "hidden", display: "inline-block" }}>
      <motion.span
        style={{ display: "inline-block" }}
        initial={{ y: "100%" }}
        whileInView={{ y: "0%" }}
        viewport={{ once: true }}
        transition={{ duration: 0.9, delay, ease: [0.25, 0.46, 0.45, 0.94] }}
      >
        {children}
      </motion.span>
    </span>
  );
}

function Card3D({ title, description, icon, index }: {
  title: string; description: string; icon: string; index: number;
}) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <motion.div
      variants={fadeIn}
      custom={index}
      whileHover={{ y: -12, rotateY: 5, rotateX: 5 }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        background: "linear-gradient(135deg, rgba(255,255,255,0.08), rgba(255,255,255,0.02))",
        border: "1px solid rgba(255,255,255,0.1)",
        borderRadius: 24,
        padding: 40,
        backdropFilter: "blur(20px)",
        transformStyle: "preserve-3d",
        perspective: 1000,
        cursor: "pointer"
      }}
    >
      <motion.div
        style={{ fontSize: 48, marginBottom: 24 }}
        animate={{ rotate: isHovered ? [0, -10, 10, 0] : 0 }}
        transition={{ duration: 0.5 }}
      >
        {icon}
      </motion.div>
      <h3 style={{
        fontSize: 24,
        fontWeight: 700,
        marginBottom: 12,
        background: "linear-gradient(135deg, #fff 0%, #a5b4fc 100%)",
        WebkitBackgroundClip: "text",
        WebkitTextFillColor: "transparent"
      }}>
        {title}
      </h3>
      <p style={{ color: "rgba(255,255,255,0.6)", lineHeight: 1.7 }}>{description}</p>
    </motion.div>
  );
}

function ScrollSection() {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({ target: ref });
  const scaleX = useSpring(scrollYProgress, { stiffness: 100, damping: 30 });
  const rotate = useTransform(scrollYProgress, [0, 1], [0, 360]);
  const opacity = useTransform(scrollYProgress, [0, 0.3, 0.7, 1], [0, 1, 1, 0]);
  const y = useTransform(scrollYProgress, [0, 1], [100, -100]);

  return (
    <motion.div ref={ref} style={{ y }} variants={stagger} initial="hidden" whileInView="visible" viewport={{ once: true }}>
      <motion.div style={{ opacity }}>
        <motion.div
          style={{ rotateY: rotate }}
          className="flex items-center justify-center mb-8"
        >
          <div style={{
            width: 200,
            height: 200,
            borderRadius: 24,
            background: "linear-gradient(135deg, #6366f1, #8b5cf6, #ec4899)",
            transformStyle: "preserve-3d"
          }} />
        </motion.div>
      </motion.div>
    </motion.div>
  );
}

export default function FramerMotionDemo() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll();
  const backgroundY = useTransform(scrollYProgress, [0, 1], ["0%", "50%"]);
  const scaleX = useSpring(scrollYProgress, { stiffness: 100, damping: 30 });

  return (
    <div style={{ background: "#0a0a0f", minHeight: "100vh", color: "white", overflowX: "hidden" }}>
      {/* Progress bar */}
      <motion.div
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          height: 3,
          background: "linear-gradient(90deg, #6366f1, #ec4899)",
          scaleX,
          transformOrigin: "0%"
        }}
      />

      {/* Floating orbs background */}
      <div style={{ position: "fixed", inset: 0, overflow: "hidden", pointerEvents: "none", zIndex: 0 }}>
        <FloatingOrb size={400} color="#6366f1" delay={0} />
        <FloatingOrb size={300} color="#8b5cf6" delay={2} style={{ top: "20%", right: "10%" }} />
        <FloatingOrb size={350} color="#ec4899" delay={4} style={{ bottom: "20%", left: "5%" }} />
      </div>

      {/* Hero */}
      <motion.section
        ref={containerRef}
        style={{ y: backgroundY, position: "relative", zIndex: 1 }}
        initial="hidden"
        animate="visible"
        variants={stagger}
        className="min-h-screen flex flex-col items-center justify-center px-6 text-center"
      >
        <motion.div variants={fadeIn} className="mb-6">
          <motion.div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              padding: "8px 16px",
              borderRadius: 100,
              background: "rgba(99, 102, 241, 0.15)",
              border: "1px solid rgba(99, 102, 241, 0.3)"
            }}
            whileHover={{ scale: 1.05 }}
          >
            <motion.span
              animate={{ rotate: [0, 360] }}
              transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
              style={{ display: "flex" }}
            >
              ✦
            </motion.span>
            <span style={{ fontSize: 14, fontWeight: 500, color: "#a5b4fc" }}>Powered by Framer Motion</span>
          </motion.div>
        </motion.div>

        <motion.h1 variants={fadeIn} style={{ fontSize: "clamp(48px, 10vw, 120px)", fontWeight: 800, lineHeight: 1.1, letterSpacing: "-0.03em", marginBottom: 24 }}>
          <span style={{ display: "block", overflow: "hidden" }}>
            <TextReveal>Create</TextReveal>
          </span>
          <span style={{ display: "block", overflow: "hidden" }}>
            <TextReveal delay={0.15}>Unforgettable</TextReveal>
          </span>
          <span style={{ display: "block", overflow: "hidden" }}>
            <TextReveal delay={0.3}>
              <span style={{
                background: "linear-gradient(135deg, #6366f1 0%, #ec4899 50%, #f59e0b 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent"
              }}>Experiences</span>
            </TextReveal>
          </span>
        </motion.h1>

        <motion.p variants={fadeIn} style={{ fontSize: 20, color: "rgba(255,255,255,0.6)", maxWidth: 600, lineHeight: 1.7, marginBottom: 40 }}>
          Build stunning, production-ready interfaces with smooth animations, magnetic interactions, and scroll-driven effects.
        </motion.p>

        <motion.div variants={fadeIn} className="flex gap-4 flex-wrap justify-center">
          <MagneticButton>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              style={{
                padding: "16px 32px",
                borderRadius: 16,
                background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
                border: "none",
                color: "white",
                fontSize: 16,
                fontWeight: 600,
                cursor: "pointer",
                boxShadow: "0 8px 32px rgba(99, 102, 241, 0.4)"
              }}
            >
              Get Started
            </motion.button>
          </MagneticButton>
          <MagneticButton>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              style={{
                padding: "16px 32px",
                borderRadius: 16,
                background: "transparent",
                border: "1px solid rgba(255,255,255,0.2)",
                color: "white",
                fontSize: 16,
                fontWeight: 600,
                cursor: "pointer"
              }}
            >
              View Examples
            </motion.button>
          </MagneticButton>
        </motion.div>

        <motion.div
          variants={fadeIn}
          style={{ marginTop: 80 }}
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <span style={{ fontSize: 24, opacity: 0.3 }}>↓</span>
        </motion.div>
      </motion.section>

      {/* Features Grid */}
      <section style={{ position: "relative", zIndex: 1, padding: "120px 24px", maxWidth: 1200, margin: "0 auto" }}>
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          style={{ textAlign: "center", marginBottom: 80 }}
        >
          <h2 style={{ fontSize: "clamp(36px, 6vw, 64px)", fontWeight: 800, marginBottom: 24 }}>
            Everything You Need
          </h2>
          <p style={{ fontSize: 18, color: "rgba(255,255,255,0.6)", maxWidth: 500, margin: "0 auto" }}>
            A comprehensive toolkit for creating immersive, animated interfaces
          </p>
        </motion.div>

        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={stagger}
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
            gap: 32
          }}
        >
          <Card3D
            index={0}
            icon="🎯"
            title="Scroll Animations"
            description="Create captivating scroll-driven experiences with parallax effects and progress indicators"
          />
          <Card3D
            index={1}
            icon="🧲"
            title="Magnetic Interactions"
            description="Buttons and elements that follow the cursor, creating playful engagement"
          />
          <Card3D
            index={2}
            icon="✨"
            title="Staggered Reveals"
            description="Orchestrate complex entrance animations with perfect timing and choreography"
          />
          <Card3D
            index={3}
            icon="🎨"
            title="3D Transforms"
            description="Apply perspective and 3D rotations to create depth and dimension"
          />
          <Card3D
            index={4}
            icon="🔄"
            title="Smooth Transitions"
            description="Animate between states with buttery 60fps motion using spring physics"
          />
          <Card3D
            index={5}
            icon="⚡"
            title="Performance First"
            description="GPU-accelerated animations that maintain 60fps even on mobile devices"
          />
        </motion.div>
      </section>

      {/* Scroll Section */}
      <section style={{ position: "relative", zIndex: 1, padding: "120px 24px", maxWidth: 800, margin: "0 auto", textAlign: "center" }}>
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <h2 style={{ fontSize: "clamp(36px, 6vw, 64px)", fontWeight: 800, marginBottom: 24 }}>
            Scroll Down
          </h2>
          <p style={{ fontSize: 18, color: "rgba(255,255,255,0.6)", marginBottom: 60 }}>
            Watch the magic happen as you scroll
          </p>
        </motion.div>
        <ScrollSection />
      </section>

      {/* Footer CTA */}
      <section style={{
        position: "relative",
        zIndex: 1,
        padding: "120px 24px",
        textAlign: "center"
      }}>
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          whileInView={{ scale: 1, opacity: 1 }}
          viewport={{ once: true }}
          transition={{ type: "spring", stiffness: 50, damping: 20 }}
        >
          <div style={{
            display: "inline-block",
            padding: 80,
            borderRadius: 32,
            background: "linear-gradient(135deg, rgba(99, 102, 241, 0.2), rgba(236, 72, 153, 0.2))",
            border: "1px solid rgba(255,255,255,0.1)"
          }}>
            <h2 style={{ fontSize: "clamp(32px, 5vw, 56px)", fontWeight: 800, marginBottom: 16 }}>
              Ready to Build?
            </h2>
            <p style={{ fontSize: 18, color: "rgba(255,255,255,0.6)", marginBottom: 32 }}>
              Start creating amazing experiences today
            </p>
            <MagneticButton>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                style={{
                  padding: "20px 48px",
                  borderRadius: 16,
                  background: "linear-gradient(135deg, #ec4899, #f59e0b)",
                  border: "none",
                  color: "white",
                  fontSize: 18,
                  fontWeight: 700,
                  cursor: "pointer",
                  boxShadow: "0 8px 32px rgba(236, 72, 153, 0.4)"
                }}
              >
                Start Building →
              </motion.button>
            </MagneticButton>
          </div>
        </motion.div>
      </section>

      {/* Decorative elements */}
      <div style={{
        position: "fixed",
        bottom: 24,
        right: 24,
        display: "flex",
        gap: 8,
        zIndex: 100
      }}>
        <AnimatePresence>
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.1 }}
              style={{
                width: 8,
                height: 8,
                borderRadius: "50%",
                background: ["#6366f1", "#8b5cf6", "#ec4899"][i]
              }}
            />
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}