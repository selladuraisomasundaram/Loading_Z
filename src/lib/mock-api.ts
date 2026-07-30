import { GemmaDetectionResult } from "@/types";

const mockVisionCatalog: Omit<GemmaDetectionResult, "detectedAt">[] = [
  {
    product_id: "SKU-000123",
    product_name: "Maggi Noodles 2-Min",
    brand: "Nestle",
    category: "Snacks",
    sub_category: "Instant Foods",
    price: 14.0,
    confidence: 0.96,
    verified: true,
    estimatedWeightGrams: 70,
  },
  {
    product_id: "SKU-000456",
    product_name: "Almond Milk Unsweetened 1L",
    brand: "Silk Fresh",
    category: "Beverages",
    sub_category: "Dairy Alternatives",
    price: 190.0,
    confidence: 0.98,
    verified: true,
    estimatedWeightGrams: 1020,
  },
  {
    product_id: "SKU-000789",
    product_name: "Dark Chocolate Almond Bar 100g",
    brand: "Lindt Excellence",
    category: "Snacks",
    sub_category: "Confectionery",
    price: 150.0,
    confidence: 0.94,
    verified: true,
    estimatedWeightGrams: 105,
  },
];

/**
 * Mock API service simulating Vision AI inference on uploaded image files.
 * Provides a 1.2-second network latency simulation.
 */
export async function mockIdentifyProduct(file: File): Promise<GemmaDetectionResult> {
  await new Promise((resolve) => setTimeout(resolve, 1200));

  const index = Math.abs(file.name.length) % mockVisionCatalog.length;
  const match = mockVisionCatalog[index] ?? mockVisionCatalog[0]!;

  return {
    ...match,
    detectedAt: new Date().toLocaleTimeString(),
  };
}
