import {
  ProductIdentificationResponse,
  RecommendationResponse,
  SensorDataResponse,
  CheckoutResponse,
  CartItemPayload,
  ChatMessage,
  RouteData,
} from "@/types";
import {
  mockIdentifyProduct,
  mockGetRecommendations,
  mockGetSensorData,
  mockCheckout,
  mockSendChatMessage,
  mockGetStoreRoute,
} from "./mock-api";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

const isMockMode = (): boolean => {
  const mockSetting = process.env.NEXT_PUBLIC_USE_MOCK_API;
  if (mockSetting !== undefined) {
    return mockSetting === "true";
  }
  return true;
};

async function fetchWithTimeout(
  url: string,
  options: RequestInit = {},
<<<<<<< Updated upstream
  timeoutMs = 8000
=======
  timeoutMs = 120000 // 120 seconds timeout to accommodate local Gemma AI vision & LLM processing
>>>>>>> Stashed changes
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

export async function identifyProduct(
  file: File
): Promise<ProductIdentificationResponse> {
  if (isMockMode()) {
    return await mockIdentifyProduct(file);
  }

  try {
    const formData = new FormData();
    formData.append("image", file);

    let response: Response;
    try {
      response = await fetchWithTimeout(`${BASE_URL}/api/v1/vision/analyze`, {
        method: "POST",
        body: formData,
      });
    } catch {
      response = await fetchWithTimeout(`${BASE_URL}/api/products/identify`, {
        method: "POST",
        body: formData,
      });
    }

    if (response.status === 404) {
      throw new Error("Product not found in catalog.");
    }

    if (!response.ok) {
      throw new Error(`Unable to identify product (HTTP ${response.status}).`);
    }

    const rawData = await response.json();
    const productData = {
      product_id: rawData.product_id || rawData.sku || "SKU-001",
      product_name: rawData.product_name || "Unknown Product",
      brand: rawData.brand || "Generic",
      category: rawData.category || "General",
      sub_category: rawData.sub_category || "General",
      price: rawData.price || 0.0,
      confidence: rawData.confidence || rawData.gemma_confidence || 0.95,
      verified: rawData.verified ?? true,
      image_url: rawData.image_url || null,
    };

    return {
      success: true,
      product: productData,
    };
  } catch (err: unknown) {
    console.warn("Real Vision API call failed, falling back to mock mode:", err);
    if (process.env.NODE_ENV === "development") {
      return await mockIdentifyProduct(file);
    }
    const message =
      err instanceof Error ? err.message : "Unable to identify product.";
    throw new Error(message);
  }
}

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
    return data;
  } catch (err: unknown) {
    console.warn("Real recommendation API failed, using mock data:", err);
    return await mockGetRecommendations(cartItems);
  }
}

export async function getSensorData(): Promise<SensorDataResponse> {
  if (isMockMode()) {
    return await mockGetSensorData();
  }

  try {
    let response: Response;
    try {
      response = await fetchWithTimeout(`${BASE_URL}/api/v1/telemetry/weight`, {
        method: "GET",
        headers: { Accept: "application/json" },
      }, 5000);
    } catch {
      response = await fetchWithTimeout(`${BASE_URL}/api/sensors/load-cell`, {
        method: "GET",
        headers: { Accept: "application/json" },
      }, 5000);
    }

    if (!response.ok) {
      throw new Error("Unable to read cart sensor.");
    }

    const rawData = await response.json();
    return {
      success: true,
      sensor: {
        weightKg: rawData.weightKg ?? rawData.weight_kg ?? 2.46,
        stable: rawData.stable ?? true,
        connected: rawData.connected ?? true,
        timestamp: rawData.timestamp || new Date().toISOString(),
      },
    };
  } catch (err: unknown) {
    console.warn("Real load cell sensor API failed, using mock data:", err);
    return await mockGetSensorData();
  }
}

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
    return data;
  } catch (err: unknown) {
    console.warn("Real checkout API failed, using mock mode fallback:", err);
    return await mockCheckout(items);
  }
}

export async function sendChatMessage(message: string): Promise<ChatMessage> {
  if (isMockMode()) {
    return await mockSendChatMessage(message);
  }

  try {
    let response: Response;
    try {
      response = await fetchWithTimeout(`${BASE_URL}/api/v1/assistant/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message }),
<<<<<<< Updated upstream
      }, 60000);
=======
      }, 120000); // Allow up to 120s for local Gemma AI assistant inference & web tool execution
>>>>>>> Stashed changes
    } catch {
      response = await fetchWithTimeout(`${BASE_URL}/api/assistant/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message }),
      }, 120000);
    }

    if (!response.ok) {
      throw new Error("AI Assistant service unavailable.");
    }

    const rawData = await response.json();
    
    return {
      id: rawData.id || `msg-bot-${Date.now()}`,
      sender: "assistant",
      text: rawData.response || rawData.text || "I have processed your query.",
      timestamp: rawData.timestamp || new Date().toLocaleTimeString(),
      targetAisle: rawData.target_aisle || rawData.targetAisle || undefined,
      toolActivity: rawData.tool_activity || rawData.toolActivity || [],
      webSearchUsed: Boolean(
        rawData.tool_activity?.some(
          (t: { step?: string; action?: string }) =>
            t.step?.includes("Web") || t.action?.includes("search_web")
        )
      ),
    };
  } catch (err: unknown) {
    console.warn("Real assistant API failed, using mock fallback:", err);
    if (process.env.NODE_ENV === "development") {
      return await mockSendChatMessage(message);
    }
    const msg =
      err instanceof Error ? err.message : "AI Assistant service unavailable.";
    throw new Error(msg);
  }
}

export async function getStoreRoute(
  startNode = "ENTRANCE",
  destNode = "AISLE_2"
): Promise<RouteData> {
  if (isMockMode()) {
    return await mockGetStoreRoute(startNode, destNode);
  }

  try {
    let response: Response;
    try {
      const path = `/api/v1/navigation/route?start=${encodeURIComponent(startNode)}&destination=${encodeURIComponent(destNode)}`;
      response = await fetchWithTimeout(`${BASE_URL}${path}`, {
        method: "GET",
        headers: { Accept: "application/json" },
      });
    } catch {
      response = await fetchWithTimeout(`${BASE_URL}/api/navigation/route`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ start_node: startNode, dest_node: destNode }),
      });
    }

    if (!response.ok) {
      throw new Error("Navigation pathfinder service unavailable.");
    }

    const rawData = await response.json();
    return {
      currentLocation: rawData.current_location || rawData.currentLocation || startNode,
      targetLocation: rawData.target_location || rawData.targetLocation || destNode,
      waypoints: rawData.waypoints || [startNode, destNode],
      distanceMeters: rawData.distance_meters || rawData.distanceMeters || 10.0,
      estimatedTimeSeconds: rawData.estimated_time_seconds || rawData.estimatedTimeSeconds || 15,
    };
  } catch (err: unknown) {
    console.warn("Real pathfinder API failed, using mock fallback:", err);
    return await mockGetStoreRoute(startNode, destNode);
  }
}
