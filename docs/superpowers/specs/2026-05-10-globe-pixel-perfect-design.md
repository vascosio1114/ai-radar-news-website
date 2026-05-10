# Pixel-Perfect 3D Interactive Globe — Design Specification

**Date:** 2026-05-10
**Status:** Draft
**Reference Image:** (AI-generated reference showing dark globe with glowing red data points, wireframe grid, floating glassmorphic panels)

---

## 1. Overview

A reusable, data-driven 3D globe component that replicates the visual aesthetic of a dark, cybernetic data visualization globe with glowing red data points, a subtle wireframe grid, atmospheric fresnel glow, bokeh particle background, depth-of-field post-processing, and floating glassmorphic UI panels.

**Key constraints:**
- Built on `react-three-fiber` + `@react-three/drei` + `@react-three/postprocessing`
- Mock data now, Supabase query interface ready for later
- Subagent-driven parallel implementation
- Pixel-precise color, shader, and animation values — no "tune until it looks right"

---

## 2. Color Palette

| Element | Hex | Alpha / Notes |
|---------|-----|---------------|
| Background void | `#020205` | Opaque — near-black with slight blue-cool tint |
| Globe land base | `#0B0C10` | Opaque — dark charcoal |
| Globe terrain variation | `#151620` | Opaque — slightly lighter charcoal for variation |
| Wireframe grid lines | `#1e242b` | 15–22% — very subtle, barely visible |
| Atmosphere fresnel rim | `#1a1c22` | Tight rim highlight at sphere edges |
| Data point core (hottest) | `#ffffff` | Emissive — white center of brightest points |
| Data point glow | `#ff0000` | Emissive — vibrant red |
| Data point glow secondary | `#e60000` | Emissive — slightly darker red for falloff |
| UI panel background | `#0d0d12` | 65% — blurred glass effect |
| UI panel border | `rgba(255,255,255,0.08)` | 8% — subtle edge highlight |
| UI panel text primary | `rgba(255,255,255,0.9)` | 90% |
| UI panel text secondary | `rgba(255,255,255,0.6)` | 60% |
| Icon — lightning bolt | `#ffcc00` | Yellow — panel 1 |
| Icon — flame | `#ff3b3b` | Red — panel 2 |
| Icon — trending arrow | `#00a2ff` | Blue — panel 3 |
| Particle dust | `rgba(180, 100, 60, 0.3)` | Muted warm reds/browns at low opacity |
| Vignette overlay | `rgba(0,0,0,0.4)` | 40% at corners, 0% at center |

---

## 3. Layout & Dimensions

| Property | Value | Notes |
|----------|-------|-------|
| Globe diameter | 88% of canvas height | Fills most of the vertical space |
| Globe X offset | -15% from canvas center | Globe shifted slightly left |
| Globe Y position | Vertically centered | 50% of canvas height |
| Panel width | 18% of canvas width | Right side, 3 panels stacked |
| Panel height | 12% of canvas height | Each panel |
| Panel corner radius | 15px at 1080p | Scales with resolution |
| Panel gap (vertical) | 4% of canvas height | Space between panels |
| Panel X position | Right side, ~5% from edge | Horizontally centered on right third |
| Panel Y position (stacked) | Top, center, bottom | Evenly distributed vertically |
| Wireframe sphere scale | 1.005× globe radius | Just outside the globe surface |
| Grid line spacing | 15° latitude and longitude | Both great-circle arcs |

---

## 4. Globe Sphere — Geometry & Material

### Geometry
```
SphereGeometry args: [radius, 128, 128]
radius: 1.0 (normalized, scaled via transform)
```

### Displacement
```
displacement map: world heightmap (e.g., ETOPO1 or procedural)
displacement intensity: 0.02 (relative to sphere radius)
normal map: derived from heightmap for terrain detail
```

### Material (PBR)
```glsl
roughness: 0.85
metalness: 0.0
fresnelPower: 5.0
fresnelColor: #1a1c22
map: base texture (dark landmass, minimal detail)
normalMap: terrain normal map
normalScale: [1.0, 1.0]
displacementMap: height map
displacementScale: 0.02
```

---

## 5. Wireframe Grid

```
geometry: SphereGeometry [1.005, 64, 64]
material: LineBasicMaterial
color: #1e242b
opacity: 0.18
transparent: true
linewidth: 1 (WebGL default — thin lines)
```

**Grid construction:**
- Latitude lines every 15° from -75° to +75° (11 lines)
- Longitude lines every 15° from -180° to +180° (24 lines)
- Lines rendered as great-circle arcs on the sphere surface

---

## 6. Data Point System

