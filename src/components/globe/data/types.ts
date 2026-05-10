export interface ActivityPoint {
  id: string;
  lat: number;        // -90 to +90
  lng: number;         // -180 to +180
  intensity: number;  // 0.5 to 1.0
  label: string;      // e.g., "New York City", "London"
  category: 'news' | 'alert' | 'trend';
  cluster: string;    // for phase variation grouping
}

export interface DataPointCluster {
  name: string;
  phase: number;      // pulse phase offset (0 to 2π)
  center: { lat: number; lng: number };
  radius: number;     // approximate cluster radius in degrees
}