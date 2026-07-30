import { GemmaDetectionResult, Recommendation, CartItemType } from "@/types";

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

const mockRecommendationsCatalog: Recommendation[] = [
  {
    id: "rec-001",
    title: "You may also like",
    product: {
      id: "SKU-000301",
      name: "Tomato Ketchup 500g",
      brand: "Heinz",
      category: "Condiments",
      price: 99.0,
      weightGrams: 500,
    },
    reason: "Pairs well with items in your cart",
  },
  {
    id: "rec-002",
    title: "Frequently Bought Together",
    product: {
      id: "SKU-000302",
      name: "Unsalted Creamery Butter 200g",
      brand: "Amul",
      category: "Dairy",
      price: 58.0,
      weightGrams: 200,
    },
    reason: "Frequently bought with Sourdough Bread",
  },
  {
    id: "rec-003",
    title: "Trending in Pantry",
    product: {
      id: "SKU-000303",
      name: "Classic Roasted Oats 500g",
      brand: "Quaker",
      category: "Breakfast Cereal",
      price: 185.0,
      weightGrams: 500,
    },
    reason: "Popular healthy breakfast choice",
  },
];

/**
 * Mock API service simulating Vision AI inference on uploaded image files.
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

/**
 * Mock API service retrieving AI recommendations based on active cart items.
 */
export async function mockGetRecommendations(
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _cartItems: CartItemType[]
): Promise<Recommendation[]> {
  await new Promise((resolve) => setTimeout(resolve, 400));
  return mockRecommendationsCatalog;
}
