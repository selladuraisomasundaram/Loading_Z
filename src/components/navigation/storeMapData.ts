export interface AisleData {
  id: string;
  label: string;
  category: string;
  row: "A" | "B" | "C";
  col: 1 | 2 | 3 | 4;
  x: number;
  y: number;
  width: number;
  height: number;
  shelfCount: number;
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

export interface StoreMapDimensions {
  viewWidth: number;
  viewHeight: number;
}

export const storeMapConfig: StoreMapDimensions = {
  viewWidth: 900,
  viewHeight: 600,
};

/**
 * Structured Supermarket Aisle Data Model (12 Aisles: A1-A4, B1-B4, C1-C4)
 * Designed for future Phase 2 Product -> Aisle -> Shelf -> Node mapping.
 */
export const storeAisles: AisleData[] = [
  // ROW A (Top Row: y = 80)
  {
    id: "A1",
    label: "A1",
    category: "Fresh Fruits & Produce",
    row: "A",
    col: 1,
    x: 80,
    y: 80,
    width: 140,
    height: 90,
    shelfCount: 4,
    description: "Apples, Bananas, Organic Salads & Fresh Vegetables",
  },
  {
    id: "A2",
    label: "A2",
    category: "Bakery & Artisan Bread",
    row: "A",
    col: 2,
    x: 270,
    y: 80,
    width: 140,
    height: 90,
    shelfCount: 4,
    description: "Sourdough Breads, Croissants, Cakes & Muffins",
  },
  {
    id: "A3",
    label: "A3",
    category: "Beverages & Cold Drinks",
    row: "A",
    col: 3,
    x: 460,
    y: 80,
    width: 140,
    height: 90,
    shelfCount: 4,
    description: "Juices, Sparkling Water, Energy Drinks & Sodas",
  },
  {
    id: "A4",
    label: "A4",
    category: "Organic & Health Foods",
    row: "A",
    col: 4,
    x: 650,
    y: 80,
    width: 140,
    height: 90,
    shelfCount: 4,
    description: "Gluten-Free, Protein Powders, Vegan Options",
  },

  // ROW B (Middle Row: y = 230)
  {
    id: "B1",
    label: "B1",
    category: "Canned & Preserved Goods",
    row: "B",
    col: 1,
    x: 80,
    y: 230,
    width: 140,
    height: 90,
    shelfCount: 4,
    description: "Soups, Beans, Tomatoes, Tuna & Pickles",
  },
  {
    id: "B2",
    label: "B2",
    category: "Instant Foods & Noodles",
    row: "B",
    col: 2,
    x: 270,
    y: 230,
    width: 140,
    height: 90,
    shelfCount: 4,
    description: "Maggi 2-Min Noodles, Ready Meals & Soups",
  },
  {
    id: "B3",
    label: "B3",
    category: "Snacks & Chocolates",
    row: "B",
    col: 3,
    x: 460,
    y: 230,
    width: 140,
    height: 90,
    shelfCount: 4,
    description: "Potato Chips, Lindt Chocolates, Biscuits & Nuts",
  },
  {
    id: "B4",
    label: "B4",
    category: "Breakfast Cereals & Oats",
    row: "B",
    col: 4,
    x: 650,
    y: 230,
    width: 140,
    height: 90,
    shelfCount: 4,
    description: "Quaker Oats, Cornflakes, Granola & Muesli",
  },

  // ROW C (Bottom Row: y = 380)
  {
    id: "C1",
    label: "C1",
    category: "Dairy & Milk Products",
    row: "C",
    col: 1,
    x: 80,
    y: 380,
    width: 140,
    height: 90,
    shelfCount: 4,
    description: "Amul Whole Milk, Greek Yogurt, Butter & Cheese",
  },
  {
    id: "C2",
    label: "C2",
    category: "Frozen Foods & Ice Cream",
    row: "C",
    col: 2,
    x: 270,
    y: 380,
    width: 140,
    height: 90,
    shelfCount: 4,
    description: "Frozen Veggies, Ice Cream Tubs, Peas & French Fries",
  },
  {
    id: "C3",
    label: "C3",
    category: "Pantry Oils & Spices",
    row: "C",
    col: 3,
    x: 460,
    y: 380,
    width: 140,
    height: 90,
    shelfCount: 4,
    description: "Borges Olive Oil, Flour, Sugar, Salt & Spices",
  },
  {
    id: "C4",
    label: "C4",
    category: "Household & Personal Care",
    row: "C",
    col: 4,
    x: 650,
    y: 380,
    width: 140,
    height: 90,
    shelfCount: 4,
    description: "Detergents, Soaps, Shampoos & Cleaning Supplies",
  },
];

/**
 * Structured Store Zones (Entrance & Checkout)
 */
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
