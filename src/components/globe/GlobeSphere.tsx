'use client';

import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

function generateNormalMap(heightData: Uint8ClampedArray, width: number, height: number): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d')!;
  const imageData = ctx.createImageData(width, height);
  const data = imageData.data;

  const strength = 8.0; // Controls normal map intensity

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const idx = (y * width + x) * 4;
      const h = heightData[idx] / 255;

      // Central difference gradient with horizontal wrap for longitude continuity
      const xLeft = x > 0 ? x - 1 : width - 1;
      const xRight = x < width - 1 ? x + 1 : 0;
      const yUp = y > 0 ? y - 1 : 0;
      const yDown = y < height - 1 ? y + 1 : height - 1;

      const hLeft = heightData[(y * width + xLeft) * 4] / 255;
      const hRight = heightData[(y * width + xRight) * 4] / 255;
      const hUp = heightData[(y * width + x) * 4] / 255;
      const hDown = heightData[((yDown) * width + x) * 4] / 255;

      const dx = hRight - hLeft;
      const dy = hDown - hUp;

      // Convert gradient to normal vector
      const nx = -dx * strength;
      const ny = -dy * strength;
      const nz = 1.0;
      const len = Math.sqrt(nx * nx + ny * ny + nz * nz);

      // Pack normal into RGB: map from [-1,1] to [0,255]
      data[idx] = Math.round(((nx / len) * 0.5 + 0.5) * 255);
      data[idx + 1] = Math.round(((ny / len) * 0.5 + 0.5) * 255);
      data[idx + 2] = Math.round(((nz / len) * 0.5 + 0.5) * 255);
      data[idx + 3] = 255;
    }
  }

  ctx.putImageData(imageData, 0, 0);
  return new THREE.CanvasTexture(canvas);
}

function generateTerrainTexture(): { displacement: THREE.CanvasTexture; normal: THREE.CanvasTexture } {
  const width = 2048;
  const height = 1024;
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d')!;

  // Base background (ocean/void) - dark like deep space
  ctx.fillStyle = '#020205';
  ctx.fillRect(0, 0, width, height);

  const cellSize = 4;
  const gridW = width / cellSize;
  const gridH = height / cellSize;

  const noise = (x: number, y: number, seed: number): number => {
    const n = Math.sin(x * 12.9898 + y * 78.233 + seed) * 43758.5453;
    return n - Math.floor(n);
  };

  const smoothNoise = (x: number, y: number, seed: number): number => {
    const x0 = Math.floor(x);
    const x1 = x0 + 1;
    const y0 = Math.floor(y);
    const y1 = y0 + 1;
    const sx = x - x0;
    const sy = y - y0;
    const nx0 = noise(x0, y0, seed);
    const nx1 = noise(x1, y0, seed);
    const nx2 = noise(x0, y1, seed);
    const nx3 = noise(x1, y1, seed);
    const ix0 = nx0 + sx * (nx1 - nx0);
    const ix1 = nx2 + sx * (nx3 - nx2);
    return ix0 + sy * (ix1 - ix0);
  };

  const fractalNoise = (x: number, y: number, octaves: number): number => {
    let value = 0;
    let amplitude = 1;
    let frequency = 1;
    let maxValue = 0;
    for (let i = 0; i < octaves; i++) {
      value += smoothNoise(x * frequency, y * frequency, i * 137.5) * amplitude;
      maxValue += amplitude;
      amplitude *= 0.5;
      frequency *= 2;
    }
    return value / maxValue;
  };

  const landColors = ['#0B0C10', '#0F1015', '#12141A', '#151620'];

  for (let gy = 0; gy < gridH; gy++) {
    for (let gx = 0; gx < gridW; gx++) {
      const lng = (gx / gridW) * 2 * Math.PI;
      const lat = (gy / gridH) * Math.PI;
      const latFactor = 1 - Math.abs(lat / Math.PI - 0.5) * 0.3;
      const threshold = 0.62 * latFactor;
      const n = fractalNoise(gx * 0.08, gy * 0.08, 5);

      if (n > threshold) {
        const colorIdx = Math.min(
          Math.floor((n - threshold) / (1 - threshold) * landColors.length),
          landColors.length - 1
        );
        const color = landColors[colorIdx];
        ctx.fillStyle = color;
        ctx.fillRect(gx * cellSize, gy * cellSize, cellSize, cellSize);
      }
    }
  }

  const imageData = ctx.getImageData(0, 0, width, height);
  const data = imageData.data;

  for (let i = 0; i < data.length; i += 4) {
    const brightness = (data[i] + data[i + 1] + data[i + 2]) / 3;
    const displacement = Math.min(255, (brightness / 20) * 255);
    data[i] = displacement;
    data[i + 1] = displacement;
    data[i + 2] = displacement;
  }

  ctx.putImageData(imageData, 0, 0);

  const displacementTexture = new THREE.CanvasTexture(canvas);
  displacementTexture.wrapS = THREE.RepeatWrapping;
  displacementTexture.wrapT = THREE.ClampToEdgeWrapping;

  // Extract height data for normal map generation (R channel)
  const heightData = new Uint8ClampedArray(width * height * 4);
  for (let i = 0; i < data.length; i += 4) {
    heightData[i] = data[i];
    heightData[i + 1] = data[i + 1];
    heightData[i + 2] = data[i + 2];
    heightData[i + 3] = data[i + 3];
  }

  const normalTexture = generateNormalMap(heightData, width, height);
  normalTexture.wrapS = THREE.RepeatWrapping;
  normalTexture.wrapT = THREE.ClampToEdgeWrapping;

  return { displacement: displacementTexture, normal: normalTexture };
}

export function GlobeSphere() {
  const meshRef = useRef<THREE.Mesh>(null);
  const rotationRef = useRef(0);
  const { displacement: terrainTexture, normal: normalTexture } = useMemo(() => generateTerrainTexture(), []);

  useFrame((_, delta) => {
    if (meshRef.current) {
      rotationRef.current += delta * 0.015;
      meshRef.current.rotation.y = rotationRef.current;
    }
  });

  return (
    <mesh ref={meshRef}>
      <sphereGeometry args={[1, 128, 128]} />
      <meshStandardMaterial
        map={terrainTexture}
        roughness={0.85}
        metalness={0.0}
        displacementScale={0.02}
        displacementMap={terrainTexture}
        normalScale={new THREE.Vector2(1.0, 1.0)}
        normalMap={normalTexture}
      />
    </mesh>
  );
}