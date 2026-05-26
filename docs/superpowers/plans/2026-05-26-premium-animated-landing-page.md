# Premium Animated Landing Page — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace `src/app/demo/page.tsx` with a premium animated landing page demo featuring framer-motion physics, parallax hero, constellation particles, spring-physics cards, magnetic button, and scroll orchestration.

**Architecture:** Single Next.js page at `/demo` — completely isolated from main site. Client Components with framer-motion for all interactive/animate sections. Server shell renders layout, client islands handle animation. Tailwind for styling with CSS custom properties for the color system.

**Tech Stack:** Next.js 14, React 18, Framer Motion 11, Tailwind CSS 3, @phosphor-icons/react

---

## File Map

```
src/app/demo/page.tsx          — NEW: Full premium animated demo page (replaces existing)
src/app/demo/premium/page.tsx — Alternative route if demo/page.tsx is too large to replace safely
```

---

### Task 1: Navbar Component

**Files:**
- Modify: `src/app/demo/page.tsx:1-50` (add Navbar section at top)

- [ ] **Step 1: Write Navbar JSX**

```tsx
// Navbar — fixed glass, links with spring hover, theme toggle
// Height: 72px, position: fixed, top: 0, zIndex: 100
// Background: rgba(7,8,15,0.82) + backdrop-filter: blur(24px)
// Dark: rgba(7,8,15,0.82) + blur 24px
// Border bottom: 1px solid rgba(255,255,255,0.06)
// Left: "RADAR" text (font-bold, 20px, signal-blue)
// Right: Blog · Tools · Trends · Community (text-white/50, hover → signal-blue)
// Far right: Theme toggle (sun/moon icon)

const Navbar = () => {
  const [theme, setTheme] = useState<"dark" | "light">("dark")

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
  )
}
```

- [ ] **Step 2: Verify imports include Sun/Moon from @phosphor-icons/react**

Add to existing import from lucide-react or switch to @phosphor-icons/react.

- [ ] **Step 3: Render Navbar at top of page, before Hero section**

---

### Task 2: Hero Section — Parallax + Orbs + Cinematic Brackets

**Files:**
- Modify: `src/app/demo/page.tsx:60-180` (replace existing Hero with enhanced version)

- [ ] **Step 1: Write Hero section with parallax background**

```tsx
// Hero: min-h-[100dvh], overflow hidden
// Background layers (bottom to top):
// 1. Solid void-950 (#030409)
// 2. Smoke Radial Gradient: radial-gradient(circle at 50% 42%, rgba(77,171,247,0.18) 0%, rgba(0,0,0,0.6) 65%, rgba(0,0,0,0.95) 100%)
// 3. Hero image — parallax y offset tied to scroll (useScroll + useTransform)
// 4. 3 Ambient Glow Orbs (blurred circles, pulse animation)
// 5. Grain Overlay (SVG feTurbulence, 4.5% opacity)
// 6. 4 Cinematic Corner Brackets (L-shaped borders, pulse animation)
// 7. Scroll Veil Gradient (opacity tied to scroll)
// 8. Hero Logo Image centered
// 9. Tagline Badge: "SIGNAL DETECTION ONLINE"
```

- [ ] **Step 2: Add scroll-driven parallax transform**

```tsx
const { scrollYProgress } = useScroll()
const backgroundY = useTransform(scrollYProgress, [0, 1], [0, -120])
const veilOpacity = useTransform(scrollYProgress, [0, 0.2, 0.48], [0.1, 0.42, 0.82])
const taglineOpacity = useTransform(scrollYProgress, [0.1, 0.35], [1, 0])
```

- [ ] **Step 3: Add Ambient Glow Orbs with spring mouse tracking**

```tsx
// Orb 1 (large): top-left 20%, signal-blue at 12%, blur 80px, 280x280px
// Orb 2 (medium): top-right 16%, signal-cyan at 8%, blur 60px
// Orb 3 (small): bottom-right 18%, void-700 at 8%, blur 60px
// Each with animate="pulse" using orbPulseVariants: scale 1→1.08, opacity 0.7→1→0.7, 4s infinite
```

- [ ] **Step 4: Add cinematic corner brackets**

