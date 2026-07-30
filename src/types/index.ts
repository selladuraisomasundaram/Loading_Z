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
  confidence: number; // e.g. 0.96 (96%)
  estimatedWeightGrams: number;
  verificationStatus: "Verified" | "Pending Weight Check" | "Unverified";
  suggestedPrice: number;
  detectedAt: string;
}

export interface LoadCellTelemetryData {
  currentWeightGrams: number;
  expectedWeightGrams: number;
  isStable: boolean;
  statusText: "Stable" | "Measuring..." | "Unstable / Calibrating";
  lastUpdated: string;
}

export type ConnectionStatus = "connected" | "connecting" | "disconnected" | "error";

export interface HeaderStatusData {
  teamName: string;
  gemmaModelStatus: "online" | "loading" | "offline";
  gemmaModelName: string;
  backendConnection: ConnectionStatus;
  backendName: string;
}

export interface GSTBillingSummaryData {
  itemCount: number;
  subtotal: number;
  discount: number;
  gstRatePercent: number; // e.g. 18%
  gstAmount: number;
  finalPayableAmount: number;
  currency: string;
}

export interface RecommendationItem {
  id: string;
  product: Product;
  reason: string;
}
