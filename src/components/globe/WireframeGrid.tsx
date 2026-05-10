// src/components/globe/WireframeGrid.tsx
'use client';

import { useMemo, useRef } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';

export function WireframeGrid({ rotation }: { rotation: number }) {
  const gridRef = useRef<THREE.LineSegments>(null);

  const geometry = useMemo(() => {
    const points: THREE.Vector3[] = [];
    const radius = 1.005;

    for (let lat = -75; lat <= 75; lat += 15) {
      const latRad = (lat * Math.PI) / 180;
      for (let lng = 0; lng <= 360; lng += 2) {
        const lngRad = (lng * Math.PI) / 180;
        points.push(
          new THREE.Vector3(
            radius * Math.cos(latRad) * Math.cos(lngRad),
            radius * Math.sin(latRad),
            radius * Math.cos(latRad) * Math.sin(lngRad)
          )
        );
      }
    }

    for (let lng = 0; lng < 360; lng += 15) {
      const lngRad = (lng * Math.PI) / 180;
      for (let lat = -90; lat <= 90; lat += 2) {
        const latRad = (lat * Math.PI) / 180;
        points.push(
          new THREE.Vector3(
            radius * Math.cos(latRad) * Math.cos(lngRad),
            radius * Math.sin(latRad),
            radius * Math.cos(latRad) * Math.sin(lngRad)
          )
        );
      }
    }

    return new THREE.BufferGeometry().setFromPoints(points);
  }, []);

  useFrame(() => {
    if (gridRef.current) {
      gridRef.current.rotation.y = rotation;
    }
  });

  return (
    <lineSegments ref={gridRef} geometry={geometry}>
      <lineBasicMaterial
        color="#1e242b"
        transparent
        opacity={0.18}
      />
    </lineSegments>
  );
}