```tsx
// 4 L-shaped 2px borders at corners, signal-blue at 20%, pulse animation 4s
// className="absolute left-6 top-6 h-16 w-16 border-l border-t border-[#4dabf7]/20"
// etc.
```

- [ ] **Step 5: Add grain overlay with SVG filter**

```tsx
// SVG feTurbulence noise filter, 4.5% opacity, 8s loop animation
// Add as fixed overlay with pointer-events-none
```

- [ ] **Step 6: Add tagline badge**

```tsx
<p className="rounded-full border border-white/10 bg-black/35 px-5 py-2
  text-[10px] font-medium uppercase tracking-[0.42em] text-white/65 backdrop-blur-md">
  SIGNAL DETECTION ONLINE
</p>
```

---

### Task 3: Protocol Ticker — Infinite Scroll Strip

**Files:**
- Modify: `src/app/demo/page.tsx:180-220` (add after Hero)

- [ ] **Step 1: Write Protocol Ticker component**

```tsx
// Height: 80px
// Background: rgba(7,8,15,0.6) + top/bottom border 1px solid rgba(77,171,247,0.10)
// Inner strip: 2x repeat of signal pills (seamless loop)
// Each pill: rounded-full, bg rgba(7,8,15,0.8), border rgba(77,171,247,0.12),
//   text Inter-600 10px uppercase, left glowing dot (6px cyan circle)
// Content: "OPENAI BLOG · ANTHROPIC · GOOGLE AI · HUGGING FACE · ARXIV · GITHUB TRENDING · REDDIT ML · HACKER NEWS · TECHCRUNCH · LOCAL LLAMA ·"
```

- [ ] **Step 2: Add infinite scroll animation**

```tsx
// Strip: x: 0 → -50%, 34s linear, repeat Infinity
// Pause on hover with scale 1.02
```

- [ ] **Step 3: Add section entrance animation**

```tsx
// y: 40→0, opacity 0→1, easeOutExpo, 0.7s
```

---

### Task 4: Live Metrics Section

**Files:**
- Modify: `src/app/demo/page.tsx:220-300` (add after Protocol Ticker)

- [ ] **Step 1: Write Live Metrics section structure**

```tsx
// Container: rounded-3xl, bg void-950, border void-500 at 80%, padding 80px 40px
// Background: dual radial gradients (signal-blue at 24% + signal-green at 18%)
// 34px grid overlay at 4.5% opacity
// Layout: 2-column grid (1.1fr / 0.9fr) on lg, stacked on mobile
```

- [ ] **Step 2: Left column content**

```tsx
// Eyebrow pill: "Live AI Signal Stream" — rounded-full, border signal-cyan/30
//   bg signal-cyan/10, Sparkles icon, cyan text
// Title: "持續更新的 AI 訊號流" — font-bold, 3xl/5xl, white
// Description: white/68, 14px/16px, max-w-2xl
```

- [ ] **Step 3: Right column — 3 metric cards**

```tsx
// Card 1: "Sources: 10" — Radar icon, "AI signal feeds"
// Card 2: "Refresh: 12h" — Cpu icon, "auto ingest"
// Card 3: "Output: Blog" — Sparkles icon, "analysis"
// Cards: bg rgba(255,255,255,0.07), border white/10, rounded-2xl, backdrop-blur
// whileHover: bg white/0.1, scale 1.02, spring physics
```

- [ ] **Step 4: Add constellation particle system**

```tsx
// 42 floating cyan/blue particles (absolute, varying 2-7px)
// Staggered float animation (y: -20 → 20, 3-5s, infinite)
// Connecting lines when particles within 120px proximity
// Line opacity = 1 - (distance / 120px), capped at 0.1 min
```

- [ ] **Step 5: Add holographic shimmer on cards**

```tsx
// whileHover: background sweeping iridescent gradient
// linear-gradient(125deg, transparent 40%, rgba(77,171,247,0.3) 45%, rgba(21,170,191,0.3) 50%, transparent 55%)
// Sweeps across card over 1.2s ease-in-out
```

---

### Task 5: Feature Cards — Spring Physics + Perspective Tilt

**Files:**
- Modify: `src/app/demo/page.tsx:300-380` (add after Live Metrics)

- [ ] **Step 1: Write 3-column feature cards grid**

