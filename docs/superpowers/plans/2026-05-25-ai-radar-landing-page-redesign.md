# AI Radar — Premium Animated Landing Page Specification

> **Brand:** RADAR AI Studio
> **Tagline:** "Signal detection online"
> **Core Message:** "While you slept, the AI world already changed"
> **Output:** Chinese-language AI blog intelligence
> **Refresh Cycle:** 12h auto-ingest
> **Signal Sources:** OpenAI Blog · Anthropic · Google AI · Hugging Face · arXiv · GitHub Trending · Reddit ML · Hacker News · TechCrunch · Local Llama
> **Tech Stack:** Framer (Web) + Framer Motion (code components) + TypeScript. Dark mode default.
> **Implementation:** Framer MCP (createCodeFile, updateXmlForNode, manageColorStyle, manageTextStyle)

---

## 1. DESIGN SYSTEM

### Color Palette (CSS Variables)

| Token | Dark Mode | Light Mode | Usage |
|-------|-----------|------------|-------|
| `--void-950` | `#030409` | `#0b0b0f` | Deepest background |
| `--void-900` | `#07080f` | `#14141a` | Primary surface |
| `--void-800` | `#0d0f1a` | `#1a1a25` | Elevated surface |
| `--void-700` | `#141729` | `#22223a` | Card background |
| `--void-500` | `#3a3f5c` | `#4a4f72` | Muted borders |
| `--void-300` | `#6b7094` | `#7b80a4` | Secondary text |
| `--signal-blue` | `#4dabf7` | `#3b82f6` | Primary accent |
| `--signal-cyan` | `#15aabf` | `#06b6d4` | Active indicators |
| `--signal-green` | `#40c057` | `#22c55e` | Success |
| `--signal-amber` | `#fab005` | `#eab308` | Alert |
| `--signal-red` | `#fa5252` | `#ef4444` | Critical |
| `--glow-blue` | `rgba(77, 171, 247, 0.15)` | `rgba(59, 130, 246, 0.12)` | Ambient glow |
| `--glow-cyan` | `rgba(21, 170, 191, 0.12)` | `rgba(6, 182, 212, 0.10)` | Secondary glow |
| `--text-primary` | `#e8e9f0` | `#1a1a2e` | Primary text |
| `--text-secondary` | `rgba(232, 233, 240, 0.68)` | `rgba(26, 26, 46, 0.70)` | Body text |
| `--text-muted` | `rgba(232, 233, 240, 0.38)` | `rgba(26, 26, 46, 0.40)` | Subtle text |
| `--border-subtle` | `rgba(255, 255, 255, 0.06)` | `rgba(0, 0, 0, 0.06)` | Card borders |
| `--border-glow` | `rgba(77, 171, 247, 0.18)` | `rgba(59, 130, 246, 0.15)` | Accent borders |

### Typography

| Style | Font | Size | Weight | Letter Spacing |
|-------|------|------|--------|----------------|
| Hero Title | Inter | 72px / 56px mobile | 700 | -0.02em |
| Section Title | Inter | 48px / 36px mobile | 700 | -0.01em |
| Card Title | Inter | 20px | 600 | 0 |
| Body Large | Inter | 18px | 400 | 0 |
| Body | Inter | 15px | 400 | 0 |
| Eyebrow | Inter | 11px | 600 | 0.28em |
| Mono/Data | JetBrains Mono | 13px | 500 | 0.04em |
| Button | Inter | 14px | 600 | 0.02em |

### Motion Tokens

```typescript
const springGentle = { type: "spring", stiffness: 300, damping: 30 }
const springBouncy = { type: "spring", stiffness: 500, damping: 20 }
const springSnappy = { type: "spring", stiffness: 600, damping: 40 }
const easeOutExpo = { duration: 0.8, ease: [0.16, 1, 0.3, 1] }
const easeInOutQuart = { duration: 0.9, ease: [0.76, 0, 0.24, 1] }
```

---

## 2. SECTION-BY-SECTION SPEC

### Section 1: Navbar

