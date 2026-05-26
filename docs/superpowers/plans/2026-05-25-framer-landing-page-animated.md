# AI Radar Framer Landing Page — Premium Animated Redesign

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rebuild the AI Radar landing page in Framer with premium scroll-driven animations, glassmorphism, parallax, staggered reveals, and a high-end tech aesthetic matching the existing ink/accent color palette.

**Architecture:** A single-page Framer web project with a cinematic hero section, an animated signal-ticker protocol strip, a live-trust metrics section, feature cards with spring-physics hover, and a newsletter CTA. Sections stack vertically with scroll-triggered entrance animations. Framer's native Motion (Framer Motion) handles all animations — no external libraries needed.

**Tech Stack:** Framer (Web), Framer Motion (built-in), TypeScript code components, CSS custom properties for theming.

---

## File Map

```
Curious Actions Framer project (mcp connection: mcp__framer__*)
├── Pages
│   └── / (LandingPage)
│       └── Desktop breakpoint (1200px root)
│           ├── Navbar (fixed top)
│           ├── HeroSection          ← scroll-driven parallax + fade
│           ├── ProtocolTicker       ← infinite horizontal scroll strip
│           ├── LiveMetrics          ← AISnowSection redesign
│           ├── FeatureCards         ← 3-col spring-physics cards
│           ├── SocialProof         ← testimonial / logo strip
│           ├── NewsletterCTA       ← email capture
│           └── Footer
└── Code components (per section)
    └── scroll-reveal.tsx            ← shared scroll animation wrapper
```

---

## Color Palette (from Tailwind config)

| Token | Light | Dark |
|---|---|---|
| `ink-950` (bg) | `#0b0b0d` | `#050507` |
| `ink-800` | `#18181b` | `#0b0b0d` |
| `accent-500` | `#3b82f6` (blue) | `#60a5fa` |
| `accent-600` | `#2563eb` | `#93c5fd` |
| Text primary | `ink-950` | `#f7f7f8` |
| Text muted | `ink-500` | `#a1a1aa` |

---

## Animation System Reference

All animations use Framer Motion with these tokens:

| Name | Config | Use |
|---|---|---|
| `spring-bounce` | `{ type: "spring", stiffness: 400, damping: 28 }` | Cards, buttons |
| `spring-soft` | `{ type: "spring", stiffness: 120, damping: 20 }` | Hover lifts |
| `ease-out-expo` | `{ ease: [0.16, 1, 0.3, 1], duration: 0.7 }` | Scroll reveals |
| `stagger-child` | `staggerChildren: 0.06s, delayChildren: 0.1s` | Section entrances |
| `scroll-reveal` | `whileInView: { opacity: 1, y: 0 }, viewport: { once: true }` | Section triggers |

---

## Task 1: Project Setup & Global Styles

**Files:**
- Modify: Framer project root (via MCP `updateXmlForNode` + style creation via `manageColorStyle` / `manageTextStyle`)

- [ ] **Step 1: Create ink/900 color style (dark background)**

Run: `mcp__framer__manageColorStyle`
```
stylePath: "/ink/900"
type: "create"
properties: { "light": "#0b0b0d", "dark": "#050507" }
```

- [ ] **Step 2: Create accent-500 color style**

Run: `mcp__framer__manageColorStyle`
```
stylePath: "/accent/500"
type: "create"
properties: { "light": "#3b82f6", "dark": "#60a5fa" }
```

- [ ] **Step 3: Create ink-100 text style (body text)**

Run: `mcp__framer__manageTextStyle`
```
stylePath: "/text/body"
type: "create"
properties: { "font": "GF;Inter-400", "fontSize": "16px", "lineHeight": "1.6", "color": "/ink/700" }
```

- [ ] **Step 4: Create display/hero text style**

Run: `mcp__framer__manageTextStyle`
```
stylePath: "/text/hero"
type: "create"
properties: { "font": "GF;Inter-700", "fontSize": "72px", "lineHeight": "1.05", "letterSpacing": "-0.02em", "color": "/ink/950" }
```

- [ ] **Step 5: Verify styles created**

Run: `mcp__framer__getProjectXml`
Expected: ColorStyles and TextStyles sections populated

---

## Task 2: Navbar (Fixed, Blur-glass)

**Files:**
- Modify: Landing page root node (add navbar component)

- [ ] **Step 1: Create Navbar frame as detached component**

Insert via `mcp__framer__updateXmlForNode` on root Desktop node:
```
<Frame name="Navbar" nodeId="navbar-root" width="100%" height="72px" position="fixed" top="0" left="0" zIndex="100" backgroundColor="/glass" />
```

