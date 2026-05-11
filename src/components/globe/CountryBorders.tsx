'use client';

import { useMemo, useRef } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const COUNTRIES: any[] = [
  {
    name: 'USA',
    rings: [[[-125,49],[-125,25],[-104,37],[-97,25],[-82,25],[-80,25],[-67,45],[-67,45],[-125,49]]]
  },
  {
    name: 'Canada',
    rings: [[[-140,70],[-140,60],[-110,60],[-60,50],[-60,60],[-65,70],[-140,70]]]
  },
  {
    name: 'Mexico',
    rings: [[[-118,33],[-98,19],[-97,16],[-92,18],[-90,21],[-87,22],[-83,22],[-118,33]]]
  },
  {
    name: 'Brazil',
    rings: [[[-73,5],[-50,-5],[-35,-5],[-35,-25],[-55,-30],[-55,-10],[-73,5]]]
  },
  {
    name: 'Argentina',
    rings: [[[-73,-22],[-65,-22],[-55,-35],[-65,-55],[-73,-50],[-73,-22]]]
  },
  {
    name: 'Colombia',
    rings: [[[-79,12],[-67,2],[-77,1],[-79,12]]]
  },
  {
    name: 'Peru',
    rings: [[[-82,-1],[-70,-1],[-70,-15],[-80,-18],[-82,-1]]]
  },
  {
    name: 'Chile',
    rings: [[[-75,-20],[-70,-30],[-68,-45],[-75,-55],[-75,-20]]]
  },
  {
    name: 'UK',
    rings: [[[-5,50],[2,50],[2,55],[-5,55],[-5,50]]]
  },
  {
    name: 'France',
    rings: [[[-5,42],[8,42],[8,51],[-5,51],[-5,42]]]
  },
  {
    name: 'Germany',
    rings: [[[6,47],[15,47],[15,55],[6,55],[6,47]]]
  },
  {
    name: 'Spain',
    rings: [[[-9,36],[3,36],[3,44],[-9,44],[-9,36]]]
  },
  {
    name: 'Italy',
    rings: [[[7,36],[18,36],[18,47],[7,47],[7,36]]]
  },
  {
    name: 'Poland',
    rings: [[[14,50],[24,50],[24,55],[14,55],[14,50]]]
  },
  {
    name: 'Ukraine',
    rings: [[[22,48],[40,48],[40,55],[22,55],[22,48]]]
  },
  {
    name: 'Sweden',
    rings: [[[11,56],[24,56],[24,70],[11,70],[11,56]]]
  },
  {
    name: 'Norway',
    rings: [[[5,58],[30,71],[30,58],[5,58]]]
  },
  {
    name: 'Russia',
    rings: [[[25,45],[60,45],[60,70],[180,70],[180,45],[25,45]]]
  },
  {
    name: 'China',
    rings: [[[75,25],[100,25],[120,35],[135,50],[75,50],[75,25]]]
  },
  {
    name: 'India',
    rings: [[[68,8],[97,8],[97,35],[68,35],[68,8]]]
  },
  {
    name: 'Japan',
    rings: [[[130,33],[145,33],[145,45],[130,45],[130,33]]]
  },
  {
    name: 'Australia',
    rings: [[[115,-35],[130,-35],[145,-25],[145,-15],[115,-15],[115,-35]]]
  },
  {
    name: 'South Africa',
    rings: [[[16,-35],[32,-35],[32,-22],[16,-22],[16,-35]]]
  },
  {
    name: 'Egypt',
    rings: [[[25,22],[35,22],[35,32],[25,32],[25,22]]]
  },
  {
    name: 'Saudi Arabia',
    rings: [[[35,17],[55,17],[55,30],[35,30],[35,17]]]
  },
  {
    name: 'Iran',
    rings: [[[44,25],[63,25],[63,40],[44,40],[44,25]]]
  },
  {
    name: 'Kazakhstan',
    rings: [[[50,40],[85,40],[85,55],[50,55],[50,40]]]
  },
  {
    name: 'Mongolia',
    rings: [[[88,42],[120,42],[120,52],[88,52],[88,42]]]
  },
];

function latLngToVec3(lat: number, lng: number, radius: number): THREE.Vector3 {
  const phi = (90 - lat) * Math.PI / 180;
  const theta = (lng + 180) * Math.PI / 180;
  return new THREE.Vector3(
    -radius * Math.sin(phi) * Math.cos(theta),
    radius * Math.cos(phi),
    radius * Math.sin(phi) * Math.sin(theta)
  );
}

function greatCirclePoints(
  lat1: number, lng1: number,
  lat2: number, lng2: number,
  radius: number,
  steps: number = 10
): THREE.Vector3[] {
  const p1 = latLngToVec3(lat1, lng1, 1);
  const p2 = latLngToVec3(lat2, lng2, 1);

  const points: THREE.Vector3[] = [];
  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    // Spherical interpolation
    const sinT = Math.sin(t * Math.PI);
    const cosT = Math.cos(t * Math.PI);
    const x = p1.x * cosT - p2.x * sinT;
    const y = p1.y * cosT - p2.y * sinT;
    const z = p1.z * cosT - p2.z * sinT;

    // Normalize and scale to radius
    const len = Math.sqrt(x * x + y * y + z * z);
    points.push(new THREE.Vector3(
      (x / len) * radius,
      (y / len) * radius,
      (z / len) * radius
    ));
  }
  return points;
}

function buildCountryGeometry(countries: typeof COUNTRIES, radius: number): THREE.BufferGeometry {
  const allPoints: THREE.Vector3[] = [];

  for (const country of countries) {
    for (const ring of country.rings) {
      // ring is number[][][] (polygons), polygon is number[][] (coordinates)
      for (const polygon of ring) {
        for (let i = 0; i < polygon.length - 1; i++) {
          const coord1: number[] = polygon[i];
          const coord2: number[] = polygon[i + 1];
          const lng1 = coord1[0], lat1 = coord1[1];
          const lng2 = coord2[0], lat2 = coord2[1];
          const segmentPoints = greatCirclePoints(lat1, lng1, lat2, lng2, radius, 12);
          allPoints.push(...segmentPoints);
        }
      }
    }
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setFromPoints(allPoints);
  return geometry;
}

export function CountryBorders() {
  const bordersRef = useRef<THREE.LineSegments>(null);
  const rotationRef = useRef(0);

  const geometry = useMemo(() => {
    return buildCountryGeometry(COUNTRIES, 1.001);
  }, []);

  useFrame((_, delta) => {
    if (bordersRef.current) {
      rotationRef.current += delta * 0.015;
      bordersRef.current.rotation.y = rotationRef.current;
    }
  });

  return (
    <lineSegments ref={bordersRef} geometry={geometry}>
      <lineBasicMaterial
        color="#1e242b"
        transparent
        opacity={0.25}
      />
    </lineSegments>
  );
}