**Implementation:** Modify root Desktop node on `/landing` page via `updateXmlForNode`.

**Visual:**
- Height: 72px, position: fixed, top: 0, zIndex: 100
- Background: `rgba(255,255,255,0.75)` + `backdrop-filter: blur(20px) saturate(180%)`
- Dark: `rgba(7,8,15,0.82)` + blur 24px
- Border bottom: `1px solid rgba(0,0,0,0.06)` / dark: `rgba(255,255,255,0.06)`
- Left: "RADAR" text (Inter-700, 20px, signal-blue)
- Right: Blog · Tools · Trends · Community (Inter-500, 14px, void-500)
- Far right: Theme toggle (sun/moon SVG icon, 20px)

**Animation:**
- Links: `whileHover → color signal-blue, scale 1.05, transition springBouncy`
- Theme toggle: `whileHover → scale 1.1, rotation 15deg, transition springGentle`
- Navbar entrance: `y: -72→0, opacity 0→1, duration 0.5s, easeOutExpo`

---

### Section 2: Hero (100vh, Cinematic Parallax)

**Implementation:** Code component via `createCodeFile` + inserted via `updateXmlForNode`.

**Background layers (bottom to top):**
1. Solid `--void-950`
2. **Smoke Radial Gradient:** `radial-gradient(circle at 50% 42%, rgba(77,171,247,0.18) 0%, rgba(0,0,0,0.6) 65%, rgba(0,0,0,0.95) 100%)`
3. Hero image (`radar-ai-studio-bg.jpeg` / `radar-ai-studio-light.jpeg`) — parallax y offset tied to scroll, object-fit cover, 95% opacity
4. **3 Ambient Glow Orbs** (blurred circles, animated):
   - Orb 1 (large): top-left 20%, `--signal-blue` at 12%, blur 80px, 280×280px
   - Orb 2 (medium): top-right 16%, `--signal-cyan` at 8%, blur 60px, 200×200px
   - Orb 3 (small): bottom-right 18%, `--void-700` at 8%, blur 60px, 200×200px
5. **Grain Overlay:** SVG noise filter at 4.5% opacity (film grain effect)
6. **42px Grid Overlay** at 4.5% opacity
7. **4 Cinematic Corner Brackets** (L-shaped 2px borders, `--signal-blue` at 20%, pulse animation 4s)
8. **Scroll Veil Gradient:** `transparent → white` opacity 0.1→0.82 over scroll 0→0.48
9. **Hero Logo Image:** centered, max-w-760px, drop-shadow `0 0 36px rgba(77,171,247,0.18)`
10. **Tagline Badge:** "SIGNAL DETECTION ONLINE" — rounded-full, px-5 py-2

**Scroll-driven animations (Framer Motion useScroll + useTransform):**
- Background image: `y offset = scrollProgress * 90px` (parallax)
- Scroll veil: `opacity 0.1 → 0.82` over scroll range `[0, 0.48]`
- Tagline badge: `opacity 1 → 0` over scroll range `[0.1, 0.35]`
- Ambient orbs: `pulse-glow` animation (3s, infinite)
- Smoke drift: `scale 1.0→1.05, opacity 0.12→0.18` (12s alternate loop)

**Premium Effects:**
- **Animated Grain Overlay:** SVG `<feTurbulence>` noise filter animated via CSS, 4.5% opacity
- **Color-shifting gradient:** Radial gradient hue shifts subtly on scroll (scroll-linked hue rotation)
- **Light bleed:** Subtle horizontal light streaks from bright elements using CSS `::before` pseudo-elements

---

### Section 3: Protocol Ticker (Infinite Scroll)

**Implementation:** Code component via `createCodeFile`.

