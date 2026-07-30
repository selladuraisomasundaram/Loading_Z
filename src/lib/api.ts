import { GemmaDetectionResult, Recommendation, CartItemType } from "@/types";
import { mockIdentifyProduct, mockGetRecommendations } from "./mock-api";

/**
 * Decoupled Frontend API Abstraction for Vision AI Product Identification.
 * 
 * BACKEND INTEGRATION NOTE FOR TEAM:
 * To replace this mock implementation with the live FastAPI / Gemma endpoint:
 * 1. Comment out the `mockIdentifyProduct(file)` call below.
 * 2. Uncomment the REST API fetch block to send `file` as multipart/form-data.
 */
export async function identifyProduct(file: File): Promise<GemmaDetectionResult> {
  return await mockIdentifyProduct(file);
}

/**
 * Decoupled Frontend API Abstraction for AI Product Recommendations.
 * 
 * BACKEND INTEGRATION NOTE FOR TEAM:
 * To replace this mock implementation with the live FastAPI / Gemma endpoint:
 * 1. Comment out `mockGetRecommendations(cartItems)`.
 * 2. Uncomment the REST API fetch block below (`POST /api/v1/recommendations`).
 * 
 * @param cartItems Active items in trolley cart
 * @returns Promise<Recommendation[]> Array of AI-recommended products
 */
export async function getRecommendations(
  cartItems: CartItemType[]
): Promise<Recommendation[]> {
  // Current Frontend Mock Abstraction:
  return await mockGetRecommendations(cartItems);

  /* Future FastAPI / Gemma Backend Integration Endpoint:
  const response = await fetch("http://localhost:8000/api/v1/recommendations", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ cartItems }),
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch recommendations: ${response.statusText}`);
  }

  return (await response.json()) as Recommendation[];
  */
}
