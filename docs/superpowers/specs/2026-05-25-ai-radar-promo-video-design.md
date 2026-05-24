# AI Radar 2-Minute Promo Video Design

## Spec

**What:** 120-second (3600 frames @ 30fps) animated video explaining AI Radar and why viewers should subscribe.

**Anxiety Structure:** "The gap is widening" — social comparison, FOMO, fear of being left behind.

**Visual Style:** Grainy tech-footage aesthetic — dark backgrounds, noise/grain texture overlay, green/amber data overlays (trading floor / terminal vibe), rapid-fire stat callouts with red warning accents.

**Animation Rules:** All via `useCurrentFrame()` + `interpolate()` + `Easing.bezier`. No CSS transitions. No Tailwind animations.

---

## Video Arc

| Time | Frames | Section | Visual | Anxiety Trigger |
|---|---|---|---|---|
| 0:00–0:15 | 0–450 | **HOOK** | Dark screen. Particle noise. Count-up timer "3.2B AI articles processed this month" | "Something massive is happening without you" |
| 0:15–0:45 | 450–1350 | **"While you were..."** | Split-screen: left = generic person doing mundane task; right = peer using AI Radar, achieving more | Social comparison, "they're ahead" anxiety |
| 0:45–1:15 | 1350–2250 | **"The gap is widening"** | Diverging line chart animates itself. Adoption rate curves. Rapid-fire stat cards (4.5x layoff risk, 12x job demand, 70% AI面试) | Fear of falling behind |
| 1:15–1:50 | 2250–3300 | **"Here's what's flying under your radar"** | Content cards fly in: tool releases, security warnings, job market shifts — each with impact pulse animation | Reveals value + creates info-FOMO |
| 1:50–2:00 | 3300–3600 | **CTA** | "AI Radar — Every morning, 3 things that matter." Bell icon pulses. Particle absorption into subscribe button | Salvation: anxiety resolved by subscribing |

---

## Composition Structure

```
AbsoluteFill (dark #0a0a0a background)
├── Noise/Grain Overlay (full screen, subtle opacity)
├── Sequence HOOK (0–450)
│   └── CounterAnimation component
├── Sequence "While you were" (450–1350)
│   ├── SplitScreenLayout
│   ├── LeftPanel: "Normal person" static visual
│   └── RightPanel: AI Radar content stream
├── Sequence "Gap Widening" (1350–2250)
│   ├── DivergingLineChart (self-drawing SVG path)
│   └── StatCard[] (3 cards, staggered entrance)
├── Sequence "Under Your Radar" (2250–3300)
│   └── ContentCard[] (5 cards, fly-in from edges)
└── Sequence CTA (3300–3600)
    └── SubscribeButton (pulsing, particle absorption)
```

---

## Component Inventory

### NoiseOverlay
Full-screen `<div>` with CSS `background-image: url("data:image/svg+xml,...")` grain pattern. Opacity ~0.03–0.05. No animation.

### CounterAnimation
- Starts at 0, counts up to target number over `durationInFrames`
- Uses `interpolate(frame, [start, end], [0, target], {extrapolateRight: "clamp"})`
- Font: monospace, large (80px), neon green (#00ff88)
- Triggers: large number appearing with scale pop

### SplitScreenLayout
- Left 50%: dark visual with "you" silhouette icon
- Right 50%: scrolling AI Radar article cards (simplified)
- Divider: vertical glowing line

### DivergingLineChart
- SVG `<path>` with `stroke-dashoffset` animation (draw-on effect)
- Two lines: "Your knowledge" (flat/descending) vs "AI capability" (steep ascending)
- Labels animate in after line draw completes

### StatCard
- Dark glass card (#1a1a1a, border: 1px #333)
- Large number in red (#ff4444) or amber (#ffaa00)
- Small descriptor text below
- Pulse animation: scale 1.0→1.05→1.0 loop
- Staggered: frame offset per card

### ContentCard
- Card with category tag (color-coded by type)
- Title + short excerpt
- "Impact score" bar (animated width)
- Entrance: `translateY` from ±100 with opacity fade

### SubscribeButton
- Large rounded rect, neon green border
- Bell icon (SVG) with pulse scale animation
- Particle burst on idle, particle absorption on hover state

---

## Color Palette

| Role | Hex |
|---|---|
| Background | #0a0a0a |
| Surface | #1a1a1a |
| Border | #333333 |
| Text primary | #ffffff |
| Text secondary | #888888 |
| Accent green (CTA) | #00ff88 |
| Accent red (danger) | #ff4444 |
| Accent amber (warning) | #ffaa00 |
| Data green | #00cc66 |

---

## Typography

- All text: system sans-serif or "Courier New" monospace for data elements
- Title: 80–120px, bold, white
- Stat numbers: 80px, monospace, accent color
- Card titles: 28px, bold, white
- Card body: 18px, #888

---

## Technical Approach

- Single Remotion Composition (`id="AIRadarPromo"`)
- One file: `src/Composition.tsx` — all components inline for simplicity
- Duration: 3600 frames, FPS 30
- Resolution: 1280×720 (or 1920×1080)
- No external assets — all visuals generated via SVG + CSS
- Grain effect: inline SVG data URI background

---

## Verification

1. Hot-reload preview at http://localhost:3003 — each sequence plays in order
2. Render single frame at key timestamps: `npx remotion still AIRadarPromo --scale=0.5 --frame=30`
3. Final render: `npx remotion render AIRadarPromo out/ai-radar-promo.mp4`