**Visual:**
- Height: 80px
- Background: `rgba(7,8,15,0.6)` + top/bottom border `1px solid rgba(77,171,247,0.10)`
- Full-width overflow hidden
- Inner strip: 2× repeat of signal pills (seamless loop)
- Each pill: rounded-full, bg `rgba(7,8,15,0.8)`, border `rgba(77,171,247,0.12)`, text Inter-600 10px uppercase, left glowing dot (6px cyan circle, box-shadow `0 0 14px rgba(77,171,247,0.9)`)
- Content: "OPENAI BLOG · ANTHROPIC · GOOGLE AI · HUGGING FACE · ARXIV · GITHUB TRENDING · REDDIT ML · HACKER NEWS · TECHCRUNCH · LOCAL LLAMA ·"

**Animation:**
- Strip: `x: 0 → -50%`, 34s linear, repeat Infinity
- Hover: pause animation, `scale 1.02` on hovered pill, `transition springGentle`
- Section entrance: `y: 40→0, opacity 0→1, easeOutExpo, 0.7s`

---

### Section 4: Live Metrics (AISnow Redesign)

**Implementation:** Code component via `createCodeFile`.

**Visual:**
- Container: rounded-3xl, bg `--void-950`, border `--void-500` at 80%, padding 80px 40px
- Background layers:
  1. Solid `--void-950`
  2. Dual radial gradients (`--signal-blue` at 24% + `--signal-green` at 18%)
  3. 34px grid overlay, white at 4.5% opacity, masked radial from center
  4. **42 floating cyan particles** (absolute, varying 2-7px, staggered float animation)
- Layout: 2-column grid (1.1fr / 0.9fr) on lg, stacked on mobile

**Left column:**
- Eyebrow pill: "Live AI Signal Stream" — rounded-full, border `--signal-cyan`/30, bg `--signal-cyan`/10, Sparkles icon, cyan text
- Title: "持續更新的 AI 訊號流" — Inter-700, 3xl/5xl, white
- Description: white/68, 14px/16px, max-w-2xl

**Right column (3 metric cards):**
- Card 1: "Sources: 10" — Radar icon, "AI signal feeds"
- Card 2: "Refresh: 12h" — Cpu icon, "auto ingest"
- Card 3: "Output: Blog" — Sparkles icon, "analysis"
- Cards: bg `rgba(255,255,255,0.07)`, border white/10, rounded-2xl, backdrop-blur, hover → bg white/0.1

**Premium Effects:**
- **Particle constellation system:** 42 particles with connecting lines animated when particles are within proximity threshold 120px, line opacity = 1 - (distance / 120px), capped at 0.1 min opacity
- **Holographic shimmer:** Cards shimmer with iridescent gradient on hover — `background: linear-gradient(125deg, transparent 40%, rgba(77,171,247,0.3) 45%, rgba(21,170,191,0.3) 50%, transparent 55%)` sweeping across card over 1.2s ease-in-out on whileHover
- **Magnetic hover:** Metric cards attract toward cursor when within proximity 60px of card center, max displacement 4px, spring stiffness 200/damping 25

---

### Section 5: Feature Cards (3-col Spring Physics)

**Implementation:** Code component via `createCodeFile`.

**Visual:**
- Background: white / `--void-950`
- Padding: 80px 0
- Layout: 3-column grid, gap 24px, max-w-7xl centered

**Per card:**
- Background: `rgba(255,255,255,0.7)` + backdrop-blur-2xl + border `--void-200`/60
- Dark: `rgba(7,8,15,0.7)` + border `--void-800`/60
- Border-radius: 24px, padding: 32px
- Icon: 48px circle, bg `--signal-blue`/10, `--signal-blue` icon
- Title: Inter-700, 20px, `--void-950` / white
- Body: Inter-400, 14px, `--void-500` / white/58
- 3 cards:
  1. Radio icon → "Signal Intake" → "10 Sources / 12h Cycle"
  2. DatabaseZap icon → "Knowledge Layer" → "Raw → Blog Intelligence"
  3. ShieldCheck icon → "Editorial Control" → "Human Before Scale"

**Spring physics whileHover:**
```typescript
whileHover={{
  scale: 1.03,
  y: -8,
  boxShadow: "0 24px 60px -12px rgba(77,171,247,0.25)",
  transition: { type: "spring", stiffness: 400, damping: 28 }
}}
```
- Icon: `whileHover → --signal-blue with box-shadow 0 0 20px rgba(77,171,247,0.6)`

