import { Product } from "@/types";

export interface DetailedShelfRack {
  id: string;
  label: string;
  x: number;
  y: number;
  width: number;
  height: number;
  side: "left" | "right" | "top" | "bottom";
}

export interface SupermarketZone {
  id: string;
  name: string;
  category: string;
  x: number;
  y: number;
  width: number;
  height: number;
  color: string;
  borderColor: string;
  badgeBg: string;
  badgeText: string;
}

export interface AisleData {
  id: string;
  zoneId: string;
  name: string;
  label: string;
  category: string;
  row: "A" | "B" | "C";
  col: 1 | 2 | 3 | 4;
  x: number;
  y: number;
  width: number;
  height: number;
  orientation: "horizontal" | "vertical";
  shelfCount: number;
  shelves: DetailedShelfRack[];
  description: string;
}

export interface StoreZoneData {
  id: string;
  name: string;
  type: "entrance" | "checkout" | "corridor" | "info";
  x: number;
  y: number;
  width: number;
  height: number;
  description?: string;
}

export interface StoreBoundaryData {
  x: number;
  y: number;
  width: number;
  height: number;
  wallThickness: number;
}

export interface WalkableCorridorData {
  id: string;
  name: string;
  x: number;
  y: number;
  width: number;
  height: number;
  direction: "horizontal" | "vertical";
}

