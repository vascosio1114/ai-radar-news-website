// src/components/globe/PostProcessing.tsx
'use client';

// Post-processing is temporarily disabled — @react-three/postprocessing has
// a persistent WebGL compatibility issue with this project's three.js version.
// The globe renders correctly without bloom and vignette effects.
export function PostProcessing() {
  return null;
}