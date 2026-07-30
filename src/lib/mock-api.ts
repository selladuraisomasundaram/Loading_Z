import { GemmaDetectionResult } from "@/types";

const mockVisionCatalog: GemmaDetectionResult[] = [
  {
    productName: "Almond Milk Unsweetened 1L",
    brand: "Silk Fresh",
    category: "Dairy Alternatives",
    confidence: 0.982,
    estimatedWeightGrams: 1020,
    verificationStatus: "Verified",
    suggestedPrice: 190.0,
    detectedAt: "",
  },
  {
    productName: "Organic Greek Yogurt 500g",
    brand: "Epigamia",
    category: "Dairy",
    confidence: 0.958,
    estimatedWeightGrams: 515,
    verificationStatus: "Verified",
    suggestedPrice: 125.0,
    detectedAt: "",
  },
  {
    productName: "Dark Chocolate Almond Bar 100g",
    brand: "Lindt Excellence",
    category: "Confectionery",
    confidence: 0.964,
    estimatedWeightGrams: 105,
    verificationStatus: "Verified",
    suggestedPrice: 150.0,
    detectedAt: "",
  },
  {
    productName: "Extra Virgin Olive Oil 500ml",
    brand: "Borges",
    category: "Pantry & Oils",
    confidence: 0.941,
    estimatedWeightGrams: 520,
    verificationStatus: "Verified",
    suggestedPrice: 420.0,
    detectedAt: "",
  },
];

/**
 * Mock API service simulating Vision AI inference on uploaded image files.
 * Provides a 1.2-second network delay.
 */
export async function mockIdentifyProduct(file: File): Promise<GemmaDetectionResult> {
  // Simulate network latency
  await new Promise((resolve) => setTimeout(resolve, 1200));

  // Pick a catalog item deterministically based on file name length or random fallback
  const index = Math.abs(file.name.length) % mockVisionCatalog.length;
  const match = mockVisionCatalog[index] ?? mockVisionCatalog[0]!;

  return {
    ...match,
    detectedAt: new Date().toLocaleTimeString(),
  };
}