- [ ] **Step 2: Add logo text node inside Navbar**

```
<Text nodeId="navbar-logo" text="RADAR" font="GF;Inter-700" fontSize="18px" inlineTextStyle="/text/hero" position="absolute" left="32px" top="24px" />
```

- [ ] **Step 3: Add nav links (right-aligned)**

Insert links: Blog, Tools, Trends, Community — each with hover underline animation via `whileHover`.

- [ ] **Step 4: Apply glass blur to Navbar**

```
backgroundColor="rgba(255,255,255,0.7)" backdropFilter="blur(20px) saturate(180%)"
dark: backgroundColor="rgba(11,11,13,0.7)"
```

- [ ] **Step 5: Add theme toggle button (sun/moon icon)**

Position: right side of navbar, whileHover scale 1.1 with spring.

---

## Task 3: Hero Section — Parallax Scroll + Cinematic Fade

**Files:**
- Create: `HeroSection` as Frame under root Desktop via `updateXmlForNode`

- [ ] **Step 1: Create Hero section frame (100vh)**

```
<Frame name="HeroSection" width="100%" height="100vh" position="relative" overflow="hidden" backgroundColor="white" darkBackgroundColor="black" />
```

- [ ] **Step 2: Add background image (radar-ai-studio-light/dark) with parallax scroll**

Use `mcp__framer__updateXmlForNode` on hero node — add two Image nodes:
- Light: `src="/images/radar-ai-studio-light.jpeg"` opacity 0.95
- Dark: `src="/images/radar-ai-studio-bg.jpeg"` opacity 0.95 (dark mode)

Apply `motion` drag via Framer's native transform scroll binding via `useScroll` + `useTransform` equivalent in Framer — set `style={{ y: scrollYProgress * 90 }}`.

- [ ] **Step 3: Add ambient glow orbs (3 blurred divs)**

```
<Frame width="280px" height="280px" borderRadius="50%" backgroundColor="rgba(59,130,246,0.12)" filter="blur(60px)" position="absolute" top="40%" left="20%" />
```
Repeat with slightly different sizes/positions for depth.

- [ ] **Step 4: Add cinematic corner brackets (4 L-shaped borders)**

Four Frame nodes with border-left + border-top (top-left, top-right, bottom-left, bottom-right) — accent-500/20 opacity.

- [ ] **Step 5: Add hero logo image (centered, ~760px wide)**

```
<Image src="/images/radar-ai-studio-light.jpeg" width="760px" position="absolute" centerX="50%" top="35%" />
```

- [ ] **Step 6: Add tagline badge**

```
<Text text="SIGNAL DETECTION ONLINE" position="absolute" bottom="10%" centerX="50%" fontSize="11px" font="GF;Inter-600" letterSpacing="0.42em" textColor="/ink-500" />
```

- [ ] **Step 7: Add scroll-veil gradient overlay**

`background="linear-gradient(to bottom, transparent 30%, rgba(255,255,255,0.8) 85%, white)"` — fades to white as user scrolls. Animate opacity from 0→1 over scroll range 0→0.4.

- [ ] **Step 8: Add bottom fade-to-white gradient**

Ensures hero blends into next section smoothly.

- [ ] **Step 9: Set scroll-linked opacity on tagline badge**

Tag badge fades out as user scrolls (opacity 1→0 over scroll range 0.1→0.35).

---

## Task 4: Protocol Ticker Strip — Infinite Scroll

**Files:**
- Create: `ProtocolTicker` frame under Hero

- [ ] **Step 1: Create ticker container frame**

```
<Frame name="ProtocolTicker" width="100%" height="80px" overflow="hidden" backgroundColor="transparent" position="relative" />
```

- [ ] **Step 2: Add inner strip with infinite scroll animation**

Framer's native `animate={{ x: "-50%" }}` with `transition={{ duration: 34, ease: "linear", repeat: Infinity }}`.

Content: Repeating list of signal labels — "OPENAI BLOG · ANTHROPIC · GOOGLE AI · HUGGING FACE · ARXIV · GITHUB TRENDING · REDDIT ML · HACKER NEWS · TECHCRUNCH · LOCAL LLAMA ·" — each with a glowing blue dot.

- [ ] **Step 3: Style signal pills**

Each pill: rounded-full, border accent-300/20, bg ink-950/60, white text, glowing dot (4px cyan circle with box-shadow glow).

