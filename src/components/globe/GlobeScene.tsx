'use client';

import { Canvas } from '@react-three/fiber';
import { Suspense } from 'react';
import { GlobeSphere } from './GlobeSphere';
import { ConnectionArcs } from './ConnectionArcs';
import { CountryBorders } from './CountryBorders';
import { WireframeGrid } from './WireframeGrid';
import { DataPointSystem } from './DataPointSystem';
import { AtmosphereShell } from './AtmosphereShell';
import { ParticleField } from './ParticleField';
import { PostProcessing } from './PostProcessing';
import { InteractionController } from './InteractionController';
import type { ActivityPoint } from './data/types';

interface GlobeSceneProps {
  onPointClick?: (point: ActivityPoint) => void;
}

export function GlobeScene({ onPointClick }: GlobeSceneProps) {
  return (
    <Canvas
      camera={{ position: [0, 0, 2.5], fov: 50 }}
      style={{ background: '#020205' }}
      gl={{
        antialias: false,
        alpha: false,
        powerPreference: 'high-performance',
        preserveDrawingBuffer: false,
        failIfMajorPerformanceCaveat: false,
      }}
    >
      <Suspense fallback={null}>
        {/* Lighting */}
        <ambientLight intensity={0.3} />
        <pointLight position={[5, 5, 5]} intensity={1} color="#ffffff" />
        <pointLight position={[-3, 2, 3]} intensity={0.5} color="#EF4444" />

        {/* Globe layers */}
        <GlobeSphere />
        <CountryBorders />
        <ConnectionArcs />
        <WireframeGrid />
        <DataPointSystem onPointClick={onPointClick} />
        <AtmosphereShell />
        <ParticleField />

        {/* Interaction */}
        <InteractionController />

        {/* Post-processing */}
        <PostProcessing />
      </Suspense>
    </Canvas>
  );
}