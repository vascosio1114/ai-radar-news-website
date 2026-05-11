// src/components/globe/ConnectionArcs.tsx
'use client';

import { useMemo, useRef, useEffect } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { geoInterpolate } from 'd3-geo';
import { generateMockActivityPoints } from './data/mockData';
import { coordinateToPosition } from './utils/geo';

const GLOBE_RADIUS = 1.0;
const CURVE_MIN_ALTITUDE = 0.08;
const CURVE_MAX_ALTITUDE = 0.25;
const MAX_ARCS = 30;
const ARC_POINTS = 64;

const vertexShader = `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const fragmentShader = `
  uniform vec3 uColor;
  uniform float uOpacity;
  varying vec2 vUv;

  void main() {
    float alpha = uOpacity * (1.0 - abs(vUv.y - 0.5) * 1.6);
    gl_FragColor = vec4(uColor, max(0.0, alpha));
  }
`;

export function ConnectionArcs() {
  const groupRef = useRef<THREE.Group>(null);
  const rotationRef = useRef(0);

  const { arcData, materials } = useMemo(() => {
    const points = generateMockActivityPoints();
    const hotPoints = points.filter((p) => p.intensity >= 0.85);

    const arcs: { start: THREE.Vector3; end: THREE.Vector3; mid1: THREE.Vector3; mid2: THREE.Vector3 }[] = [];

    for (let i = 0; i < hotPoints.length && arcs.length < MAX_ARCS; i++) {
      for (let j = i + 1; j < hotPoints.length && arcs.length < MAX_ARCS; j++) {
        const dist = Math.abs(hotPoints[i].lng - hotPoints[j].lng) + Math.abs(hotPoints[i].lat - hotPoints[j].lat);
        if (dist > 5 && dist < 120) {
          const start = coordinateToPosition(hotPoints[i].lat, hotPoints[i].lng, GLOBE_RADIUS);
          const end = coordinateToPosition(hotPoints[j].lat, hotPoints[j].lng, GLOBE_RADIUS);

          const altitude = Math.min(Math.max(start.distanceTo(end) * 0.45, CURVE_MIN_ALTITUDE), CURVE_MAX_ALTITUDE);

          const interpolate = geoInterpolate([hotPoints[i].lng, hotPoints[i].lat], [hotPoints[j].lng, hotPoints[j].lat]);
          const midCoord1 = interpolate(0.25);
          const midCoord2 = interpolate(0.75);

          const mid1 = coordinateToPosition(midCoord1[1], midCoord1[0], GLOBE_RADIUS + altitude);
          const mid2 = coordinateToPosition(midCoord2[1], midCoord2[0], GLOBE_RADIUS + altitude);

          arcs.push({ start, end, mid1, mid2 });
        }
      }
    }

    const mat = new THREE.ShaderMaterial({
      vertexShader,
      fragmentShader,
      uniforms: {
        uColor: { value: new THREE.Color('#EF4444') },
        uOpacity: { value: 0.5 },
      },
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    });

    return { arcData: arcs, materials: mat };
  }, []);

  const geometries = useMemo(() => {
    return arcData.map(({ start, end, mid1, mid2 }) => {
      const curve = new THREE.CubicBezierCurve3(start, mid1, mid2, end);
      const pts = curve.getPoints(ARC_POINTS);
      const positions = new Float32Array(ARC_POINTS * 3);
      const uvs = new Float32Array(ARC_POINTS * 2);

      for (let i = 0; i < ARC_POINTS; i++) {
        const p = pts[i].normalize();
        positions[i * 3] = p.x;
        positions[i * 3 + 1] = p.y;
        positions[i * 3 + 2] = p.z;
        uvs[i * 2] = i / (ARC_POINTS - 1);
        uvs[i * 2 + 1] = i / (ARC_POINTS - 1);
      }

      const geo = new THREE.BufferGeometry();
      geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
      geo.setAttribute('uv', new THREE.BufferAttribute(uvs, 2));
      return geo;
    });
  }, [arcData]);

  useFrame((_, delta) => {
    if (groupRef.current) {
      rotationRef.current += delta * 0.015;
      groupRef.current.rotation.y = rotationRef.current;
    }
  });

  return (
    <group ref={groupRef}>
      {geometries.map((geo, i) => (
        <primitive key={i} object={new THREE.Line(geo, materials)} />
      ))}
    </group>
  );
}