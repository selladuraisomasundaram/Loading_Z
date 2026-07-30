export * from "./api";
export * from "./assistant";
export * from "./navigation";
export * from "./navigationGraph";
export * from "./recommendation";
export * from "./routeOptimization";
export * from "./sensor";

export type ActiveTab = "dashboard" | "assistant" | "map" | "settings";

export type DetectionStatus = "idle" | "uploading" | "analyzing" | "success" | "error";

export interface ProductLocation {
  aisleId: string;
  shelfId: string;
  shelfName?: string;
  x: number;
  y: number;
}

export interface Product {
  id: string;
  name: string;
  price: number;
  weightGrams: number;
  category: string;
  brand?: string;
  imageUrl?: string;
  barcode?: string;
  stock?: number;
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
