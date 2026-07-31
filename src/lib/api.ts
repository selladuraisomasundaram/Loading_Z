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

/**
 * Checks if mock mode is explicitly forced via environment variable.
 * Default is FALSE to ensure real Gemma AI intelligence endpoints are called.
 */
const isMockMode = (): boolean => {
  return process.env.NEXT_PUBLIC_USE_MOCK_API === "true";
};

async function fetchWithTimeout(
  url: string,
  options: RequestInit = {},
  timeoutMs = 120000 // 120s timeout to allow local Gemma vision & LLM inference
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
      throw new Error("Gemma AI Vision request timed out.");
    }
    throw new Error("Backend unavailable. Please ensure Gemma AI backend server is running on " + BASE_URL);
  }
}

/**
 * REAL GEMMA VISION AI IDENTIFICATION ENDPOINT
 * Directly sends scanned image payloads to Gemma Vision model backend (/api/v1/vision/analyze).
 */
export async function identifyProduct(
  file: File
): Promise<ProductIdentificationResponse> {
  if (isMockMode()) {
    return await mockIdentifyProduct(file);
  }

  const formData = new FormData();
  formData.append("image", file);

  let response: Response;
  try {
    response = await fetchWithTimeout(`${BASE_URL}/api/v1/vision/analyze`, {
      method: "POST",
      body: formData,
    });
  } catch (err: unknown) {
    // Retry alternative vision endpoint path
    try {
      response = await fetchWithTimeout(`${BASE_URL}/api/products/identify`, {
        method: "POST",
        body: formData,
      });
    } catch {
      throw err;
    }
  }

  if (response.status === 404) {
    throw new Error("Product not recognized in store catalog.");
  }

  if (!response.ok) {
    throw new Error(`Gemma Vision AI Service error (HTTP ${response.status}).`);
  }

  const rawData = await response.json();
  const productData = {
    product_id: rawData.product_id || rawData.sku || "SKU-REAL",
    product_name: rawData.product_name || rawData.name || "Gemma Identified Product",
    brand: rawData.brand || "Gemma AI",
    category: rawData.category || "General",
    sub_category: rawData.sub_category || "General",
    price: typeof rawData.price === "number" ? rawData.price : 0.0,
    confidence: typeof rawData.confidence === "number" ? rawData.confidence : (rawData.gemma_confidence || 0.98),
    verified: rawData.verified ?? true,
    image_url: rawData.image_url || null,
  };

  return {
    success: true,
    product: productData,
  };
}

/**
 * REAL GEMMA RECOMMENDATION ENDPOINT
 */
export async function getRecommendations(
  cartItems: string[]
): Promise<RecommendationResponse> {
  if (isMockMode()) {
    return await mockGetRecommendations(cartItems as any);
  }

  const payload = {
    cart_items: cartItems,
    scanned_item: cartItems.length > 0 ? cartItems[cartItems.length - 1] : undefined
  };

  const response = await fetchWithTimeout(`${BASE_URL}/api/v1/recommendations/generate`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error(`Gemma Recommendation service error (HTTP ${response.status}).`);
  }

  const data = (await response.json()) as RecommendationResponse;
  return data;
}

/**
 * REAL SENSOR TELEMETRY ENDPOINT
 */
export async function getSensorData(): Promise<SensorDataResponse> {
  if (isMockMode()) {
    return await mockGetSensorData();
  }

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
    throw new Error(`Load cell sensor service error (HTTP ${response.status}).`);
  }

  const rawData = await response.json();
  return {
    success: true,
    sensor: {
      weightKg: rawData.weightKg ?? rawData.weight_kg ?? 0.0,
      stable: rawData.stable ?? true,
      connected: rawData.connected ?? true,
      timestamp: rawData.timestamp || new Date().toISOString(),
    },
  };
}

/**
 * REAL CART CHECKOUT ENDPOINT
 */
export async function checkout(
  items: CartItemPayload[]
): Promise<CheckoutResponse> {
  if (isMockMode()) {
    return await mockCheckout(items);
  }

  const response = await fetchWithTimeout(`${BASE_URL}/api/cart/checkout`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ items }),
  });

  if (!response.ok) {
    throw new Error(`Checkout service error (HTTP ${response.status}).`);
  }

  const data = (await response.json()) as CheckoutResponse;
  return data;
}

