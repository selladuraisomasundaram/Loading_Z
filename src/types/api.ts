export interface ProductIdentificationResponse {
  success: boolean;
  product: {
    product_id: string;
    product_name: string;
    brand: string;
    category: string;
    sub_category: string;
    price: number;
    image_url: string | null;
    confidence: number;
    verified: boolean;
    estimatedWeightGrams?: number;
  };
  error?: string;
}

export interface CartItemPayload {
  product_id: string;
  quantity: number;
}

export interface RecommendationRequest {
  cart_items: CartItemPayload[];
}

export interface RecommendationItemResponse {
  product_id: string;
  product_name: string;
  price: number;
  image_url: string | null;
  reason: string;
}

export interface RecommendationResponse {
  success: boolean;
  recommendations: RecommendationItemResponse[];
  error?: string;
}

export interface SensorDataResponse {
  success: boolean;
  sensor: {
    weightKg: number;
    stable: boolean;
    connected: boolean;
    timestamp: string;
  };
  error?: string;
}

export interface CheckoutRequest {
  items: CartItemPayload[];
}

export interface CheckoutResponse {
  success: boolean;
  order: {
    order_id: string;
    subtotal: number;
    discount: number;
    tax: number;
    total: number;
  };
  error?: string;
}

export interface ApiErrorResponse {
  success: false;
  error: string;
  statusCode?: number;
}
