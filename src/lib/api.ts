import {
  ProductIdentificationResponse,
  RecommendationResponse,
  SensorDataResponse,
  CheckoutResponse,
  CartItemPayload,
} from "@/types/api";
import {
  mockIdentifyProduct,
  mockGetRecommendations,
  mockGetSensorData,
  mockCheckout,
} from "./mock-api";

// Environment Configuration
const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

const isMockMode = (): boolean => {
  // If explicitly configured, or in browser dev without backend running
  const mockSetting = process.env.NEXT_PUBLIC_USE_MOCK_API;
  if (mockSetting !== undefined) {
    return mockSetting === "true";
  }
  return true; // Default fallback to safe mock mode
};

// Reusable HTTP Client Helper with Error Handling
async function fetchWithTimeout(
  url: string,
  options: RequestInit = {},
  timeoutMs = 8000
): Promise<Response> {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
    });
    clearTimeout(id);
    return response;
  } catch (error: unknown) {
    clearTimeout(id);
    if (error instanceof Error && error.name === "AbortError") {
      throw new Error("Request timed out while connecting to server.");
    }
    throw new Error("Backend unavailable. Please check server connection.");
  }
}

/**
 * 1. Product Identification API
 * Endpoint: POST /api/products/identify
 * Request: multipart/form-data with 'image' file
 */
export async function identifyProduct(
  file: File
): Promise<ProductIdentificationResponse> {
  if (isMockMode()) {
    return await mockIdentifyProduct(file);
  }

  try {
    const formData = new FormData();
    formData.append("image", file);

    const response = await fetchWithTimeout(`${BASE_URL}/api/products/identify`, {
      method: "POST",
      body: formData,
    });

    if (response.status === 404) {
      throw new Error("Product not found in catalog.");
    }

    if (response.status === 400 || response.status === 422) {
      throw new Error("Invalid image format or parameters sent to server.");
    }

    if (!response.ok) {
      throw new Error(`Unable to identify product (HTTP ${response.status}).`);
    }

    const data = (await response.json()) as ProductIdentificationResponse;
    if (!data.success) {
      throw new Error(data.error || "Unable to identify product.");
    }

    return data;
  } catch (err: unknown) {
    // If backend fails or unavailable, fall back safely or throw user-friendly error message
    console.warn("Real API call failed, falling back to mock mode:", err);
    if (process.env.NODE_ENV === "development") {
      return await mockIdentifyProduct(file);
    }
    const message =
      err instanceof Error ? err.message : "Unable to identify product.";
    throw new Error(message);
  }
}

/**
 * 2. Recommendation API
 * Endpoint: POST /api/recommendations
 * Request: { cart_items: [{ product_id, quantity }] }
 */
export async function getRecommendations(
  cartItems: CartItemPayload[]
): Promise<RecommendationResponse> {
  if (isMockMode()) {
    return await mockGetRecommendations(cartItems);
  }

  try {
    const response = await fetchWithTimeout(`${BASE_URL}/api/recommendations`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ cart_items: cartItems }),
    });

    if (!response.ok) {
      throw new Error("Recommendations unavailable.");
    }

    const data = (await response.json()) as RecommendationResponse;
    if (!data.success) {
      throw new Error(data.error || "Recommendations unavailable.");
    }

    return data;
  } catch (err: unknown) {
    console.warn("Real recommendation API failed, using mock data:", err);
    if (process.env.NODE_ENV === "development") {
      return await mockGetRecommendations(cartItems);
    }
    const message =
      err instanceof Error ? err.message : "Recommendations unavailable.";
    throw new Error(message);
  }
}

/**
 * 3. Sensor / Load Cell API
 * Endpoint: GET /api/sensors/load-cell
 */
export async function getSensorData(): Promise<SensorDataResponse> {
  if (isMockMode()) {
    return await mockGetSensorData();
  }

  try {
    const response = await fetchWithTimeout(`${BASE_URL}/api/sensors/load-cell`, {
      method: "GET",
      headers: { "Accept": "application/json" },
    });

    if (!response.ok) {
      throw new Error("Unable to read cart sensor.");
    }

    const data = (await response.json()) as SensorDataResponse;
    if (!data.success) {
      throw new Error(data.error || "Unable to read cart sensor.");
    }

    return data;
  } catch (err: unknown) {
    console.warn("Real load cell sensor API failed, using mock data:", err);
    if (process.env.NODE_ENV === "development") {
      return await mockGetSensorData();
    }
    const message =
      err instanceof Error ? err.message : "Unable to read cart sensor.";
    throw new Error(message);
  }
}

/**
 * 4. Checkout API
 * Endpoint: POST /api/cart/checkout
 * Request: { items: [{ product_id, quantity }] }
 */
export async function checkout(
  items: CartItemPayload[]
): Promise<CheckoutResponse> {
  if (isMockMode()) {
    return await mockCheckout(items);
  }

  try {
    const response = await fetchWithTimeout(`${BASE_URL}/api/cart/checkout`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ items }),
    });

    if (!response.ok) {
      throw new Error("Checkout failed. Please try again.");
    }

    const data = (await response.json()) as CheckoutResponse;
    if (!data.success) {
      throw new Error(data.error || "Checkout processing error.");
    }

    return data;
  } catch (err: unknown) {
    console.warn("Real checkout API failed, using mock mode fallback:", err);
    if (process.env.NODE_ENV === "development") {
      return await mockCheckout(items);
    }
    const message =
      err instanceof Error ? err.message : "Checkout failed. Please try again.";
    throw new Error(message);
  }
}
