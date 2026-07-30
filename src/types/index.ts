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
  productName: string;
  brand: string;
  category: string;
  confidence: number;
  estimatedWeightGrams: number;
  verificationStatus: "Verified" | "Pending Weight Check" | "Unverified";
  suggestedPrice: number; // Catalog price from verified product lookup
  detectedAt: string;
}

export interface LoadCellTelemetryData {
  currentWeightGrams: number;
  expectedWeightGrams: number;
  isStable: boolean;
  statusText: "Stable" | "Measuring..." | "Unstable / Calibrating";
  lastUpdated: string;
}

export interface RecommendationItem {
  id: string;
  product: Product;
  reason: string;
}