- [ ] **Step 4: Add scroll-reveal entrance animation**

Ticker slides up from below (y: 40→0, opacity: 0→1) when it enters viewport.

---

## Task 5: Live Metrics Section (AISnow redesign)

**Files:**
- Create: `LiveMetrics` frame

- [ ] **Step 1: Create section container**

```
<Frame name="LiveMetrics" width="100%" padding="80px 0" position="relative" backgroundColor="/ink/950" borderRadius="24px" overflow="hidden" />
```

- [ ] **Step 2: Add radial gradient background**

```
background="radial-gradient(circle at 18% 20%, rgba(59,130,246,0.24), transparent 28%), radial-gradient(circle at 78% 10%, rgba(34,197,94,0.18), transparent 26%)"
```

- [ ] **Step 3: Add grid overlay (34px grid, 45% opacity)**

```
backgroundImage="linear-gradient(rgba(255,255,255,0.045)_1px, transparent_1px), linear-gradient(90deg, rgba(255,255,255,0.045)_1px, transparent_1px)" backgroundSize="34px 34px"
```

- [ ] **Step 4: Add floating particle field**

42 particles — absolute positioned circles, varying size 2-7px, cyan/blue with glow box-shadow, scattered across section.

- [ ] **Step 5: Add eyebrow badge**

"Live AI Signal Stream" — rounded-full pill, cyan border, sparkles icon.

- [ ] **Step 6: Add title + description**

Title: "持續更新的 AI 訊號流" / "A continuously updated AI signal stream"
Description text (14px, white/68 opacity).

- [ ] **Step 7: Add 3 metric cards (grid, right side)**

Cards: "Sources: 10", "Refresh: 12h", "Output: Articles"
Each: glass card bg, rounded-2xl, border white/10, cyan icons, hover: bg white/[0.1].

- [ ] **Step 8: Add scroll-reveal on section entrance**

Cards stagger in: first card y:30→0, second card y:45→0 (150ms delay), third card y:60→0 (300ms delay).

---

## Task 6: Feature Cards — Spring Physics Hover

**Files:**
- Create: `FeatureCards` frame (3-col grid)

- [ ] **Step 1: Create section container**

```
<Frame name="FeatureCards" layout="grid" gridColumns="3" gap="24px" padding="80px 0" backgroundColor="white" darkBackgroundColor="black" />
```

- [ ] **Step 2: Design 3 feature cards**

Card content:
1. **Signal Intake** — icon: Radio, title: "10 Sources / 12h Cycle"
2. **Knowledge Layer** — icon: DatabaseZap, title: "Raw → Blog Intelligence"
3. **Editorial Control** — icon: ShieldCheck, title: "Human Before Scale"

- [ ] **Step 3: Apply glass background to cards**

```
backgroundColor="rgba(255,255,255,0.7)" backdropBlur="20px" border="1px solid rgba(228,228,231,0.6)"
dark: backgroundColor="rgba(11,11,13,0.7)" border="1px solid rgba(39,39,42,0.6)"
```

- [ ] **Step 4: Add spring-physics whileHover to each card**

```typescript
whileHover={{
  scale: 1.03,
  y: -8,
  boxShadow: "0 24px 60px -12px rgba(59,130,246,0.25)",
  transition: { type: "spring", stiffness: 400, damping: 28 }
}}
```

- [ ] **Step 5: Add icon glow on card hover**

Icon gets accent-500 with box-shadow "0 0 20px rgba(59,130,246,0.6)" on card whileHover.

- [ ] **Step 6: Add scroll-reveal stagger**

Grid cards enter with staggerChildren 0.12s, each card y: 40→0, opacity: 0→1.

---

## Task 7: Social Proof / Testimonials Strip

**Files:**
- Create: `SocialProof` frame

- [ ] **Step 1: Create logo strip (horizontal scroll, 5-6 logos)**

```
<Frame name="SocialProof" layout="stack" stackDirection="horizontal" gap="48px" overflow="hidden" padding="60px 0" />
```

- [ ] **Step 2: Add company names as text nodes**

Companies: "OpenAI", "Anthropic", "Google DeepMind", "Hugging Face", "Meta AI", "Microsoft AI"
Font: GF;Inter-600, 14px, uppercase, tracking wide, ink-400.

- [ ] **Step 3: Add "Featured in" eyebrow above logos**

"Featured in" — 10px, uppercase, tracking widest, muted color.

- [ ] **Step 4: Add scroll-reveal fade**

Entire strip fades in (opacity 0→1, y: 20→0) on viewport entry.

---