### Geometry
```
Point sprites rendered as instanced points
Each point: [x, y, z] position on sphere surface at radius 1.02
Size: 0.03 to 0.08 units (varies with intensity)
```

### Material (Custom Shader)
```glsl
vertexShader:
  - pass position, color, intensity as attributes
  - scale point size by intensity
  - billboard: true (sprites always face camera)

fragmentShader:
  - radial gradient: white core → red glow → transparent
  - emissive output for bloom interaction
  - pulse modulation via time uniform
```

### Emissive Values
```
base intensity: 5.0
hotspot intensity (e.g., NYC, Chicago, LA, London, Tokyo): 15.0
blending: THREE.AdditiveBlending
depthWrite: false
```

### Pulse Animation
```
frequency: 0.3 Hz (one pulse every 3.3 seconds)
ease: sine in/out
phase variation: each cluster has randomized phase offset
  (prevents sync pulsing — clusters pulse independently)
cluster definition: points within same region share phase
```

### Cluster Regions (for phase variation)
```
North America East Coast: phase = 0.0
Europe: phase = 1.1
Asia: phase = 2.2
South America: phase = 3.3
Other: phase = 4.4
```

---

## 7. Atmosphere / Fresnel Shell

```
geometry: SphereGeometry [1.08, 32, 32]
material: ShaderMaterial (custom fresnel shader)

fresnelShader:
  uniform: fresnelPower = 5.0
  uniform: fresnelColorInner = #1a1c22
  uniform: fresnelColorOuter = #0a0a10
  uniform: opacity = 0.4
  side: THREE.BackSide

Fresnel calculation:
  fresnel = pow(1.0 - dot(viewDirection, normal), fresnelPower)
  color = mix(fresnelColorInner, fresnelColorOuter, fresnel)
  alpha = fresnel * opacity
```

**Additional atmosphere layer:**
```
geometry: SphereGeometry [1.12, 32, 32]
material: meshBasicMaterial
color: #000000
opacity: 0.02
side: THREE.BackSide
```

---

## 8. Post-Processing Pipeline

**Pipeline order:**
```
[Scene Render]
    ↓
[UnrealBloomPass]         — glow on emissive elements
    ↓
[BokehPass / DOF]          — shallow depth of field on edges
    ↓
[VignettePass]             — dark corners
    ↓
[Output Pass]
```

### UnrealBloomPass
```javascript
threshold: 0.65      // only bright emissive elements bloom
intensity: 1.75      // strong glow (mid-range of 1.5–2.0)
radius: 0.85         // large blur radius (~10% canvas width)
resolutionScale: 0.5 // half-res for performance
```

### BokehPass (DOF)
```javascript
focus: 2.5           // focal distance centered on globe
aperture: 0.015      // subtle bokeh
maxblur: 0.01        // gentle edge blur
```

### VignettePass
```javascript
offset: 1.0          // vignette spread
darkness: 0.6        // corner darkness (40% at edges)
```

### Background Blur (for UI panels)
```
Implemented as CSS backdrop-filter on DOM overlay:
backdrop-filter: blur(10px) saturate(150%)
Applied to .glass-panel class
```

---

## 9. Background Particle Field

| Property | Value |
|----------|-------|
| Particle count | ~150 |
| Particle size | 1px to 3px (randomized per particle) |
| Motion | Brownian drift at 0.002 units/frame |
| 3D distribution | Random volume around globe, z-depth -5 to +5 |
| Density bias | Higher concentration near North America and Europe |
| Color | `rgba(180, 100, 60, 0.3)` — muted warm dust |
| Blending | AdditiveBlending |
| Depth test | false (always rendered behind globe) |

**Implementation:** Use `THREE.Points` with custom shader that applies size attenuation and soft alpha falloff.

---

## 10. Floating UI Panels

### Panel Structure (3 panels, stacked right side)
```
Panel dimensions:
  width: 18% canvas width
  height: 12% canvas height
  corner-radius: 15px at 1080p
  gap: 4% canvas height between panels
  position: right side, vertically centered in thirds
```

### Panel Visual Spec
```css
background: rgba(13, 13, 18, 0.65);
border: 1px solid rgba(255, 255, 255, 0.08);
border-radius: 15px;
backdrop-filter: blur(10px) saturate(150%);
box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4);
```

### Panel Content

**Panel 1 (top):**
- Icon: Lightning bolt, color `#ffcc00`, 24px size
- Label: "ALERTS" — 11px, letter-spacing 0.15em, color `rgba(255,255,255,0.6)`
- Value: "247" — 28px bold, color `#ffcc00`
- Subtext: "active today" — 11px, color `rgba(255,255,255,0.4)`