export interface MajorZoneData {
  id: string;
  name: string;
  color: string;
  badgeBg: string;
  badgeText: string;
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface CheckoutLaneData {
  id: string;
  label: string;
  x: number;
  y: number;
  width: number;
  height: number;
  status: "active" | "express";
}

export interface GatewayData {
  id: string;
  label: string;
  type: "entry" | "exit";
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface StoreMapDimensions {
  viewWidth: number;
  viewHeight: number;
  boundaries: StoreBoundaryData;
}

export const storeMapConfig: StoreMapDimensions = {
  viewWidth: 900,
  viewHeight: 600,
  boundaries: {
    x: 40,
    y: 40,
    width: 820,
    height: 540,
    wallThickness: 6,
  },
};

export const detailedSupermarketZones: SupermarketZone[] = [
  {
    id: "ZONE_FRUITS_VEG",
    name: "Fruits & Vegetables",
    category: "Fresh Produce",
    x: 60,
    y: 60,
    width: 175,
    height: 130,
    color: "#ecfdf5",
    borderColor: "#10b981",
    badgeBg: "#059669",
    badgeText: "#ffffff",
  },
  {
    id: "ZONE_BAKERY",
    name: "Bakery",
    category: "Artisan Breads",
    x: 250,
    y: 60,
    width: 175,
    height: 130,
    color: "#fff7ed",
    borderColor: "#f97316",
    badgeBg: "#ea580c",
    badgeText: "#ffffff",
  },
  {
    id: "ZONE_SNACKS",
    name: "Biscuits & Snacks",
    category: "Confectionery & Crisps",
    x: 440,
    y: 60,
    width: 195,
    height: 130,
    color: "#fefce8",
    borderColor: "#eab308",
    badgeBg: "#ca8a04",
    badgeText: "#ffffff",
  },
  {
    id: "ZONE_BEVERAGES",
    name: "Beverages",
    category: "Cold Drinks & Juices",
    x: 650,
    y: 60,
    width: 190,
    height: 130,
    color: "#f0f9ff",
    borderColor: "#06b6d4",
    badgeBg: "#0891b2",
    badgeText: "#ffffff",
  },
  {
    id: "ZONE_GROCERY",
    name: "Grocery",
    category: "Staples, Grains & Oils",
    x: 60,
    y: 210,
    width: 175,
    height: 130,
    color: "#fff2f2",
    borderColor: "#f43f5e",
    badgeBg: "#e11d48",
    badgeText: "#ffffff",
  },
  {
    id: "ZONE_PREPARED_FOOD",
    name: "Food",
    category: "Instant & Prepared Foods",
    x: 250,
    y: 210,
    width: 175,
    height: 130,
    color: "#faf5ff",
    borderColor: "#a855f7",
    badgeBg: "#9333ea",
    badgeText: "#ffffff",
  },
  {
    id: "ZONE_PERSONAL_CARE",
    name: "Personal Care",
    category: "Health & Beauty",
    x: 440,
    y: 210,
    width: 195,
    height: 130,
    color: "#fdf4ff",
    borderColor: "#d946ef",
    badgeBg: "#c026d3",
    badgeText: "#ffffff",
  },
  {
    id: "ZONE_HOUSEHOLD",
    name: "Household",
    category: "Detergents & Cleaning",
    x: 650,
    y: 210,
    width: 190,
    height: 130,
    color: "#f1f5f9",
    borderColor: "#64748b",
    badgeBg: "#475569",
    badgeText: "#ffffff",
  },
  {
    id: "ZONE_DAIRY",
    name: "Dairy",
    category: "Milk, Butter & Cheese",
    x: 60,
    y: 360,
    width: 380,
    height: 130,
    color: "#eff6ff",
    borderColor: "#3b82f6",
    badgeBg: "#2563eb",
    badgeText: "#ffffff",
  },
  {
    id: "ZONE_FROZEN",
    name: "Frozen Food",
    category: "Ice Cream & Frozen Meals",
    x: 460,
    y: 360,
    width: 380,
    height: 130,
    color: "#f0fdf4",
    borderColor: "#22c55e",
    badgeBg: "#16a34a",
    badgeText: "#ffffff",
  },
  {
    id: "ZONE_CHECKOUT",
    name: "Checkout",
    category: "Payment & Exit Gateways",
    x: 485,
    y: 505,
    width: 345,
    height: 60,
    color: "#312e81",
    borderColor: "#818cf8",
    badgeBg: "#4338ca",
    badgeText: "#ffffff",
  },
];

export const majorStoreZones: MajorZoneData[] = detailedSupermarketZones.map(z => ({
  id: z.id,
  name: z.name,
  color: z.color,
  badgeBg: z.badgeBg,
  badgeText: z.badgeText,
  x: z.x,
  y: z.y,
  width: z.width,
  height: z.height,
}));

export const walkableCorridors: WalkableCorridorData[] = [
  {
    id: "MAIN_ENTRY_CORRIDOR",
    name: "Main Entrance Concourse",
    x: 60,
    y: 490,
    width: 780,
    height: 70,
    direction: "horizontal",
  },
  {
    id: "ROW_A_CORRIDOR",
    name: "Produce & Bakery Walkway",
    x: 60,
    y: 170,
    width: 780,
    height: 40,
    direction: "horizontal",
  },
  {
    id: "ROW_B_CORRIDOR",
    name: "Grocery & Food Walkway",
    x: 60,
    y: 320,
    width: 780,
    height: 40,
    direction: "horizontal",
  },
  {
    id: "WEST_CORRIDOR",
    name: "West Perimeter Aisle",
    x: 50,
    y: 60,
    width: 30,
    height: 430,
    direction: "vertical",
  },
  {
    id: "CENTRAL_CORRIDOR",
    name: "Central Store Spine",
    x: 430,
    y: 60,
    width: 30,
    height: 430,
    direction: "vertical",
  },
  {
    id: "EAST_CORRIDOR",
    name: "East Perimeter Aisle",
    x: 790,
    y: 60,
    width: 30,
    height: 430,
    direction: "vertical",
  },
];

export const checkoutLanes: CheckoutLaneData[] = [
  { id: "LANE_1", label: "Lane 1", x: 500, y: 515, width: 35, height: 45, status: "express" },
  { id: "LANE_2", label: "Lane 2", x: 545, y: 515, width: 35, height: 45, status: "active" },
  { id: "LANE_3", label: "Lane 3", x: 590, y: 515, width: 35, height: 45, status: "active" },
  { id: "LANE_4", label: "Lane 4", x: 635, y: 515, width: 35, height: 45, status: "express" },
];

export const entryExitGateways: GatewayData[] = [
  { id: "GATEWAY_ENTRY", label: "ENTRY", type: "entry", x: 75, y: 515, width: 140, height: 45 },
  { id: "GATEWAY_EXIT", label: "EXIT", type: "exit", x: 690, y: 515, width: 120, height: 45 },
];

export const storeAisles: AisleData[] = [
  // ROW A (Top Row: Fruits & Veg, Bakery, Snacks, Beverages)
  {
    id: "A1",
    zoneId: "ZONE_FRUITS_VEG",
    name: "Aisle A1 - Fresh Fruits & Vegetables",
    label: "A1",
    category: "Fruits & Vegetables",
    row: "A",
    col: 1,
    x: 80,
    y: 80,
    width: 140,
    height: 90,
    orientation: "horizontal",
    shelfCount: 4,
    shelves: [
      { id: "A1-S1", label: "Organic Produce Shelf S1", x: 84, y: 84, width: 132, height: 16, side: "top" },
      { id: "A1-S2", label: "Fresh Vegetables Shelf S2", x: 84, y: 104, width: 132, height: 16, side: "top" },
      { id: "A1-S3", label: "Tropical Fruits Shelf S3", x: 84, y: 128, width: 132, height: 16, side: "bottom" },
      { id: "A1-S4", label: "Salads & Herbs Shelf S4", x: 84, y: 148, width: 132, height: 16, side: "bottom" },
    ],
    description: "Apples, Bananas, Organic Salads & Fresh Vegetables",
  },
  {
    id: "A2",
    zoneId: "ZONE_BAKERY",
    name: "Aisle A2 - Bakery & Artisan Breads",
    label: "A2",
    category: "Bakery",
    row: "A",
    col: 2,
    x: 270,
    y: 80,
    width: 140,
    height: 90,
    orientation: "horizontal",
    shelfCount: 4,
    shelves: [
      { id: "A2-S1", label: "Artisan Breads Shelf S1", x: 274, y: 84, width: 132, height: 16, side: "top" },
      { id: "A2-S2", label: "Croissants & Buns Shelf S2", x: 274, y: 104, width: 132, height: 16, side: "top" },
      { id: "A2-S3", label: "Cakes & Muffins Shelf S3", x: 274, y: 128, width: 132, height: 16, side: "bottom" },
      { id: "A2-S4", label: "Toast & Bagels Shelf S4", x: 274, y: 148, width: 132, height: 16, side: "bottom" },
    ],
    description: "Sourdough Breads, Croissants, Cakes & Muffins",
  },
  {
    id: "A3",
    zoneId: "ZONE_SNACKS",
    name: "Aisle A3 - Biscuits & Snacks",
    label: "A3",
    category: "Biscuits & Snacks",
    row: "A",
    col: 3,
    x: 460,
    y: 80,
    width: 140,
    height: 90,
    orientation: "horizontal",
    shelfCount: 4,
    shelves: [
      { id: "A3-S1", label: "Glucose Biscuits Shelf S1", x: 464, y: 84, width: 132, height: 16, side: "top" },
      { id: "A3-S2", label: "Choco Cookies Shelf S2", x: 464, y: 104, width: 132, height: 16, side: "top" },
      { id: "A3-S3", label: "Potato Crisps Shelf S3", x: 464, y: 128, width: 132, height: 16, side: "bottom" },
      { id: "A3-S4", label: "Salted Nuts Shelf S4", x: 464, y: 148, width: 132, height: 16, side: "bottom" },
    ],
    description: "Parle-G, Oreo Biscuits, Crisps & Chocolates",
  },
  {
    id: "A4",
    zoneId: "ZONE_BEVERAGES",
    name: "Aisle A4 - Beverages & Juices",
    label: "A4",
    category: "Beverages",
    row: "A",
    col: 4,
    x: 650,
    y: 80,
    width: 140,
    height: 90,
    orientation: "horizontal",
    shelfCount: 4,
    shelves: [
      { id: "A4-S1", label: "Fruit Juices Shelf S1", x: 654, y: 84, width: 132, height: 16, side: "top" },
      { id: "A4-S2", label: "Sparkling Sodas Shelf S2", x: 654, y: 104, width: 132, height: 16, side: "top" },
      { id: "A4-S3", label: "Energy Drinks Shelf S3", x: 654, y: 128, width: 132, height: 16, side: "bottom" },
      { id: "A4-S4", label: "Bottled Mineral Water S4", x: 654, y: 148, width: 132, height: 16, side: "bottom" },
    ],
    description: "Cold Beverages, Energy Drinks & Mineral Water",
  },

  // ROW B (Middle Row: Grocery, Food, Personal Care, Household)
  {
    id: "B1",
    zoneId: "ZONE_GROCERY",
    name: "Aisle B1 - Grocery Staples",
    label: "B1",
    category: "Grocery",
    row: "B",
    col: 1,
    x: 80,
    y: 230,
    width: 140,
    height: 90,
    orientation: "horizontal",
    shelfCount: 4,
    shelves: [
      { id: "B1-S1", label: "Rice & Grains Shelf S1", x: 84, y: 234, width: 132, height: 16, side: "top" },
      { id: "B1-S2", label: "Pulses & Lentils Shelf S2", x: 84, y: 254, width: 132, height: 16, side: "top" },
      { id: "B1-S3", label: "Flour & Atta Shelf S3", x: 84, y: 278, width: 132, height: 16, side: "bottom" },
      { id: "B1-S4", label: "Cooking Oils Shelf S4", x: 84, y: 298, width: 132, height: 16, side: "bottom" },
    ],
    description: "Basmati Rice, Pulses, Wheat Flour & Edible Oils",
  },
  {
    id: "B2",
    zoneId: "ZONE_PREPARED_FOOD",
    name: "Aisle B2 - Instant Food & Noodles",
    label: "B2",
    category: "Food",
    row: "B",
    col: 2,
    x: 270,
    y: 230,
    width: 140,
    height: 90,
    orientation: "horizontal",
    shelfCount: 4,
    shelves: [
      { id: "B2-S1", label: "Maggi Noodles Shelf S1", x: 274, y: 234, width: 132, height: 16, side: "top" },
      { id: "B2-S2", label: "Pasta & Ketchup Shelf S2", x: 274, y: 254, width: 132, height: 16, side: "top" },
      { id: "B2-S3", label: "Ready Mixes Shelf S3", x: 274, y: 278, width: 132, height: 16, side: "bottom" },
      { id: "B2-S4", label: "Breakfast Cereals Shelf S4", x: 274, y: 298, width: 132, height: 16, side: "bottom" },
    ],
    description: "Maggi Noodles, Pasta, Soups & Instant Oatmeal",
  },
  {
    id: "B3",
    zoneId: "ZONE_PERSONAL_CARE",
    name: "Aisle B3 - Personal Care & Hygiene",
    label: "B3",
    category: "Personal Care",
    row: "B",
    col: 3,
    x: 460,
    y: 230,
    width: 140,
    height: 90,
    orientation: "horizontal",
    shelfCount: 4,
    shelves: [
      { id: "B3-S1", label: "Soaps & Body Wash Shelf S1", x: 464, y: 234, width: 132, height: 16, side: "top" },
      { id: "B3-S2", label: "Shampoo & Conditioners S2", x: 464, y: 254, width: 132, height: 16, side: "top" },
      { id: "B3-S3", label: "Oral Care & Toothpaste S3", x: 464, y: 278, width: 132, height: 16, side: "bottom" },
      { id: "B3-S4", label: "Skin Creams & Lotion S4", x: 464, y: 298, width: 132, height: 16, side: "bottom" },
    ],
    description: "Soaps, Shampoos, Toothpaste & Skincare Products",
  },
  {
    id: "B4",
    zoneId: "ZONE_HOUSEHOLD",
    name: "Aisle B4 - Household Cleaners",
    label: "B4",
    category: "Household",
    row: "B",
    col: 4,
    x: 650,
    y: 230,
    width: 140,
    height: 90,
    orientation: "horizontal",
    shelfCount: 4,
    shelves: [
      { id: "B4-S1", label: "Laundry Detergents Shelf S1", x: 654, y: 234, width: 132, height: 16, side: "top" },
      { id: "B4-S2", label: "Dishwashers Shelf S2", x: 654, y: 254, width: 132, height: 16, side: "top" },
      { id: "B4-S3", label: "Floor Cleaners Shelf S3", x: 654, y: 278, width: 132, height: 16, side: "bottom" },
      { id: "B4-S4", label: "Paper Towels & Bags S4", x: 654, y: 298, width: 132, height: 16, side: "bottom" },
    ],
    description: "Detergent Powders, Liquid Cleaners & Trash Bags",
  },

  // ROW C (Bottom Row: Dairy, Frozen Food)
  {
    id: "C1",
    zoneId: "ZONE_DAIRY",
    name: "Aisle C1 - Dairy & Fresh Milk",
    label: "C1",
    category: "Dairy",
    row: "C",
    col: 1,
    x: 80,
    y: 380,
    width: 140,
    height: 90,
    orientation: "horizontal",
    shelfCount: 4,
    shelves: [
      { id: "C1-S1", label: "Amul Milk Shelf S1", x: 84, y: 384, width: 132, height: 16, side: "top" },
      { id: "C1-S2", label: "Butter & Cheese Shelf S2", x: 84, y: 404, width: 132, height: 16, side: "top" },
      { id: "C1-S3", label: "Yogurt & Cream Shelf S3", x: 84, y: 428, width: 132, height: 16, side: "bottom" },
      { id: "C1-S4", label: "Paneer & Tofu Shelf S4", x: 84, y: 448, width: 132, height: 16, side: "bottom" },
    ],
    description: "Amul Milk, Fresh Butter, Cheese & Paneer",
  },
  {
    id: "C2",
    zoneId: "ZONE_FROZEN",
    name: "Aisle C2 - Frozen Food & Ice Cream",
    label: "C2",
    category: "Frozen Food",
    row: "C",
    col: 2,
    x: 270,
    y: 380,
    width: 140,
    height: 90,
    orientation: "horizontal",
    shelfCount: 4,
    shelves: [
      { id: "C2-S1", label: "Ice Cream Tubs Shelf S1", x: 274, y: 384, width: 132, height: 16, side: "top" },
      { id: "C2-S2", label: "Frozen Veggies Shelf S2", x: 274, y: 404, width: 132, height: 16, side: "top" },
      { id: "C2-S3", label: "French Fries Shelf S3", x: 274, y: 428, width: 132, height: 16, side: "bottom" },
      { id: "C2-S4", label: "Frozen Snacks Shelf S4", x: 274, y: 448, width: 132, height: 16, side: "bottom" },
    ],
    description: "Ice Cream, Frozen Peas, Corn & Ready Snacks",
  },
  {
    id: "C3",
    zoneId: "ZONE_GROCERY",
    name: "Aisle C3 - Pantry Oils & Spices",
    label: "C3",
    category: "Grocery",
    row: "C",
    col: 3,
    x: 460,
    y: 380,
    width: 140,
    height: 90,
    orientation: "horizontal",
    shelfCount: 4,
    shelves: [
      { id: "C3-S1", label: "Olive Oil Shelf S1", x: 464, y: 384, width: 132, height: 16, side: "top" },
      { id: "C3-S2", label: "Ground Spices Shelf S2", x: 464, y: 404, width: 132, height: 16, side: "top" },
      { id: "C3-S3", label: "Sugar & Salt Shelf S3", x: 464, y: 428, width: 132, height: 16, side: "bottom" },
      { id: "C3-S4", label: "Sauces & Dressings S4", x: 464, y: 448, width: 132, height: 16, side: "bottom" },
    ],
    description: "Olive Oils, Spices, Seasonings & Sauces",
  },
  {
    id: "C4",
    zoneId: "ZONE_HOUSEHOLD",
    name: "Aisle C4 - Home Accessories",
    label: "C4",
    category: "Household",
    row: "C",
    col: 4,
    x: 650,
    y: 380,
    width: 140,
    height: 90,
    orientation: "horizontal",
    shelfCount: 4,
    shelves: [
      { id: "C4-S1", label: "Kitchenware Shelf S1", x: 654, y: 384, width: 132, height: 16, side: "top" },
      { id: "C4-S2", label: "Cleaning Cloths Shelf S2", x: 654, y: 404, width: 132, height: 16, side: "top" },
      { id: "C4-S3", label: "Storage Bins Shelf S3", x: 654, y: 428, width: 132, height: 16, side: "bottom" },
      { id: "C4-S4", label: "Air Fresheners Shelf S4", x: 654, y: 448, width: 132, height: 16, side: "bottom" },
    ],
    description: "Kitchen Utensils, Storage Bins & Air Fresheners",
  },
];

export const storeZones: StoreZoneData[] = [
  {
    id: "ENTRANCE",
    name: "ENTRANCE & TROLLEY DOCK",
    type: "entrance",
    x: 80,
    y: 510,
    width: 220,
    height: 55,
    description: "Main Supermarket Entry & Smart Trolley Pickup Dock",
  },
  {
    id: "CHECKOUT",
    name: "EXPRESS CHECKOUT",
    type: "checkout",
    x: 570,
    y: 510,
    width: 220,
    height: 55,
    description: "Automated Self-Checkout Counters & Exit Gateway",
  },
];

export const catalogProducts: Product[] = [
  {
    id: "SKU-004",
    productId: "SKU-004",
    name: "Aashirvaad Whole Wheat Flour 5kg",
    productName: "Aashirvaad Whole Wheat Flour 5kg",
    price: 245.0,
    weightGrams: 5000,
    category: "Grocery",
    brand: "Aashirvaad",
    stock: 25,
    aisleId: "B1",
    shelfId: "B1-S3",
    mapX: 130,
    mapY: 285,
    availability: "In Stock",
    location: {
      aisleId: "B1",
      shelfId: "B1-S3",
      shelfName: "Flour & Atta Shelf S3",
      x: 130,
      y: 285,
    },
  },
  {
    id: "P001",
    productId: "P001",
    name: "Parle-G Glucose Biscuits 250g",
    productName: "Parle-G Glucose Biscuits 250g",
    price: 20.0,
    weightGrams: 250,
    category: "Biscuits & Snacks",
    brand: "Parle",
    stock: 45,
    aisleId: "A3",
    shelfId: "A3-S1",
    mapX: 510,
    mapY: 95,
    availability: "In Stock",
    location: {
      aisleId: "A3",
      shelfId: "A3-S1",
      shelfName: "Glucose Biscuits Shelf S1",
      x: 510,
      y: 95,
    },
  },
  {
    id: "SKU-001",
    productId: "SKU-001",
    name: "Maggi 2-Min Instant Noodles 70g",
    productName: "Maggi 2-Min Instant Noodles 70g",
    price: 14.0,
    weightGrams: 70,
    category: "Food",
    brand: "Nestle",
    stock: 80,
    aisleId: "B2",
    shelfId: "B2-S1",
    mapX: 320,
    mapY: 245,
    availability: "In Stock",
    location: {
      aisleId: "B2",
      shelfId: "B2-S1",
      shelfName: "Maggi Noodles Shelf S1",
      x: 320,
      y: 245,
    },
  },
  {
    id: "P003",
    productId: "P003",
    name: "Amul Whole Milk 1L",
    productName: "Amul Whole Milk 1L",
    price: 68.0,
    weightGrams: 1030,
    category: "Dairy",
    brand: "Amul",
    stock: 30,
    aisleId: "C1",
    shelfId: "C1-S1",
    mapX: 130,
    mapY: 395,
    availability: "In Stock",
    location: {
      aisleId: "C1",
      shelfId: "C1-S1",
      shelfName: "Amul Milk Shelf S1",
      x: 130,
      y: 395,
    },
  },
  {
    id: "P004",
    productId: "P004",
    name: "Amul Unsalted Butter 200g",
    productName: "Amul Unsalted Butter 200g",
    price: 58.0,
    weightGrams: 200,
    category: "Dairy",
    brand: "Amul",
    stock: 40,
    aisleId: "C1",
    shelfId: "C1-S2",
    mapX: 150,
    mapY: 415,
    availability: "In Stock",
    location: {
      aisleId: "C1",
      shelfId: "C1-S2",
      shelfName: "Butter & Cheese Shelf S2",
      x: 150,
      y: 415,
    },
  },
  {
    id: "P005",
    productId: "P005",
    name: "Borges Extra Virgin Olive Oil 500ml",
    productName: "Borges Extra Virgin Olive Oil 500ml",
    price: 590.0,
    weightGrams: 500,
    category: "Grocery",
    brand: "Borges",
    stock: 15,
    aisleId: "C3",
    shelfId: "C3-S1",
    mapX: 530,
    mapY: 395,
    availability: "In Stock",
    location: {
      aisleId: "C3",
      shelfId: "C3-S1",
      shelfName: "Olive Oil Shelf S1",
      x: 530,
      y: 395,
    },
  },
  {
    id: "P006",
    productId: "P006",
    name: "Silk Almond Milk Unsweetened 1L",
    productName: "Silk Almond Milk Unsweetened 1L",
    price: 190.0,
    weightGrams: 1000,
    category: "Beverages",
    brand: "Silk",
    stock: 20,
    aisleId: "A4",
    shelfId: "A4-S1",
    mapX: 710,
    mapY: 95,
    availability: "In Stock",
    location: {
      aisleId: "A4",
      shelfId: "A4-S1",
      shelfName: "Fruit Juices Shelf S1",
      x: 710,
      y: 95,
    },
  },
  {
    id: "P007",
    productId: "P007",
    name: "Lindt Excellence Dark Chocolate 100g",
    productName: "Lindt Excellence Dark Chocolate 100g",
    price: 150.0,
    weightGrams: 100,
    category: "Biscuits & Snacks",
    brand: "Lindt",
    stock: 35,
    aisleId: "A3",
    shelfId: "A3-S2",
    mapX: 540,
    mapY: 115,
    availability: "In Stock",
    location: {
      aisleId: "A3",
      shelfId: "A3-S2",
      shelfName: "Choco Cookies Shelf S2",
      x: 540,
      y: 115,
    },
  },
  {
    id: "P008",
    productId: "P008",
    name: "Fresh Organic Bananas 1kg",
    productName: "Fresh Organic Bananas 1kg",
    price: 60.0,
    weightGrams: 1000,
    category: "Fruits & Vegetables",
    brand: "Fresh Farm",
    stock: 50,
    aisleId: "A1",
    shelfId: "A1-S1",
    mapX: 130,
    mapY: 95,
    availability: "In Stock",
    location: {
      aisleId: "A1",
      shelfId: "A1-S1",
      shelfName: "Organic Produce Shelf S1",
      x: 130,
      y: 95,
    },
  },
  {
    id: "P009",
    productId: "P009",
    name: "Artisan Sourdough Bread 400g",
    productName: "Artisan Sourdough Bread 400g",
    price: 110.0,
    weightGrams: 400,
    category: "Bakery",
    brand: "Bakehouse",
    stock: 4,
    aisleId: "A2",
    shelfId: "A2-S1",
    mapX: 320,
    mapY: 95,
    availability: "Low Stock",
    location: {
      aisleId: "A2",
      shelfId: "A2-S1",
      shelfName: "Artisan Breads Shelf S1",
      x: 320,
      y: 95,
    },
  },
];
