export type WaypointType = "start" | "product" | "checkout";

export interface RouteWaypoint {
  id: string;
  stepNumber: number;
  type: WaypointType;
  productId?: string;
  productName?: string;
  aisleId?: string;
  shelfId?: string;
  nodeId: string;
  x: number;
  y: number;
  status: "pending" | "current" | "completed";
}

export interface MultiProductRouteResult {
  waypoints: RouteWaypoint[];
  fullNodePath: string[];
  fullSvgWaypoints: Array<{ x: number; y: number }>;
  originalDistanceMeters: number;
  optimizedDistanceMeters: number;
  distanceSavedMeters: number;
  percentageSaved: number;
  estimatedTimeSeconds: number;
  success: boolean;
  error?: string;
}