**Panel 2 (middle):**
- Icon: Flame, color `#ff3b3b`, 24px size
- Label: "TRENDING" — 11px, letter-spacing 0.15em, color `rgba(255,255,255,0.6)`
- Value: "12" — 28px bold, color `#ff3b3b`
- Subtext: "tools this week" — 11px, color `rgba(255,255,255,0.4)`

**Panel 3 (bottom):**
- Icon: Trending upward arrow, color `#00a2ff`, 24px size
- Label: "ACTIVE" — 11px, letter-spacing 0.15em, color `rgba(255,255,255,0.6)`
- Value: "89" — 28px bold, color `#00a2ff`
- Subtext: "companies" — 11px, color `rgba(255,255,255,0.4)`

### Panel Animation
```
Hover state:
  scale: 1.02
  border-color: rgba(255, 255, 255, 0.15)
  transition: 0.2s ease
Icon breathing:
  intensity oscillation: ±5% over 2 seconds
  ease: sine in/out
  loop: infinite
```

---

## 11. Interaction State Machine

### States

| State | Trigger | Behavior |
|-------|---------|----------|
| `idle` | Default | Globe auto-rotates at 0.015 rad/sec, data points pulse |
| `dragging` | Mouse down + move | OrbitControls active, auto-rotation paused |
| `hovering_point` | Mouse over data point | Point scales 1.5×, glow intensity ×2.0, cursor: pointer |
| `clicking_point` | Mouse click on data point | Opens detail panel/modal with lat/lng, intensity, label |
| `hovering_panel` | Mouse over panel | Panel scales 1.02×, border brightens |
| `clicking_panel` | Mouse click on panel | Panel expands or navigates to detail view |
| `zooming` | Scroll wheel | Zoom in/out, min distance 1.5, max distance 4.0 |

### Camera Controls (OrbitControls)
```javascript
enableDamping: true
dampingFactor: 0.05
rotateSpeed: 0.5
minDistance: 1.5
maxDistance: 4.0
autoRotate: true
autoRotateSpeed: 0.5  // ~0.015 rad/sec in radians per frame
enablePan: false
```

---

## 12. Data Layer Interface

### Mock Data Structure
```typescript
interface ActivityPoint {
  id: string;
  lat: number;        // -90 to +90
  lng: number;        // -180 to +180
  intensity: number;  // 0.5 to 1.0
  label: string;      // e.g., "New York City", "London"
  category: 'news' | 'alert' | 'trend';
  cluster: string;    // for phase variation grouping
}

interface DataPointCluster {
  name: string;       // e.g., "North America East Coast"
  phase: number;     // pulse phase offset (0 to 2π)
  center: { lat: number; lng: number };
  radius: number;    // approximate cluster radius in degrees
}
```

### Supabase Query Interface (for future)
```typescript
// Mock for now, real query later:
async function fetchActivityPoints(): Promise<ActivityPoint[]> {
  // Current: returns mock data
  // Future: return await supabase
  //   .from('activity_points')
  //   .select('*')
  //   .gte('intensity', 0.5)
}
```

### Data Regions (for cluster phase assignment)
```
North America East Coast: lat [25, 55], lng [-130, -60]
Europe: lat [35, 60], lng [-15, 40]
Asia: lat [20, 50], lng [100, 145]
Middle East/South Asia: lat [35, 50], lng [60, 100]
South America: lat [-35, -10], lng [-80, -50]
Africa: lat [-20, 10], lng [15, 45]
Other: default phase
```

---

## 13. Animation Specifications

| Element | Property | Value |
|---------|----------|-------|
| Globe rotation | Y axis | 0.015 rad/sec (auto-rotate) |
| Data point pulse | emissive intensity | oscillates 0.8× to 1.0× of base over 3.3s |
| Data point pulse | ease | sine in/out |
| Data point pulse | phase offset | varies by cluster (see section 6) |
| Icon breathing | intensity | ±5% over 2 seconds |
| Icon breathing | ease | sine in/out |
| Icon breathing | loop | infinite |
| Particle drift | position | Brownian motion, 0.002 units/frame |
| Panel hover | scale | 1.0 → 1.02 over 0.2s |
| Panel hover | ease | ease-out |
| Point hover | scale | 1.0 → 1.5 |
| Point hover | glow intensity | ×2.0 |

---

## 14. Subagent Task Definitions

For parallel subagent execution, implementation splits into 8 independent tracks:

### Agent: `globe-terrain-agent`
- SphereGeometry (128×128 segments)
- PBR material with roughness 0.85, metalness 0.0
- Displacement map setup (procedural heightmap)
- Normal map generation from heightmap
- Fresnel rim lighting on globe edges

