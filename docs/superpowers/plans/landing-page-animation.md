# Landing Page Animation Redesign — Plan

## Context
- **Goal:** Redesign the ai-radar landing page with full Framer Motion animation, high-tech premium aesthetic
- **Current state:** Static hero with basic scroll effects, no staggered orchestration, no perpetual micro-interactions
- **Style baseline:** Premium editorial (Source Serif 4 + Inter), tech-forward, dark-mode primary

## Design Configuration
| Dial | Value | Notes |
|------|-------|-------|
| DESIGN_VARIANCE | 8 | Asymmetric, creative layout |
| MOTION_INTENSITY | 7 | Framer Motion orchestration, scroll parallax |
| VISUAL_DENSITY | 5 | Clean but not sparse — daily app feel |

**Forbidden:** No pure black (#000), no neon glows, no Inter for display, no centered hero

---

## Phase 1 — Hero Section (h-screen → min-h-[100dvh])

### 1.1 Parallax Background
- Background image translates Y on scroll using `useTransform(scrollYProgress, [0, 1], [0, -120])`
- Ambient glow orbs pulse subtly with `useSpring` (stiffness: 50, damping: 20)
- Cinematic particles layer: CSS animation, pointer-events-none, GPU-accelerated translate3d

### 1.2 Staggered Logo Reveal
- Logo image enters with `opacity: 0 → 1`, `scale: 0.94 → 1`, `filter: blur(8px) → blur(0)`
- Duration: 1.2s, easing: `[0.16, 1, 0.3, 1]` (expo out)
- Framer Motion `staggerChildren: 0.15` on container
- Tagline pill fades in 400ms after logo settles

### 1.3 Scroll Indicator
- Animated chevron/arrow bouncing with `animate: { y: [0, 6, 0] }`, infinite loop
- "Scroll to initialize" text fades in after 1.8s delay

---

## Phase 2 — Latest News Section (below hero)

### 2.1 Bento Grid Layout (DESIGN_VARIANCE: 8)
- Featured article: large left tile (2/3 width)
- Secondary articles: stacked right column (1/3 width)
- On mobile: single column, full width

### 2.2 Staggered Card Reveals
- Cards animate in: `opacity: 0 → 1`, `y: 40 → 0`, staggered 120ms between cards
- Trigger: `whileInView` with `once: true`, `margin: "-80px"`
- Spring physics: `stiffness: 100, damping: 20`

### 2.3 Featured Card Micro-Interactions
- On hover: subtle `scale: 1.02`, image `scale: 1.06` (inner element only)
- Cover image: parallax on mouse move using `useTransform(mouseX, [-500, 500], [-10, 10])`
- Card border: spotlight illumination under cursor

---

## Phase 3 — Stats / Ticker Section

### 3.1 Horizontal Marquee
- Infinite scrolling ticker with stats (articles count, tools count, etc.)
- Two identical strips side by side for seamless loop
- Speed: 40px/s, pauses on hover

### 3.2 Number Counter Animation
- Count-up animation when stats section enters viewport
- `useMotionValue` + `useTransform` for smooth number interpolation
- Spring-based overshoot on final number

---

## Phase 4 — Protocol Experience Section

### 4.1 Sticky Scroll Sequence
- Cards animate in from alternating sides (left, right, center)
- Layout transitions using `layoutId` for smooth reordering
- Section uses `position: sticky` during scroll

### 4.2 Orbital Animation
- Small glowing orbs orbit around a central point
- CSS animation with `animation: orbit Xs linear infinite`
- Speed varies per orb (28s, 42s for layered depth)

---

## Phase 5 — Newsletter Section

### 5.1 Form Reveal
- Email input slides up from bottom with `y: 60 → 0`
- CTA button scales from `scale: 0.9 → 1` with spring overshoot
- Stagger: 80ms between input and button

### 5.2 Success State Animation
- On submit: form morphs into success checkmark
- SVG path draws itself (stroke-dashoffset animation)
- Checkmark scales in with `spring(stiffness: 300, damping: 18)`

---

## Phase 6 — Footer

### 6.1 Fade-In on Scroll
- Footer elements fade in as user reaches bottom
- Social icons stagger left-to-right, 80ms between each

---

## Implementation Tasks

1. **Refactor Hero.tsx** — Replace static scroll logic with full Framer Motion stagger, parallax, spring physics
2. **Create AnimatedBackground.tsx** — Isolated `"use client"` component for particles/glow orbs with `useSpring`
3. **Refactor LatestNews.tsx** — Bento grid layout + stagger reveal on scroll + spotlight card borders
4. **Create MarqueeTicker.tsx** — Horizontal infinite scroll, memoized to prevent re-renders
5. **Create CountUpNumber.tsx** — Number counter with motion value, isolated client component
6. **Refactor Newsletter.tsx** — Morphing success state with SVG line draw
7. **Update globals.css** — Ensure dark-mode gradients, reduce section padding, add spring utility classes

---

## Verification Plan
- [ ] Hero section uses `min-h-[100dvh]` not `h-screen`
- [ ] All animations use Framer Motion (no `window.addEventListener`)
- [ ] Perpetual animations are memoized + isolated client components
- [ ] Mobile layout collapses to single column
- [ ] Spring physics: `type: "spring", stiffness: 100, damping: 20` (or similar)
- [ ] Stagger reveals: `staggerChildren: 0.12` on parent container
- [ ] Dark mode: no pure black, use `bg-ink-950` or `#020204`
- [ ] Build passes with no errors