export * from "./api";
export * from "./assistant";
export * from "./navigation";
export * from "./navigationGraph";
export * from "./recommendation";
export * from "./routeOptimization";
export * from "./sensor";

export type ActiveTab = "dashboard" | "assistant" | "map" | "settings";

export type DetectionStatus = "idle" | "uploading" | "analyzing" | "success" | "error";

export type PositionConnectionStatus = "Connected" | "Connecting" | "Disconnected" | "Tracking";

export interface PersonPosition {
  personId?: string;
  x: number;
  y: number;
  zoneId: string;
  aisleId: string;
  timestamp: string;
}

export interface NavigationPoint {
  x: number;
  y: number;
  label?: string;
}

export interface NavigationRequest {
  start: NavigationPoint;
  destination: NavigationPoint;
  productId?: string;
  productName?: string;
  aisleId?: string;
  shelfId?: string;
}

export interface TrackedPerson {
  personId: string;
  name: string;
  x: number;
  y: number;
  theta?: number; // Optional rotation in radians from SLAM
  zoneId: string;
  aisleId: string;
  timestamp: string;
  status: PositionConnectionStatus;
  history: MovementHistoryPoint[];
}

export interface MovementHistoryPoint {
  x: number;
  y: number;
  timestamp: string;
}

export interface ProductLocation {
  aisleId: string;
  shelfId: string;
  shelfName?: string;
  x: number;
  y: number;
}

export interface Product {
  id: string;
  productId?: string;
  name: string;
  productName?: string;
  price: number;
  weightGrams: number;
  category: string;
  brand?: string;
  imageUrl?: string;
  barcode?: string;
  stock?: number;
  aisleId?: string;
  shelfId?: string;
  mapX?: number;
  mapY?: number;
  availability?: "In Stock" | "Low Stock" | "Out of Stock";
  location?: ProductLocation;
}

export interface CartItemType {
  product: Product;
  quantity: number;
  addedAt: string;
}

export interface GemmaRecommendationItem {
  product_id?: string;
  product_name: string;
  price: number;
  reason?: string;
}

export interface GemmaDetectionResult {
  product_id: string;
  product_name: string;
  brand: string;
  category: string;
  sub_category: string;
  price: number;
  confidence: number;
  verified: boolean;
  estimatedWeightGrams: number;
  imageUrl?: string;
  detectedAt: string;
  recommendations?: GemmaRecommendationItem[];
}

export interface LoadCellTelemetryData {
  currentWeightGrams: number;
  expectedWeightGrams: number;
  isStable: boolean;
  statusText: "Stable" | "Measuring..." | "Unstable / Calibrating";
  lastUpdated: string;
}
