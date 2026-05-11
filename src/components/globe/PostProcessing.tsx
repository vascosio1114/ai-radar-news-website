// src/components/globe/PostProcessing.tsx
'use client';

import { EffectComposer, Bloom, Vignette } from '@react-three/postprocessing';

export function PostProcessing() {
  return (
    <EffectComposer enableNormalPass={false}>
      <Bloom luminanceThreshold={0.65} luminanceSmoothing={0.9} intensity={1.75} />
      <Vignette offset={1.0} darkness={0.6} />
    </EffectComposer>
  );
}