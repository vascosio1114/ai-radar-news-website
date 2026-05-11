import { ActivityPoint, DataPointCluster } from './types';

export const CLUSTERS: DataPointCluster[] = [
  { name: 'North America East Coast', phase: 0.0, center: { lat: 40, lng: -75 }, radius: 20 },
  { name: 'Europe', phase: 1.1, center: { lat: 50, lng: 10 }, radius: 25 },
  { name: 'Asia', phase: 2.2, center: { lat: 35, lng: 120 }, radius: 30 },
  { name: 'South America', phase: 3.3, center: { lat: -23, lng: -46 }, radius: 15 },
  { name: 'Other', phase: 4.4, center: { lat: 0, lng: 0 }, radius: 999 },
];

export function generateMockActivityPoints(): ActivityPoint[] {
  const points: ActivityPoint[] = [];
  const regions = [
    { latRange: [25, 55], lngRange: [-130, -60], count: 80, cluster: 'North America East Coast' },
    { latRange: [35, 60], lngRange: [-15, 40], count: 60, cluster: 'Europe' },
    { latRange: [20, 50], lngRange: [100, 145], count: 50, cluster: 'Asia' },
    { latRange: [35, 50], lngRange: [60, 100], count: 30, cluster: 'Other' },
    { latRange: [-35, -10], lngRange: [-80, -50], count: 20, cluster: 'South America' },
    { latRange: [-20, 10], lngRange: [15, 45], count: 15, cluster: 'Other' },
  ];

  regions.forEach((region) => {
    for (let i = 0; i < region.count; i++) {
      const lat = region.latRange[0] + Math.random() * (region.latRange[1] - region.latRange[0]);
      const lng = region.lngRange[0] + Math.random() * (region.lngRange[1] - region.lngRange[0]);
      const isHotspot = Math.random() < 0.1; // 10% are hotspots
      points.push({
        id: `${region.cluster}-${i}`,
        lat,
        lng,
        intensity: isHotspot ? 0.9 + Math.random() * 0.1 : 0.5 + Math.random() * 0.4,
        label: `Point ${points.length}`,
        category: ['news', 'alert', 'trend'][Math.floor(Math.random() * 3)] as ActivityPoint['category'],
        cluster: region.cluster,
      });
    }
  });

  return points;
}

export function getClusterPhase(clusterName: string): number {
  const c = CLUSTERS.find((cl) => cl.name === clusterName);
  return c ? c.phase : 4.4;
}