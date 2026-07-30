export interface RouteData {
  currentLocation: string;
  targetLocation: string;
  targetProductName?: string;
  waypoints: string[];
  distanceMeters: number;
  estimatedTimeSeconds: number;
}

export interface AisleZone {
  id: string;
  name: string;
  category: string;
  itemNames: string[];
  gridPosition: { col: number; row: number };
}