**Premium Effects:**
- **Perspective tilt:** Cards respond to mouse position with 3D tilt — `rotateX` and `rotateY` each capped at ±8deg, spring stiffness 200/damping 20 via `useSpring`
- **Click ripple:** Expanding ring effect on card click, origin at click coordinates, `scale 0→2.5, opacity 1→0, duration 0.5s easeOut`
- **Wave SVG divider:** Animated wave SVG transition at section top — SVG path morphs between two wave states over 3s easeInOut infinite
- **Radar-sweep card reveal:** Each card entrance triggered by scroll position with staggered timing — card opacity 0→1 + scale 0.95→1, with a 120deg arc gradient sweep preceding the card (like radar ping), `duration 0.65s easeOutExpo`
- **Signal glow border on hover:** Border color transitions to `--signal-blue`, `box-shadow: 0 0 24px rgba(77,171,247,0.4)`, `transition springGentle`

---

### Section 6: Signal Sources

**Implementation:** XML nodes via `updateXmlForNode`.

**Note:** Renamed from "Social Proof" — this section displays the 10 signal sources the AI Radar system monitors, directly communicating the product's data infrastructure. NOT press coverage.

**Visual:**
- Background: `--void-950` / white
- Padding: 60px 0
- Centered, max-w-7xl
- Eyebrow: "Signal Sources" — Inter-600, 10px, uppercase, letter-spacing 0.28em, `--signal-cyan`, centered
- Sublabel: "AI Radar monitors these 10 sources 24/7" — Inter-400, 13px, `--text-muted`, centered, mb-8
- Sources grid: 2-row × 5-column grid, gap 16px, max-w-4xl centered
- Each source pill: rounded-full, bg `rgba(77,171,247,0.08)`, border `rgba(77,171,247,0.15)`, px-5 py-2.5
- Source names: Inter-600, 11px, uppercase, letter-spacing 0.12em, `--signal-blue`
- Glow dot left of each name: 5px cyan circle, `box-shadow: 0 0 10px rgba(21,170,191,0.8)`
- Sources: OpenAI Blog · Anthropic · Google AI · Hugging Face · arXiv · GitHub Trending · Reddit ML · Hacker News · TechCrunch · Local Llama

**Animation:**
- Section entrance: `opacity 0→1, y: 20→0, 0.65s easeOutExpo`
- Source pills: fade-in stagger (0.06s per pill, order: top-left → top-right → bottom-left → bottom-right)
- **Atmospheric depth fog:** 3 layered blur ellipses behind the grid — large soft blurred ellipses at varying depths: layer 1 blur 80px opacity 0.12 `--signal-blue`, layer 2 blur 60px opacity 0.08 `--signal-cyan`, layer 3 blur 40px opacity 0.05 white. Layers shift position slowly (8s ease-in-out alternate, x offset ±12px, y offset ±6px) creating drifting fog depth effect.
- Source dot pulse: each dot has subtle `opacity 0.6→1→0.6` pulse, staggered 0.3s per dot, 4s cycle

---

### Section 7: Newsletter CTA (Email Capture)

**Implementation:** Code component via `createCodeFile`.

**Visual:**
- Background: `--void-950` / `--void-900`
- Padding: 100px 32px
- Centered, max-w-680px
- **Background glow:** Large radial gradient, `--signal-blue`/12, centered, blur 120px (animated pulse)
- Headline: "Stay ahead of the AI signal" — Inter-700, 48px, centered, white
- Subheadline: "Join X subscribers receiving weekly AI intelligence briefings." — Inter-400, 16px, white/58
- Form: input (rounded-full, border `--signal-blue`/30, bg `--void-900`, placeholder "your@email.com") + button ("Subscribe", `--signal-blue` bg, white, rounded-full)
- Privacy note: "No spam. Unsubscribe anytime." — 12px, white/40, centered