### Agent: `grid-agent`
- Wireframe sphere at 1.005× scale
- 15° latitude lines (-75° to +75°)
- 15° longitude lines (-180° to +180°)
- LineBasicMaterial, color `#1e242b`, opacity 0.18, transparent

### Agent: `data-points-agent`
- Instanced point sprites on sphere surface
- Custom shader: radial gradient white core → red → transparent
- Pulse animation per cluster (0.3 Hz, sine in/out, phase-varied)
- Emissive values: base 5.0, hotspot 15.0
- Hover state: scale 1.5×, intensity ×2.0
- Click state: opens detail panel

### Agent: `atmosphere-agent`
- Fresnel shader sphere at 1.08× scale, BackSide
- fresnelPower: 5.0, inner color `#1a1c22`, outer `#0a0a10`, opacity 0.4
- Second layer at 1.12×, color `#000000`, opacity 0.02

### Agent: `postprocessing-agent`
- Multi-pass pipeline: Render → Bloom → DOF → Vignette
- UnrealBloomPass: threshold 0.65, intensity 1.75, radius 0.85
- BokehPass: focus 2.5, aperture 0.015, maxblur 0.01
- VignettePass: offset 1.0, darkness 0.6

### Agent: `particle-bg-agent`
- 150 background particles as THREE.Points
- Size 1–3px, color `rgba(180,100,60,0.3)`
- Brownian drift motion at 0.002 units/frame
- 3D volume distribution, denser near red regions
- AdditiveBlending, depthTest: false

### Agent: `ui-panels-agent`
- 3 glassmorphic panels, positioned right side
- CSS: backdrop-filter blur(10px), background rgba(13,13,18,0.65)
- Border rgba(255,255,255,0.08), corner-radius 15px
- Icons: lightning `#ffcc00`, flame `#ff3b3b`, arrow `#00a2ff`
- Hover: scale 1.02, border brightens
- Icon breathing animation: ±5% over 2s

### Agent: `integration-agent`
- OrbitControls with damping, auto-rotate 0.5 speed
- Zoom limits: minDistance 1.5, maxDistance 4.0
- Interaction state machine (idle, dragging, hovering_point, etc.)
- Data layer: fetchActivityPoints() interface
- Panel positioning relative to canvas
- Supabase mock → real swap interface

---

## 15. File Structure

```
src/
├── components/
│   └── globe/
│       ├── GlobeScene.tsx           ← root wrapper, canvas, camera
│       ├── GlobeSphere.tsx          ← terrain + displacement + PBR material
│       ├── WireframeGrid.tsx         ← lat/lon grid lines
│       ├── DataPointSystem.tsx       ← instanced sprites + pulse shader
│       ├── AtmosphereShell.tsx       ← fresnel glow layers
│       ├── ParticleField.tsx         ← background bokeh particles
│       ├── FloatingPanels.tsx        ← 3 glassmorphic panels
│       ├── PostProcessing.tsx        ← bloom + DOF + vignette pipeline
│       ├── InteractionController.tsx ← OrbitControls + state machine
│       └── data/
│           ├── mockData.ts          ← mock activity points
│           └── types.ts             ← ActivityPoint, Cluster interfaces
├── hooks/
│   ├── useGlobeData.ts              ← data fetching interface
│   └── useGlobeInteraction.ts        ← interaction state machine
└── app/
    └── globe/
        └── page.tsx                  ← standalone globe showcase page
```

---

## 16. Acceptance Criteria

Each component must match its spec before the integration agent wires them together:

| Component | Criterion |
|-----------|-----------|
| GlobeSphere | Dark textured sphere with visible terrain relief on land masses |
| WireframeGrid | Subtle 15° grid barely visible, doesn't distract from data points |
| DataPointSystem | Red glowing dots concentrated on major landmasses, white cores on hotspots |
| DataPointSystem | Dots pulse asynchronously in clusters, not in sync |
| AtmosphereShell | Thin fresnel rim visible at sphere edges |
| PostProcessing | Bloom visible on all red emissive elements; edges have subtle DOF blur |
| ParticleField | ~150 soft bokeh particles visible in background, drifting slowly |
| FloatingPanels | 3 panels visible on right, icons colored yellow/red/blue, blur effect visible |
| Interaction | Drag rotates globe, scroll zooms, hover shows tooltip, click opens panel |
| DataLayer | fetchActivityPoints() returns mock data; interface ready for Supabase swap |

---

*Spec written: 2026-05-10. Next step: invoke writing-plans skill to create implementation plan.*