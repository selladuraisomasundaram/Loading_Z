import {
  ProductIdentificationResponse,
  RecommendationResponse,
  SensorDataResponse,
  CheckoutResponse,
  CartItemPayload,
  ChatMessage,
} from "@/types";

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

export async function mockSendChatMessage(
  message: string
): Promise<ChatMessage> {
  await new Promise((resolve) => setTimeout(resolve, 900));

  const lower = message.toLowerCase();

  // Intent 1: "Where is Amul Butter?"
  if (lower.includes("butter") || lower.includes("amul")) {
    return {
      id: `msg-${Date.now()}`,
      sender: "assistant",
      text: "Amul Butter (200g, ₹58) is located in Aisle 3 (Dairy & Eggs), Shelf 2. Would you like to view the navigation path on the Store Map?",
      timestamp: new Date().toLocaleTimeString(),
      targetAisle: "Aisle 3",
      toolActivity: [
        { step: "🧠 Understanding intent", action: "Parsed entity: 'Amul Butter'" },
        { step: "🔎 Querying Product Catalog DB", action: "SKU-000302 found" },
        { step: "📍 Resolving Aisle location", action: "Matched Aisle 3 (Dairy & Eggs)" },
        { step: "🗺 Calculating path via Navigation Engine", action: "Distance: 12 meters" },
        { step: "✓ Response synthesized", action: "Generated interactive map trigger" },
      ],
    };
  }

  // Intent 2: "Find snacks under ₹50"
  if (lower.includes("snack") || lower.includes("under") || lower.includes("50")) {
    return {
      id: `msg-${Date.now()}`,
      sender: "assistant",
      text: "I found Maggi 2-Min Noodles (₹14, Aisle 4) and Roasted Peanuts (₹35, Aisle 4) matching snacks under ₹50 in catalog.",
      timestamp: new Date().toLocaleTimeString(),
      targetAisle: "Aisle 4",
      toolActivity: [
        { step: "🧠 Understanding intent", action: "Parsed query: 'Snacks < ₹50'" },
        { step: "🔎 Querying Product Catalog DB", action: "Filtered 2 products under ₹50" },
        { step: "📍 Resolving Aisle location", action: "Matched Aisle 4 (Instant Foods)" },
        { step: "✓ Response synthesized", action: "Formatted product listing" },
      ],
    };
  }

  // Intent 3: "What pairs well with Maggi?" (Triggers Web Research)
  if (lower.includes("maggi") || lower.includes("pair")) {
    return {
      id: `msg-${Date.now()}`,
      sender: "assistant",
      text: "Based on recipe index and web search, Maggi Noodles pair exceptionally well with Heinz Tomato Ketchup (Aisle 4), Melted Cheese (Aisle 3), and Crispy Oregano Seasoning.",
      timestamp: new Date().toLocaleTimeString(),
      targetAisle: "Aisle 4",
      webSearchUsed: true,
      webSearchResults: {
        query: "What pairs best with Maggi Instant Noodles?",
        sources: ["recipehub.org", "openfoodfacts.org", "nestle.in"],
        summary: "Top pairings include Tomato Ketchup, Processed Cheese Slices, Sweet Corn, and Oregano Spice Mix.",
      },
      toolActivity: [
        { step: "🧠 Understanding intent", action: "Parsed pair query for 'Maggi'" },
        { step: "🌐 Executing Web Search", action: "Queried external recipe index" },
        { step: "🔎 Querying Product Catalog DB", action: "Cross-referenced catalog SKUs" },
        { step: "✓ Response synthesized", action: "Synthesized web research summary" },
      ],
    };
  }

  // Fallback General Response
  return {
    id: `msg-${Date.now()}`,
    sender: "assistant",
    text: `I processed your request "${message}". I can help locate products, verify catalog prices, or find aisle paths across the store.`,
    timestamp: new Date().toLocaleTimeString(),
    toolActivity: [
      { step: "🧠 Understanding intent", action: "General intent analysis" },
      { step: "🔎 Querying Product Catalog DB", action: "Checked active inventory" },
      { step: "✓ Response synthesized", action: "Generated assistant guidance" },
    ],
  };
}