/**
 * REAL GEMMA ASSISTANT CHAT ENDPOINT
 */
export async function sendChatMessage(message: string): Promise<ChatMessage> {
  if (isMockMode()) {
    return await mockSendChatMessage(message);
  }

  let response: Response;
  try {
    response = await fetchWithTimeout(`${BASE_URL}/api/v1/assistant/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message }),
    }, 120000);
  } catch {
    response = await fetchWithTimeout(`${BASE_URL}/api/assistant/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message }),
    }, 120000);
  }

  if (!response.ok) {
    throw new Error(`Gemma Assistant service error (HTTP ${response.status}).`);
  }

  const rawData = await response.json();
  
  return {
    id: rawData.id || `msg-bot-${Date.now()}`,
    sender: "assistant",
    text: rawData.response || rawData.text || "I have processed your query.",
    timestamp: rawData.timestamp || new Date().toLocaleTimeString(),
    targetAisle: rawData.target_aisle || rawData.targetAisle || undefined,
    targetProductId: rawData.targetProductId || rawData.target_product?.id || undefined,
    targetProductName: rawData.targetProductName || rawData.target_product?.name || undefined,
    targetProduct: rawData.targetProduct || rawData.target_product || undefined,
    multipleMatches: rawData.multipleMatches || rawData.multiple_matches || undefined,
    toolActivity: rawData.tool_activity || rawData.toolActivity || [],
    webSearchUsed: Boolean(
      rawData.tool_activity?.some(
        (t: { step?: string; action?: string }) =>
          t.step?.includes("Web") || t.action?.includes("search_web")
      )
    ),
  };
}

/**
 * REAL GEMMA ASSISTANT AUDIO ENDPOINT
 * Sends raw audio Blob to the Whisper backend, returns ChatMessage and audio Blob URL
 */
export async function sendAudioMessage(audioBlob: Blob): Promise<{ message: ChatMessage; audioUrl: string; transcribedText: string }> {
  if (isMockMode()) {
    throw new Error("Mock audio chat not implemented");
  }

  const formData = new FormData();
  formData.append("audio", audioBlob, "recording.webm");

  const response = await fetchWithTimeout(`${BASE_URL}/api/v1/assistant/audio-chat`, {
    method: "POST",
    body: formData,
  }, 120000); // 2 minute timeout for Whisper inference

  if (!response.ok) {
    throw new Error(`Audio Assistant service error (HTTP ${response.status}).`);
  }

  // Parse custom headers for text metadata
  const transcribedText = decodeURIComponent(response.headers.get("X-Transcribed-Text") || "");
  const botResponseHeader = response.headers.get("X-Bot-Response");
  let botData: any = {};
  
  if (botResponseHeader) {
    try {
      botData = JSON.parse(decodeURIComponent(botResponseHeader));
    } catch (e) {
      console.error("Failed to parse bot response header", e);
    }
  }

  const message: ChatMessage = {
    id: `msg-bot-${Date.now()}`,
    sender: "assistant",
    text: botData.text || "I processed your voice message.",
    timestamp: new Date().toLocaleTimeString(),
    targetAisle: botData.targetAisle,
    toolActivity: botData.toolActivity || [],
  };

  // Convert the response body (mp3) to an object URL for playback
  const responseBlob = await response.blob();
  const audioUrl = URL.createObjectURL(responseBlob);

  return { message, audioUrl, transcribedText };
}

/**
 * REAL NAVIGATION ROUTE ENDPOINT
 */
export async function getStoreRoute(
  startNode = "ENTRANCE",
  destNode = "AISLE_2"
): Promise<RouteData> {
  if (isMockMode()) {
    return await mockGetStoreRoute(startNode, destNode);
  }

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
    throw new Error(`Navigation route service error (HTTP ${response.status}).`);
  }

  const rawData = await response.json();
  return {
    currentLocation: rawData.current_location || rawData.currentLocation || startNode,
    targetLocation: rawData.target_location || rawData.targetLocation || destNode,
    waypoints: rawData.waypoints || [startNode, destNode],
    distanceMeters: rawData.distance_meters || rawData.distanceMeters || 10.0,
    estimatedTimeSeconds: rawData.estimated_time_seconds || rawData.estimatedTimeSeconds || 15,
  };
}