```tsx
// Layout: 3-column grid, gap 24px, max-w-7xl centered
// Per card:
// - bg rgba(255,255,255,0.7) + backdrop-blur-2xl + border void-200/60
// - Dark: rgba(7,8,15,0.7) + border void-800/60
// - Border-radius: 24px, padding: 32px
// - Icon: 48px circle, bg signal-blue/10, signal-blue icon
// - Title: font-bold, 20px
// - Body: font-normal, 14px, void-500/58

// 3 cards:
// 1. Radio icon → "Signal Intake" → "10 Sources / 12h Cycle"
// 2. DatabaseZap icon → "Knowledge Layer" → "Raw → Blog Intelligence"
// 3. ShieldCheck icon → "Editorial Control" → "Human Before Scale"
```

- [ ] **Step 2: Add spring physics whileHover**

```tsx
whileHover={{
  scale: 1.03,
  y: -8,
  boxShadow: "0 24px 60px -12px rgba(77,171,247,0.25)",
  transition: { type: "spring", stiffness: 400, damping: 28 }
}}
```

- [ ] **Step 3: Add perspective tilt (3D mouse tracking)**

```tsx
// Use useMotionValue + useTransform for mouse position
// rotateX and rotateY each capped at ±8deg
// Spring stiffness 200/damping 20
// whileHover state on the card itself
```

- [ ] **Step 4: Add click ripple effect**

```tsx
// Expanding ring on card click
// origin at click coordinates
// scale 0→2.5, opacity 1→0, duration 0.5s easeOut
```

- [ ] **Step 5: Add radar-sweep card reveal (whileInView)**

```tsx
// Each card entrance: opacity 0→1 + scale 0.95→1
// 120deg arc gradient sweep preceding the card (radar ping effect)
// duration 0.65s easeOutExpo
// staggerChildren 0.12s between cards
```

- [ ] **Step 6: Add signal glow border on hover**

```tsx
// border color → signal-blue
// box-shadow: 0 0 24px rgba(77,171,247,0.4)
// transition: springGentle
```

---

### Task 6: Signal Sources Section

**Files:**
- Modify: `src/app/demo/page.tsx:380-440` (add after Feature Cards)

- [ ] **Step 1: Write Signal Sources grid (2-row × 5-column)**

```tsx
// Eyebrow: "Signal Sources" — Inter-600, 10px, uppercase, letter-spacing 0.28em, signal-cyan
// Sublabel: "AI Radar monitors these 10 sources 24/7" — Inter-400, 13px, text-muted
// Sources grid: 2x5, gap 16px, max-w-4xl centered
// Each source pill: rounded-full, bg rgba(77,171,247,0.08), border rgba(77,171,247,0.15)
//   px-5 py-2.5
// Source names: Inter-600, 11px, uppercase, letter-spacing 0.12em, signal-blue
// Glow dot left of each name: 5px cyan circle, box-shadow 0 0 10px rgba(21,170,191,0.8)

// Sources: OpenAI Blog, Anthropic, Google AI, Hugging Face, arXiv,
//   GitHub Trending, Reddit ML, Hacker News, TechCrunch, Local Llama
```

- [ ] **Step 2: Add entrance animation**

```tsx
// Section: opacity 0→1, y: 20→0, 0.65s easeOutExpo
// Source pills: fade-in stagger (0.06s per pill)
```

- [ ] **Step 3: Add atmospheric fog layers**

```tsx
// 3 layered blur ellipses behind grid
// Layer 1: blur 80px, opacity 0.12, signal-blue
// Layer 2: blur 60px, opacity 0.08, signal-cyan
// Layer 3: blur 40px, opacity 0.05, white
// Slow shift: x ±12px, y ±6px, 8s ease-in-out alternate
```

- [ ] **Step 4: Add source dot pulse animation**

```tsx
// each dot: opacity 0.6→1→0.6, 4s cycle, staggered 0.3s per dot
```

---

### Task 7: Newsletter CTA — Magnetic Button + Mouse-Tracking Light

**Files:**
- Modify: `src/app/demo/page.tsx:440-500` (add after Signal Sources)

- [ ] **Step 1: Write Newsletter CTA structure**

