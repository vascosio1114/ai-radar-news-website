'use client';

import { useMemo, useRef } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { generateMockActivityPoints, getClusterPhase } from './data/mockData';
import { latLngToVector3 } from './utils/geo';

interface DataPointSystemProps {
  rotation: number;
  onPointClick?: (pointId: string) => void;
}

export function DataPointSystem({ rotation, onPointClick }: DataPointSystemProps) {
  const points = useMemo(() => generateMockActivityPoints(), []);

  const { positions, colors, sizes, phases } = useMemo(() => {
    const positions = new Float32Array(points.length * 3);
    const colors = new Float32Array(points.length * 3);
    const sizes = new Float32Array(points.length);
    const phases = new Float32Array(points.length);

    points.forEach((point, i) => {
      const vec = latLngToVector3(point.lat, point.lng, 1.02);
      positions[i * 3] = vec.x;
      positions[i * 3 + 1] = vec.y;
      positions[i * 3 + 2] = vec.z;

      const intensity = point.intensity;
      const isHotspot = intensity > 0.9;
      colors[i * 3] = isHotspot ? 1.0 : 0.94 * intensity;
      colors[i * 3 + 1] = isHotspot ? 0.9 : 0.27 * intensity;
      colors[i * 3 + 2] = isHotspot ? 0.9 : 0.27 * intensity;

      sizes[i] = isHotspot ? 0.08 : 0.03 + intensity * 0.05;
      phases[i] = getClusterPhase(point.cluster);
    });

    return { positions, colors, sizes, phases };
  }, [points]);

  const geometry = useMemo(() => {
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geo.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    geo.setAttribute('size', new THREE.BufferAttribute(sizes, 1));
    geo.setAttribute('phase', new THREE.BufferAttribute(phases, 1));
    return geo;
  }, [positions, colors, sizes, phases]);

  const material = useMemo(
    () =>
      new THREE.ShaderMaterial({
        uniforms: {
          time: { value: 0 },
          baseIntensity: { value: 5.0 },
          hotspotIntensity: { value: 15.0 },
        },
        vertexShader: `
          attribute float size;
          attribute float phase;
          attribute vec3 color;
          varying vec3 vColor;
          varying float vPhase;
          uniform float time;

          void main() {
            vColor = color;
            vPhase = phase;
            float pulse = 0.8 + 0.2 * sin(time * 0.3 * 3.14159 * 2.0 + phase);
            vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
            gl_PointSize = size * pulse * (300.0 / -mvPosition.z);
            gl_Position = projectionMatrix * mvPosition;
          }
        `,
        fragmentShader: `
          varying vec3 vColor;
          uniform float baseIntensity;
          uniform float hotspotIntensity;

          void main() {
            float dist = length(gl_PointCoord - vec2(0.5));
            if (dist > 0.5) discard;
            float core = 1.0 - smoothstep(0.0, 0.15, dist);
            float glow = 1.0 - smoothstep(0.1, 0.5, dist);
            vec3 coreColor = vec3(1.0, 1.0, 1.0);
            vec3 glowColor = vColor;
            float alpha = core + glow * 0.6;
            vec3 finalColor = mix(glowColor, coreColor, core * 0.8);
            gl_FragColor = vec4(finalColor, alpha);
          }
        `,
        transparent: true,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
      }),
    []
  );

  const materialRef = useRef<THREE.ShaderMaterial>(material);

  useFrame(({ clock }) => {
    if (materialRef.current) {
      materialRef.current.uniforms.time.value = clock.getElapsedTime();
    }
  });

  return <points geometry={geometry} material={materialRef.current} />;
}