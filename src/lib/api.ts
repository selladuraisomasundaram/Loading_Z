import { GemmaDetectionResult } from "@/types";
import { mockIdentifyProduct } from "./mock-api";

/**
 * Decoupled Frontend API Abstraction for Vision AI Product Identification.
 * 
 * BACKEND INTEGRATION NOTE FOR TEAM:
 * To replace this mock implementation with the live FastAPI / Gemma endpoint:
 * 1. Comment out the `mockIdentifyProduct(file)` call below.
 * 2. Uncomment the REST API fetch block to send `file` as multipart/form-data.
 * 
 * @param file The uploaded product image file (JPG, PNG, WEBP)
 * @returns Promise<GemmaDetectionResult> Structured detection output
 */
export async function identifyProduct(file: File): Promise<GemmaDetectionResult> {
  // Current Frontend Mock Abstraction:
  return await mockIdentifyProduct(file);

  /* Future FastAPI / Gemma Backend Integration Endpoint:
  const formData = new FormData();
  formData.append("image", file);

  const response = await fetch("http://localhost:8000/api/v1/identify-product", {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    throw new Error(`Vision AI identification failed: ${response.statusText}`);
  }

  return (await response.json()) as GemmaDetectionResult;
  */
}