**Premium Effects:**
- **Glow pulse animation:** `scale 1→1.05, opacity 0.08→0.14` (4s infinite)
- **Mouse-tracking light source:** A 160px blurred `--signal-blue` circle follows cursor, offset `x → cursorX * 0.15, y → cursorY * 0.15`, max displacement 24px, opacity 0.06, blend-mode: screen. Spring stiffness 150/damping 20 for smooth tracking.
- **Magnetic button:** Proximity trigger: 80px from button center. When cursor enters trigger radius, button center shifts toward cursor at `strength = 1 - (distance / 80)` capped at max displacement 6px. Spring stiffness 300/damping 30. Button also scales to 1.04 on proximity trigger.
- **Click ripple on button:** Expanding ring on subscribe click, origin at click coordinates, `scale 0→2.5, opacity 0.7→0, duration 0.5s easeOut`

---

### Section 8: Footer

**Implementation:** XML nodes via `updateXmlForNode`.

**Visual:**
- Background: `--void-950`
- Top border: `1px solid rgba(255,255,255,0.06)`
- Padding: 60px 80px
- Layout: 2-row — Row 1: Logo left + nav links right (Privacy · Terms · GitHub · Twitter/X), Row 2: copyright centered

**Text:**
- Logo: "RADAR" Inter-700 18px + "AI Intelligence Protocol" 12px white/40
- Links: 12px, white/50, hover → `--signal-blue`
- Copyright: 11px, `--void-500`, centered

**Animation:**
- Links: `whileHover → color signal-blue, y -2px, transition springGentle`
- Top border: subtle `--signal-blue` glow pulse that fires every 8s (`opacity 0→0.4→0`, 2s ease-in-out), synchronizes with the radar sweep on scroll orchestration
- Logo: entrance `opacity 0→1, y: 10→0, 0.5s easeOutExpo` on initial page load (delayed 0.3s after page load)

---

### Section 9: Scroll Orchestration (Global)

**Implementation:** Code component via `createCodeFile`, appended to page root.

**Visual:**
- **2px Scroll Progress Bar:** Fixed top, `--signal-blue` background, height 2px, width tied to scrollYProgress
- **Radar Sweep Reveal:** Animated rotating gradient line that sweeps across hero on initial load (1.2s)
- **Constellation/Data Streams:** Animated flowing data lines in background of hero section

**All Sections — whileInView entrance:**
```typescript
variants={{
  hidden: { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.65, ease: easeOutExpo } }
}}
// once: true, margin: "-80px"
```

---

## 3. ANIMATED EFFECTS REPOSITORY

Each effect implemented as a reusable Framer Motion component:

| Effect | Component | Animation Spec |
|--------|-----------|---------------|
| Grain overlay | `<GrainOverlay />` | SVG feTurbulence, opacity 4.5%, 8s loop |
| Glow orbs (3x) | `<GlowOrb />` | scale 1→1.08, opacity 0.6→0.85, 8s easeInOut, infinite |
| Cinematic brackets | `<CornerBrackets />` | opacity 0.15→0.25, 4s easeInOut, infinite |
| Constellation particles | `<ConstellationField />` | 42 dots + connecting lines, proximity threshold 120px, line opacity based on distance |
| Light bleed streaks | `<LightBleed />` | horizontal blur, opacity pulse, 6s loop |
| Wave SVG divider | `<WaveDivider />` | SVG path morph, 3s easeInOut, infinite |
| Magnetic button | `<MagneticButton />` | proximity trigger 80px, max displacement 6px, spring stiffness 300/damping 30, scale 1.04 on trigger |
| Click ripple | `<RippleEffect />` | scale 0→2.5, opacity 1→0, 0.5s easeOut, origin at click coordinates |
| Perspective tilt card | `<TiltCard />` | rotateX/Y ±8deg cap, spring stiffness 200/damping 20 |
| Holographic shimmer | `<HoloShimmer />` | hue-rotate 0→360deg, 4s linear, infinite |
| Radar sweep | `<RadarSweep />` | rotate 0→360deg, 2s linear, once on load |
| Data stream lines | `<DataStreams />` | 3 speed tiers (slow: 14s, medium: 10s, fast: 8s), 6 lines across hero |
| Color-shifting gradient | `<ShiftGradient />` | hue rotate linked to scrollYProgress ±15deg |
| Word-by-word reveal | `<WordReveal />` | stagger 0.05s per word on scroll intersection |
| Radar-sweep card reveal | `<RadarReveal />` | 120deg arc gradient sweep precedes card, opacity 0→1 + scale 0.95→1, 0.65s easeOutExpo |

