import {
  ProductIdentificationResponse,
  RecommendationResponse,
  SensorDataResponse,
  CheckoutResponse,
  CartItemPayload,
} from "@/types/api";

const mockCatalog: ProductIdentificationResponse["product"][] = [
  {
    product_id: "SKU-001",
    product_name: "Maggi Noodles",
    brand: "Nestle",
    category: "Instant Foods",
    sub_category: "Noodles",
    price: 12.0,
    image_url: null,
    confidence: 0.96,
    verified: true,
    estimatedWeightGrams: 70,
  },
  {
    product_id: "SKU-002",
    product_name: "Almond Milk Unsweetened 1L",
    brand: "Silk Fresh",
    category: "Beverages",
    sub_category: "Dairy Alternatives",
    price: 190.0,
    image_url: null,
    confidence: 0.98,
    verified: true,
    estimatedWeightGrams: 1020,
  },
  {
    product_id: "SKU-003",
    product_name: "Dark Chocolate Almond Bar 100g",
    brand: "Lindt Excellence",
    category: "Snacks",
    sub_category: "Confectionery",
    price: 150.0,
    image_url: null,
    confidence: 0.94,
    verified: true,
    estimatedWeightGrams: 105,
  },
];

export async function mockIdentifyProduct(
  file: File
): Promise<ProductIdentificationResponse> {
  await new Promise((resolve) => setTimeout(resolve, 1200));

  const index = Math.abs(file.name.length) % mockCatalog.length;
  const product = mockCatalog[index] ?? mockCatalog[0]!;

  return {
    success: true,
    product,
  };
}

export async function mockGetRecommendations(
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _cartItems: CartItemPayload[]
): Promise<RecommendationResponse> {
  await new Promise((resolve) => setTimeout(resolve, 400));

  return {
    success: true,
    recommendations: [
      {
        product_id: "SKU-100",
        product_name: "Ketchup",
        price: 99.0,
        image_url: null,
        reason: "Pairs well with items in your cart",
      },
      {
        product_id: "SKU-101",
        product_name: "Unsalted Creamery Butter 200g",
        price: 58.0,
        image_url: null,
        reason: "Frequently bought with Sourdough Bread",
      },
      {
        product_id: "SKU-102",
        product_name: "Classic Roasted Oats 500g",
        price: 185.0,
        image_url: null,
        reason: "Popular healthy breakfast choice",
      },
    ],
  };
}

export async function mockGetSensorData(): Promise<SensorDataResponse> {
  await new Promise((resolve) => setTimeout(resolve, 200));

  return {
    success: true,
    sensor: {
      weightKg: 0.205,
      stable: true,
      connected: true,
      timestamp: new Date().toISOString(),
    },
  };
}

export async function mockCheckout(
  items: CartItemPayload[]
): Promise<CheckoutResponse> {
  await new Promise((resolve) => setTimeout(resolve, 800));

  const itemMap: Record<string, number> = {
    "SKU-001": 12.0,
    "SKU-002": 190.0,
    "SKU-003": 150.0,
    "SKU-100": 99.0,
    "SKU-101": 58.0,
    "SKU-102": 185.0,
  };

  const subtotal = items.reduce(
    (acc, curr) => acc + (itemMap[curr.product_id] || 20.0) * curr.quantity,
    0
  );
  const discount = subtotal > 150 ? 15.0 : 0;
  const taxable = Math.max(0, subtotal - discount);
  const tax = Math.round(taxable * 0.18 * 100) / 100;
  const total = Math.round((taxable + tax) * 100) / 100;

  return {
    success: true,
    order: {
      order_id: `ORDER-${Math.floor(100000 + Math.random() * 900000)}`,
      subtotal,
      discount,
      tax,
      total,
    },
  };
}
