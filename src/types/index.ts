export interface Product {
  id: string;
  name: string;
  price: number;
  weightGrams: number;
  category: string;
  imageUrl?: string;
  barcode?: string;
}

export interface CartItemType {
  product: Product;
  quantity: number;
  addedAt: string;
}

export interface DetectedProduct {
  id: string;
  label: string;
  confidence: number;
  estimatedWeightGrams: number;
  boundingCircle?: { x: number; y: number; radius: number };
  detectedAt: string;
  status: "pending_verification" | "verified" | "rejected";
}

export interface LoadCellData {
  currentWeightGrams: number;
  expectedWeightGrams: number;
  weightDeltaGrams: number;
  isTareActive: boolean;
  isWeightMismatch: boolean;
  lastUpdated: string;
}

export type ConnectionStatus = "connected" | "connecting" | "disconnected" | "error";

export interface TrolleyStatus {
  trolleyId: string;
  batteryLevelPercent: number;
  mqttConnection: ConnectionStatus;
  cameraConnection: ConnectionStatus;
  loadCellConnection: ConnectionStatus;
  lastHeartbeat: string;
}

export interface BillingSummaryData {
  subtotal: number;
  tax: number;
  discount: number;
  total: number;
  currency: string;
  itemCount: number;
}

export interface Recommendation {
  id: string;
  title: string;
  reason: string;
  suggestedProduct: Product;
  discountPercentage?: number;
}