---

## 4. TASK BREAKDOWN

```
Task 1:   Project Setup — Color styles (manageColorStyle) + Text styles (manageTextStyle)
Task 2:   Navbar — fixed glass + links + theme toggle
Task 3:   Hero — parallax + smoke gradient + orbs + brackets + scroll veil + grain overlay
Task 4:   Hero Premium Effects — constellation + light bleed + radar sweep + data streams
Task 5:   Protocol Ticker — infinite scroll strip + 10 sources
Task 6:   Live Metrics — AISnow redesign + particles + dual gradient + holographic shimmer
Task 7:   Feature Cards — spring physics hover + perspective tilt + wave divider + radar reveal + signal glow border
Task 8:   Signal Sources — 2×5 grid + fog layers + dot pulse animation (formerly Social Proof)
Task 9:   Newsletter CTA — email capture + glow pulse + magnetic button + mouse-tracking light + ripple
Task 10:  Footer — link hover animations + border glow pulse
Task 11:  Dark Mode — global toggle + all dual-value color tokens
Task 12:  Scroll Orchestration — progress bar + radar sweep + whileInView on all sections
```

---

## 5. SUCCESS CRITERIA

- [ ] All animations match Framer Motion spring/ease token specs
- [ ] Smoke/smoke drift animation on hero background
- [ ] 3 ambient glow orbs with pulse-glow animation
- [ ] Cinematic corner brackets with opacity pulse
- [ ] Scroll parallax on hero image (y offset tied to scroll)
- [ ] Scroll veil gradient opacity tied to scroll progress
- [ ] Protocol ticker: infinite scroll, seamless loop, 10 sources
- [ ] Live metrics: 42 floating particles + constellation connecting lines (proximity threshold 120px, opacity capped at 0.1 min)
- [ ] Feature cards: whileHover spring physics (scale 1.03, y -8, boxShadow glow)
- [ ] Feature cards: perspective tilt responding to mouse position (rotateX/Y ±8deg, spring stiffness 200/damping 20)
- [ ] Feature cards: click ripple effect (scale 0→2.5, opacity 1→0, 0.5s easeOut)
- [ ] Feature cards: radar-sweep card reveal (120deg arc gradient sweep + opacity/scale entrance)
- [ ] Feature cards: signal glow border on hover
- [ ] CTA: glow pulse animation on background
- [ ] CTA: magnetic button (proximity 80px, spring stiffness 300/damping 30, max displacement 6px)
- [ ] CTA: mouse-tracking light source (offset 15% of cursor position, spring stiffness 150/damping 20)
- [ ] Hero: animated grain overlay
- [ ] Hero: color-shifting gradient (hue linked to scroll ±15deg)
- [ ] Hero: radar sweep on initial load
- [ ] Hero: data stream visualizer lines (3 speed tiers: 8s/10s/14s, 6 lines)
- [ ] Section divider: wave SVG morph animation
- [ ] All sections: whileInView scroll reveal (once: true, margin -80px)
- [ ] Dark mode: all elements switch colors correctly
- [ ] Scroll progress indicator bar (2px signal-blue line at top)
- [ ] Signal Sources: section displays all 10 sources in 2×5 grid with fog animation
- [ ] Footer: link hover animations + border glow pulse synchronized with radar sweep
- [ ] No generic placeholder text — all content is AI Radar branded
- [ ] Framer MCP connection maintained throughout