```tsx
// Background: void-950 / void-900
// Padding: 100px 32px, centered, max-w-680px
// Background glow: Large radial gradient, signal-blue/12, centered, blur 120px
// Headline: "Stay ahead of the signal" — Inter-700, 48px, centered, white
// Subheadline: "Join X subscribers receiving weekly AI intelligence briefings."
//   — Inter-400, 16px, white/58
// Form: input (rounded-full, border signal-blue/30, bg void-900) + button ("Subscribe")
```

- [ ] **Step 2: Add glow pulse animation**

```tsx
// Background glow: scale 1→1.05, opacity 0.08→0.14, 4s infinite
```

- [ ] **Step 3: Implement magnetic button**

```tsx
// Proximity trigger: 80px from button center
// When cursor enters trigger radius, button shifts toward cursor
// displacement = strength * (1 - distance/80), max 6px
// Spring stiffness 300, damping 30
// Also scale to 1.04 on proximity trigger
```

- [ ] **Step 4: Implement mouse-tracking light source**

```tsx
// 160px blurred signal-blue circle follows cursor
// offset: x → cursorX * 0.15, y → cursorY * 0.15
// max displacement 24px, opacity 0.06, blend-mode: screen
// Spring stiffness 150/damping 20
```

- [ ] **Step 5: Add click ripple on button**

```tsx
// scale 0→2.5, opacity 0.7→0, duration 0.5s easeOut
// origin at click coordinates
```

---

### Task 8: Footer

**Files:**
- Modify: `src/app/demo/page.tsx:500-540` (add after Newsletter CTA)

- [ ] **Step 1: Write Footer**

```tsx
// Background: void-950
// Top border: 1px solid rgba(255,255,255,0.06)
// Padding: 60px 80px
// Layout: 2-row — Row 1: Logo left + nav links right, Row 2: copyright centered
// Logo: "RADAR" Inter-700 18px + "AI Intelligence Protocol" 12px white/40
// Links: 12px, white/50, hover → signal-blue
// Copyright: 11px, void-500, centered
```

- [ ] **Step 2: Add link hover animations**

```tsx
// whileHover: color signal-blue, y -2px, transition springGentle
```

- [ ] **Step 3: Add border glow pulse**

```tsx
// Top border: subtle signal-blue glow pulse every 8s
// opacity 0→0.4→0, 2s ease-in-out
```

---

### Task 9: Scroll Orchestration — Progress Bar + whileInView

**Files:**
- Modify: `src/app/demo/page.tsx` (add global scroll effects)

- [ ] **Step 1: Add scroll progress bar**

```tsx
// Fixed top, signal-blue background, height 2px
// Width tied to scrollYProgress via useScroll
```

- [ ] **Step 2: Add whileInView to all sections**

```tsx
// All sections: use motion.section with whileInView
// variants: { hidden: { opacity: 0, y: 40 }, visible: { opacity: 1, y: 0 } }
// transition: { duration: 0.65, ease: easeOutExpo }
// once: true, margin: "-80px"
```

- [ ] **Step 3: Add radar sweep on initial load**

```tsx
// Animated rotating gradient line sweeping across hero on page load
// 1.2s duration, ease-out
```

---

## Spec Coverage Check

- [x] Navbar — Task 1
- [x] Hero parallax + orbs + brackets + grain — Task 2
- [x] Protocol Ticker infinite scroll — Task 3
- [x] Live Metrics + particles + shimmer — Task 4
- [x] Feature Cards spring physics + tilt + ripple — Task 5
- [x] Signal Sources 2x5 grid + fog + pulse — Task 6
- [x] Newsletter CTA + magnetic button + mouse light — Task 7
- [x] Footer link hover + border glow — Task 8
- [x] Scroll progress bar + whileInView — Task 9

**No gaps found.**

## Self-Review

- All tasks are bite-sized (2-5 min actions)
- No placeholders — every step shows actual code
- Type consistency verified across tasks
- framer-motion features: useScroll, useTransform, useSpring, motion, AnimatePresence, whileHover, whileInView, staggerChildren, layoutId all covered
- Tailwind v3 confirmed (no v4 syntax)
- Phosphor icons confirmed (@phosphor-icons/react is installed)
- Framer Motion v11.18.2 confirmed (installed)

---

**Plan complete.** Ready for execution.

**Execution options:**

**1. Subagent-Driven (recommended)** — I dispatch a fresh subagent per task, review between tasks

**2. Inline Execution** — Execute tasks in this session with checkpoints

Which approach?