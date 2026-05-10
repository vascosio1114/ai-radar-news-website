'use client';

import { useRef } from 'react';
import { OrbitControls } from '@react-three/drei';
import type { OrbitControls as OrbitControlsType } from 'three-stdlib';

interface InteractionControllerProps {
  autoRotateSpeed?: number;
  minDistance?: number;
  maxDistance?: number;
  enableDamping?: boolean;
  dampingFactor?: number;
}

export function InteractionController({
  autoRotateSpeed = 0.5,
  minDistance = 1.5,
  maxDistance = 4.0,
  enableDamping = true,
  dampingFactor = 0.05,
}: InteractionControllerProps) {
  const controlsRef = useRef<OrbitControlsType>(null);

  return (
    <OrbitControls
      ref={controlsRef}
      enableDamping={enableDamping}
      dampingFactor={dampingFactor}
      rotateSpeed={0.5}
      minDistance={minDistance}
      maxDistance={maxDistance}
      autoRotate
      autoRotateSpeed={autoRotateSpeed}
      enablePan={false}
    />
  );
}