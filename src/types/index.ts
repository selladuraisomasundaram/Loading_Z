export * from "./recommendation";

export type DetectionStatus = "idle" | "uploading" | "analyzing" | "success" | "error";

export interface Product {
  id: string;
  name: string;
  price: number;
  weightGrams: number;
  category: string;
  brand?: string;
  imageUrl?: string;
  barcode?: string;
}

export interface CartItemType {
  product: Product;
  quantity: number;
  addedAt: string;
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
}

export interface LoadCellTelemetryData {
  currentWeightGrams: number;
  expectedWeightGrams: number;
  isStable: boolean;
  statusText: "Stable" | "Measuring..." | "Unstable / Calibrating";
  lastUpdated: string;
}
