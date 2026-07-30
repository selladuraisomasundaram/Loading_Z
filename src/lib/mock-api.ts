import {
  ProductIdentificationResponse,
  RecommendationResponse,
  SensorDataResponse,
  CheckoutResponse,
  CartItemPayload,
  ChatMessage,
  RouteData,
} from "@/types";
import { supermarketGraph } from "./navigation/navigationGraph";
import { findShortestPathAStar, findNearestWalkableNode } from "./navigation/aStar";

const mockCatalog: ProductIdentificationResponse["product"][] = [
  {
    product_id: "SKU-004",
    product_name: "Aashirvaad Whole Wheat Flour 5kg",
    brand: "Aashirvaad",
    category: "Pantry",
    sub_category: "Flour & Atta",
    price: 245.0,
    image_url: null,
    confidence: 0.97,
    verified: true,
    estimatedWeightGrams: 5000,
  },
  {
    product_id: "SKU-001",
    product_name: "Maggi 2-Min Instant Noodles 70g",
    brand: "Nestle",
    category: "Instant Foods",
    sub_category: "Noodles",
    price: 14.0,
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
  await new Promise((resolve) => setTimeout(resolve, 800));

  const nameLower = file.name.toLowerCase();

  // Smart Vision OCR Keyword Matching
  let matchedProduct = mockCatalog.find(
    () =>
      nameLower.includes("aashirvaad") ||
      nameLower.includes("atta") ||
      nameLower.includes("flour") ||
      nameLower.includes("wheat") ||
      nameLower.includes("aashir")
  );

  if (!matchedProduct && (nameLower.includes("maggi") || nameLower.includes("noodle"))) {
    matchedProduct = mockCatalog.find((p) => p.product_id === "SKU-001");
  }

  if (!matchedProduct && (nameLower.includes("milk") || nameLower.includes("almond") || nameLower.includes("silk"))) {
    matchedProduct = mockCatalog.find((p) => p.product_id === "SKU-002");
  }

  if (!matchedProduct && (nameLower.includes("chocolate") || nameLower.includes("lindt") || nameLower.includes("dark"))) {
    matchedProduct = mockCatalog.find((p) => p.product_id === "SKU-003");
  }

  // Default to Aashirvaad Whole Wheat Flour for generic image uploads / screenshots
  if (!matchedProduct) {
    matchedProduct = mockCatalog.find((p) => p.product_id === "SKU-004") || mockCatalog[0]!;
  }

  return {
    success: true,
    product: matchedProduct,
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
    "SKU-001": 14.0,
    "SKU-002": 190.0,
    "SKU-003": 150.0,
    "SKU-004": 245.0,
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
  await new Promise((resolve) => setTimeout(resolve, 600));

  const lower = message.toLowerCase();

  // Intent 1: "Where is Parle-G?"
  if (lower.includes("parle") || lower.includes("parle-g")) {
    return {
      id: `msg-${Date.now()}`,
      sender: "assistant",
      text: "Gemma understood intent 'FIND_PRODUCT' for 'Parle-G'. Database lookup: Parle-G Glucose Biscuits 250g (₹20) is located in AISLE A3 (Biscuits & Snacks), Shelf S01 (x: 510, y: 95). A* pathfinding route generated.",
      timestamp: new Date().toLocaleTimeString(),
      targetAisle: "A3",
      targetProductId: "P001",
      toolActivity: [
        { step: "🧠 Gemma Intent Parsing", action: "Parsed intent: FIND_PRODUCT ('Parle-G')" },
        { step: "🔎 DB Source of Truth", action: "P001 -> Aisle A3, Shelf S01 (x:510, y:95)" },
        { step: "📍 Positioning Layer", action: "Retrieved current person position (120, 525)" },
        { step: "🧭 A* Navigation Engine", action: "Calculated shortest walkable route avoiding shelves" },
        { step: "🗺 Interactive Map UI", action: "Rendered 👤 You are here ────→ 📍 Parle-G (A3)" },
      ],
    };
  }

  // Intent 2: "Take me to shampoo" / Personal Care
  if (lower.includes("shampoo") || lower.includes("soap") || lower.includes("personal care")) {
    return {
      id: `msg-${Date.now()}`,
      sender: "assistant",
      text: "Gemma understood intent 'FIND_PRODUCT' for 'Shampoo & Personal Care'. Database lookup: Located in AISLE B3 (Personal Care & Hygiene), Shelf S02. Click 'SHOW ON MAP' to view the A* shortest walkable path.",
      timestamp: new Date().toLocaleTimeString(),
      targetAisle: "B3",
      targetProductId: "P007",
      toolActivity: [
        { step: "🧠 Gemma Intent Parsing", action: "Parsed intent: FIND_PRODUCT ('Shampoo')" },
        { step: "🔎 DB Source of Truth", action: "Aisle B3 - Personal Care, Shelf S02" },
        { step: "📍 Positioning Layer", action: "Retrieved current person position" },
        { step: "🧭 A* Navigation Engine", action: "Calculated walkable route to Aisle B3" },
        { step: "🗺 Interactive Map UI", action: "Highlighted Aisle B3 on floor plan" },
      ],
    };
  }

  // Intent 3: "Where is milk?" / Dairy
  if (lower.includes("milk") || lower.includes("amul") || lower.includes("butter")) {
    return {
      id: `msg-${Date.now()}`,
      sender: "assistant",
      text: "Gemma understood intent 'FIND_PRODUCT' for 'Amul Milk'. Database lookup: Amul Whole Milk 1L (₹68) is located in AISLE C1 (Dairy & Fresh Milk), Shelf S01. A* walkable route calculated.",
      timestamp: new Date().toLocaleTimeString(),
      targetAisle: "C1",
      targetProductId: "P003",
      toolActivity: [
        { step: "🧠 Gemma Intent Parsing", action: "Parsed intent: FIND_PRODUCT ('Amul Milk')" },
        { step: "🔎 DB Source of Truth", action: "P003 -> Aisle C1, Shelf S01 (x:130, y:395)" },
        { step: "📍 Positioning Layer", action: "Retrieved current person position" },
        { step: "🧭 A* Navigation Engine", action: "Calculated shortest walkable path" },
        { step: "🗺 Interactive Map UI", action: "Rendered 👤 You are here ────→ 📍 Amul Milk (C1)" },
      ],
    };
  }

  // Intent 4: "Show me biscuits"
  if (lower.includes("biscuit") || lower.includes("cookie") || lower.includes("snack")) {
    return {
      id: `msg-${Date.now()}`,
      sender: "assistant",
      text: "Gemma understood intent 'NAVIGATE_CATEGORY' for 'Biscuits & Snacks'. Database lookup: Found Parle-G Glucose Biscuits (₹20) and Lindt Dark Chocolate (₹150) in AISLE A3.",
      timestamp: new Date().toLocaleTimeString(),
      targetAisle: "A3",
      targetProductId: "P001",
      toolActivity: [
        { step: "🧠 Gemma Intent Parsing", action: "Parsed intent: NAVIGATE_CATEGORY ('Biscuits & Snacks')" },
        { step: "🔎 DB Source of Truth", action: "Queried active inventory in Aisle A3" },
        { step: "📍 Positioning Layer", action: "Retrieved current person position" },
        { step: "🧭 A* Navigation Engine", action: "Calculated walkable path to Biscuits section" },
        { step: "🗺 Interactive Map UI", action: "Rendered 👤 You are here ────→ 📍 Biscuits (A3)" },
      ],
    };
  }

  // Intent 5: "How do I reach the dairy section?"
  if (lower.includes("dairy") || lower.includes("reach")) {
    return {
      id: `msg-${Date.now()}`,
      sender: "assistant",
      text: "Gemma understood intent 'SECTION_INQUIRY' for 'Dairy Section'. Database lookup: Dairy department encompasses AISLE C1 (Milk, Butter, Cheese). Route updated on map.",
      timestamp: new Date().toLocaleTimeString(),
      targetAisle: "C1",
      targetProductId: "P003",
      toolActivity: [
        { step: "🧠 Gemma Intent Parsing", action: "Parsed intent: SECTION_INQUIRY ('Dairy')" },
        { step: "🔎 DB Source of Truth", action: "Mapped ZONE_DAIRY -> Aisle C1" },
        { step: "📍 Positioning Layer", action: "Retrieved current person position" },
        { step: "🧭 A* Navigation Engine", action: "Calculated A* route to Dairy section" },
        { step: "🗺 Interactive Map UI", action: "Rendered 👤 You are here ────→ 📍 Dairy Section" },
      ],
    };
  }

  return {
    id: `msg-${Date.now()}`,
    sender: "assistant",
    text: `Gemma processed input "${message}". Database lookup & A* pathfinder ready for product inquiry.`,
    timestamp: new Date().toLocaleTimeString(),
    toolActivity: [
      { step: "🧠 Gemma Intent Parsing", action: "Parsed general natural language intent" },
      { step: "🔎 DB Source of Truth", action: "Verified active product catalog" },
      { step: "🧭 A* Navigation Engine", action: "Ready for route traversal" },
    ],
  };
}

export async function mockGetStoreRoute(
  startNode = "ENTRANCE",
  destNode = "A3"
): Promise<RouteData> {
  await new Promise((resolve) => setTimeout(resolve, 200));

  let startId = "N_ENTRANCE";
  if (startNode === "CHECKOUT") startId = "N_CHECKOUT";

  let targetGraphNodeId = `N_AISLE_${destNode.replace(/\s+/g, "")}`;
  if (destNode === "ENTRANCE") targetGraphNodeId = "N_ENTRANCE";
  if (destNode === "CHECKOUT") targetGraphNodeId = "N_CHECKOUT";

  if (!supermarketGraph.nodes[targetGraphNodeId]) {
    const matched = Object.values(supermarketGraph.nodes).find(
      (n) => n.aisleId === destNode || n.id.includes(destNode)
    );
    if (matched) {
      targetGraphNodeId = matched.id;
    } else {
      const nearest = findNearestWalkableNode(supermarketGraph, 500, 200);
      targetGraphNodeId = nearest.id;
    }
  }

  const result = findShortestPathAStar(
    supermarketGraph,
    startId,
    targetGraphNodeId
  );

  return {
    currentLocation: startNode,
    targetLocation: destNode,
    targetProductName: `Aisle ${destNode}`,
    waypoints: result.pathNodeIds,
    distanceMeters: result.totalDistanceMeters,
    estimatedTimeSeconds: result.estimatedTimeSeconds,
  };
}