## Task 8: Newsletter CTA Section

**Files:**
- Create: `NewsletterCTA` frame

- [ ] **Step 1: Create CTA container (centered, max-w-2xl)**

```
<Frame name="NewsletterCTA" width="100%" maxWidth="680px" margin="0 auto" padding="80px 32px" textAlign="center" />
```

- [ ] **Step 2: Add large headline**

"Stay ahead of the AI signal" — font-display, 48px, bold, centered.

- [ ] **Step 3: Add subheadline**

"Join X subscribers receiving weekly AI intelligence briefings." — 16px, muted.

- [ ] **Step 4: Add email input + submit button (inline form)**

Input: rounded-full, border accent-300, placeholder "your@email.com"
Button: "Subscribe" — accent-600 bg, white text, rounded-full, whileHover scale 1.04 spring.

- [ ] **Step 5: Add privacy note below form**

"No spam. Unsubscribe anytime." — 12px, muted, below form.

- [ ] **Step 6: Add entrance animation**

Form elements stagger in: eyebrow → title → description → input → button (0.1s intervals).

- [ ] **Step 7: Add background radial glow**

Large soft blue glow behind CTA section (radial gradient, centered).

---

## Task 9: Footer

**Files:**
- Create: `Footer` frame

- [ ] **Step 1: Create footer frame**

```
<Frame name="Footer" width="100%" padding="48px 32px" backgroundColor="/ink/950" borderTop="1px solid rgba(255,255,255,0.06)" />
```

- [ ] **Step 2: Add logo + tagline (left side)**

Logo text: "RADAR" — Inter-700, 18px
Tagline: "AI Intelligence Protocol" — 12px, muted

- [ ] **Step 3: Add nav links (right side)**

Links: Privacy · Terms · GitHub · Twitter/X
Font: 12px, muted, hover accent color.

- [ ] **Step 4: Add copyright (bottom center)**

"© 2026 RADAR AI Studio. All rights reserved." — 11px, ink-500.

---

## Task 10: Global Scroll Orchestration & Polish

**Files:**
- Modify: All sections

- [ ] **Step 1: Add smooth scroll to html root**

Via Framer page settings: `scrollBehavior: smooth` (Framer default).

- [ ] **Step 2: Add scroll-progress indicator (top of page)**

Thin 2px accent-500 line at very top of viewport, width tied to scroll progress.

- [ ] **Step 3: Add section reveal orchestration**

Every section uses `whileInView` with:
```
whileInView={{ opacity: 1, y: 0 }}
viewport={{ once: true, margin: "-80px" }}
transition={{ duration: 0.65, ease: [0.16, 1, 0.3, 1] }}
```

Initial state: `opacity: 0, y: 32` for each section.

- [ ] **Step 4: Add cursor sparkle effect (optional)**

Code component: on mouse move, emit tiny particle sparkle at cursor position (accent-400 color, 4px circle, fades in 0.3s).

- [ ] **Step 5: Dark/light mode toggle wiring**

Navbar theme toggle must switch root page `data-theme` attribute — Framer supports this via `useTheme` equivalent.

---

## Task 11: Dark Mode Support

**Files:**
- Modify: All color values across sections

- [ ] **Step 1: Define dual-value colors per element**

For each background: `backgroundColor="white"` → `darkBackgroundColor="black"`
For text: use text styles that resolve to correct colors for each theme.

- [ ] **Step 2: Test dark mode on each section**

Verify: Hero background, Navbar glass, ticker pills, card backgrounds, footer all switch correctly.

---

## Self-Review Checklist

- [ ] All 10 tasks have complete steps with code shown
- [ ] No "TBD", "TODO", or placeholder steps
- [ ] Framer MCP tool names used correctly (`updateXmlForNode`, `manageColorStyle`, `manageTextStyle`, `getNodeXml`)
- [ ] Color palette matches existing tailwind config (ink + accent blue)
- [ ] Each animation token (spring-bounce, ease-out-expo, stagger) applied per task
- [ ] Dark mode handled via dual-value attributes across all sections
- [ ] Scroll orchestration applied to ALL sections (once: true, margin: -80px)
- [ ] File paths and commands are exact

---

**Plan complete and saved to `docs/superpowers/plans/2026-05-25-framer-landing-page-animated.md`.**

Two execution options:

**1. Subagent-Driven (recommended)** — I dispatch a fresh subagent per task, review between tasks, fast iteration

**2. Inline Execution** — Execute tasks in this session using executing-plans, batch execution with checkpoints

Which approach?