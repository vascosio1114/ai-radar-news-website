'use client';

import { useMemo, useRef, useState, useCallback } from 'react';
import * as THREE from 'three';
import { useFrame, useThree } from '@react-three/fiber';
import { generateMockActivityPoints, getClusterPhase } from './data/mockData';
import { latLngToVector3 } from './utils/geo';
import type { ActivityPoint } from './data/types';

interface DataPointSystemProps {
  onPointClick?: (point: ActivityPoint) => void;
  onHoverChange?: (point: ActivityPoint | null) => void;
}

export function DataPointSystem({ onPointClick, onHoverChange }: DataPointSystemProps) {
  const points = useMemo(() => generateMockActivityPoints(), []);
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const pointsMeshRef = useRef<THREE.Points>(null);
  const rotationRef = useRef(0);
  const { camera, raycaster, pointer } = useThree();

  const { positions, colors, sizes, phases, ids } = useMemo(() => {
    const positions = new Float32Array(points.length * 3);
    const colors = new Float32Array(points.length * 3);
    const sizes = new Float32Array(points.length);
    const phases = new Float32Array(points.length);
    const ids = new Float32Array(points.length);

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
      ids[i] = i;
    });

    return { positions, colors, sizes, phases, ids };
  }, [points]);

  const geometry = useMemo(() => {
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geo.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    geo.setAttribute('size', new THREE.BufferAttribute(sizes, 1));
    geo.setAttribute('phase', new THREE.BufferAttribute(phases, 1));
    geo.setAttribute('id', new THREE.BufferAttribute(ids, 1));
    return geo;
  }, [positions, colors, sizes, phases, ids]);

  const material = useMemo(
    () =>
      new THREE.ShaderMaterial({
        uniforms: {
          time: { value: 0 },
          baseIntensity: { value: 5.0 },
          hotspotIntensity: { value: 15.0 },
          hoveredId: { value: -1 },
        },
        vertexShader: `
          attribute float size;
          attribute float phase;
          attribute vec3 color;
          attribute float id;
          varying vec3 vColor;
          varying float vPhase;
          varying float vId;
          uniform float time;
          uniform float hoveredId;

          void main() {
            vColor = color;
            vPhase = phase;
            vId = id;
            float pulse = 0.8 + 0.2 * sin(time * 0.3 * 3.14159 * 2.0 + phase);
            float isHovered = step(abs(id - hoveredId), 0.5);
            float scale = 1.0 + isHovered * 0.5;
            vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
            gl_PointSize = size * pulse * scale * (300.0 / -mvPosition.z);
            gl_Position = projectionMatrix * mvPosition;
          }
        `,
        fragmentShader: `
          varying vec3 vColor;
          varying float vPhase;
          varying float vId;
          uniform float baseIntensity;
          uniform float hotspotIntensity;
          uniform float hoveredId;

          void main() {
            float isHovered = step(abs(vId - hoveredId), 0.5);
            float intensityMult = 1.0 + isHovered * 1.0;
            float dist = length(gl_PointCoord - vec2(0.5));
            if (dist > 0.5) discard;
            float core = 1.0 - smoothstep(0.0, 0.15, dist);
            float glow = 1.0 - smoothstep(0.1, 0.5, dist);
            vec3 coreColor = vec3(1.0, 1.0, 1.0);
            vec3 glowColor = vColor * intensityMult;
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

  useFrame(({ clock }, delta) => {
    if (materialRef.current) {
      materialRef.current.uniforms.time.value = clock.getElapsedTime();
      materialRef.current.uniforms.hoveredId.value = hoveredId !== null
        ? points.findIndex(p => p.id === hoveredId)
        : -1;
    }
    if (pointsMeshRef.current) {
      rotationRef.current += delta * 0.015;
      pointsMeshRef.current.rotation.y = rotationRef.current;
    }
  });

  const findClosestPoint = useCallback(
    (event: THREE.Event) => {
      if (!pointsMeshRef.current) return null;
      const pointPositions = pointsMeshRef.current.geometry.attributes.position;
      let closestDist = Infinity;
      let closestIdx = -1;
      raycaster.setFromCamera(pointer, camera);
      const ray = raycaster.ray;
      for (let i = 0; i < pointPositions.count; i++) {
        const px = pointPositions.getX(i);
        const py = pointPositions.getY(i);
        const pz = pointPositions.getZ(i);
        const point = new THREE.Vector3(px, py, pz);
        const dist = ray.distanceToPoint(point);
        if (dist < closestDist && dist < 0.05) {
          closestDist = dist;
          closestIdx = i;
        }
      }
      return closestIdx >= 0 ? points[closestIdx] : null;
    },
    [points, raycaster, pointer, camera]
  );

  const handlePointerMove = useCallback(
    (event: THREE.Event) => {
      const point = findClosestPoint(event);
      const newHoveredId = point?.id ?? null;
      if (newHoveredId !== hoveredId) {
        setHoveredId(newHoveredId);
        onHoverChange?.(point);
        document.body.style.cursor = newHoveredId ? 'pointer' : 'auto';
      }
    },
    [findClosestPoint, hoveredId, onHoverChange]
  );

  const handleClick = useCallback(
    (event: THREE.Event) => {
      const point = findClosestPoint(event);
      if (point) {
        onPointClick?.(point);
      }
    },
    [findClosestPoint, onPointClick]
  );

  return (
    <points
      ref={pointsMeshRef}
      geometry={geometry}
      material={materialRef.current}
      onPointerMove={handlePointerMove}
      onClick={handleClick}
    />
  );
}