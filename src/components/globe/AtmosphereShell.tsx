'use client';

import { useMemo, useRef } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';

export function AtmosphereShell() {
  const innerRef = useRef<THREE.Mesh>(null);
  const outerRef = useRef<THREE.Mesh>(null);
  const rotationRef = useRef(0);

  const fresnelMaterial = useMemo(() => {
    return new THREE.ShaderMaterial({
      uniforms: {
        fresnelPower: { value: 5.0 },
        fresnelColorInner: { value: new THREE.Color('#1a1c22') },
        fresnelColorOuter: { value: new THREE.Color('#0a0a10') },
        opacity: { value: 0.4 },
        time: { value: 0.0 },
      },
      vertexShader: `
        varying vec3 vNormal;
        varying vec3 vViewDirection;

        void main() {
          vNormal = normalize(normalMatrix * normal);
          vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
          vViewDirection = normalize(-mvPosition.xyz);
          gl_Position = projectionMatrix * mvPosition;
        }
      `,
      fragmentShader: `
        uniform float fresnelPower;
        uniform vec3 fresnelColorInner;
        uniform vec3 fresnelColorOuter;
        uniform float opacity;
        uniform float time;

        varying vec3 vNormal;
        varying vec3 vViewDirection;

        void main() {
          float fresnel = pow(1.0 - max(dot(vNormal, vViewDirection), 0.0), fresnelPower);
          vec3 color = mix(fresnelColorInner, fresnelColorOuter, fresnel);
          float breathe = 1.0 + 0.05 * sin(time * 3.14159);
          float alpha = fresnel * opacity * breathe;
          gl_FragColor = vec4(color, alpha);
        }
      `,
      transparent: true,
      side: THREE.BackSide,
      depthWrite: false,
    });
  }, []);

  const outerMaterial = useMemo(
    () =>
      new THREE.MeshBasicMaterial({
        color: '#000000',
        transparent: true,
        opacity: 0.02,
        side: THREE.BackSide,
        depthWrite: false,
      }),
    []
  );

  useFrame(({ clock }, delta) => {
    fresnelMaterial.uniforms.time.value = clock.getElapsedTime();
    rotationRef.current += delta * 0.015;
    if (innerRef.current) innerRef.current.rotation.y = rotationRef.current;
    if (outerRef.current) outerRef.current.rotation.y = rotationRef.current;
  });

  return (
    <group>
      <mesh ref={innerRef}>
        <sphereGeometry args={[1.08, 32, 32]} />
        <primitive object={fresnelMaterial} attach="material" />
      </mesh>
      <mesh ref={outerRef}>
        <sphereGeometry args={[1.12, 32, 32]} />
        <primitive object={outerMaterial} attach="material" />
      </mesh>
    </group>
  );
}