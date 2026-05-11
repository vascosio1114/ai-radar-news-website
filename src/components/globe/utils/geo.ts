import * as THREE from 'three';

export function latLngToVector3(lat: number, lng: number, radius: number): THREE.Vector3 {
  const phi = (90 - lat) * (Math.PI / 180);
  const theta = (180 - lng) * (Math.PI / 180);
  return new THREE.Vector3(
    -radius * Math.sin(phi) * Math.cos(theta),
    radius * Math.cos(phi),
    -radius * Math.sin(phi) * Math.sin(theta)
  );
}

export function coordinateToPosition(lat: number, lng: number, radius: number): THREE.Vector3 {
  return latLngToVector3(lat, lng, radius);
}