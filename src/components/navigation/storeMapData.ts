import { Product } from "@/types";

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

export const storeAisles: AisleData[] = [
  // ROW A (Top Row)
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
    category: "Biscuits & Cold Beverages",
    row: "A",
    col: 3,
    x: 460,
    y: 80,
    width: 140,
    height: 90,
    shelfCount: 4,
    description: "Parle-G, Oreo Biscuits, Juices, Sodas & Iced Tea",
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

  // ROW B (Middle Row)
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
    category: "Personal Care & Bathing",
    row: "B",
    col: 4,
    x: 650,
    y: 230,
    width: 140,
    height: 90,
    shelfCount: 4,
    description: "Shampoo, Soaps, Toothpaste & Skincare",
  },

  // ROW C (Bottom Row)
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
    category: "Household Cleaning",
    row: "C",
    col: 4,
    x: 650,
    y: 380,
    width: 140,
    height: 90,
    shelfCount: 4,
    description: "Detergents, Surface Cleaners & Trash Bags",
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

/**
 * PHASE 2: Comprehensive Product Catalog Dataset with Physical Map Coordinates
 * Maps Product -> Aisle -> Shelf -> SVG (x,y) Map Location
 */
export const catalogProducts: Product[] = [
  {
    id: "SKU-004",
    name: "Aashirvaad Whole Wheat Flour 5kg",
    price: 245.0,
    weightGrams: 5000,
    category: "Pantry",
    brand: "Aashirvaad",
    stock: 25,
    location: {
      aisleId: "C3",
      shelfId: "S1",
      shelfName: "Pantry Shelf S1",
      x: 470,
      y: 425,
    },
  },
  {
    id: "P001",
    name: "Parle-G Glucose Biscuits 250g",
    price: 20.0,
    weightGrams: 250,
    category: "Biscuits",
    brand: "Parle",
    stock: 45,
    location: {
      aisleId: "A3",
      shelfId: "S2",
      shelfName: "Middle Shelf S2",
      x: 510,
      y: 125,
    },
  },
  {
    id: "SKU-001",
    name: "Maggi 2-Min Instant Noodles 70g",
    price: 14.0,
    weightGrams: 70,
    category: "Instant Foods",
    brand: "Nestle",
    stock: 80,
    location: {
      aisleId: "B2",
      shelfId: "S2",
      shelfName: "Eye-Level Shelf S2",
      x: 320,
      y: 275,
    },
  },
  {
    id: "P003",
    name: "Amul Whole Milk 1L",
    price: 68.0,
    weightGrams: 1030,
    category: "Dairy",
    brand: "Amul",
    stock: 30,
    location: {
      aisleId: "C1",
      shelfId: "S1",
      shelfName: "Refrigerated Shelf S1",
      x: 130,
      y: 425,
    },
  },
  {
    id: "P004",
    name: "Amul Unsalted Butter 200g",
    price: 58.0,
    weightGrams: 200,
    category: "Dairy",
    brand: "Amul",
    stock: 25,
    location: {
      aisleId: "C1",
      shelfId: "S2",
      shelfName: "Refrigerated Shelf S2",
      x: 170,
      y: 425,
    },
  },
  {
    id: "P005",
    name: "L'Oreal Anti-Frizz Shampoo 340ml",
    price: 245.0,
    weightGrams: 360,
    category: "Personal Care",
    brand: "L'Oreal",
    stock: 18,
    location: {
      aisleId: "B4",
      shelfId: "S3",
      shelfName: "Upper Shelf S3",
      x: 690,
      y: 275,
    },
  },
  {
    id: "P006",
    name: "Dove Cream Beauty Bath Soap 125g",
    price: 55.0,
    weightGrams: 125,
    category: "Personal Care",
    brand: "Dove",
    stock: 60,
    location: {
      aisleId: "B4",
      shelfId: "S2",
      shelfName: "Middle Shelf S2",
      x: 725,
      y: 275,
    },
  },
  {
    id: "P007",
    name: "Heinz Tomato Ketchup 500g",
    price: 99.0,
    weightGrams: 500,
    category: "Condiments",
    brand: "Heinz",
    stock: 35,
    location: {
      aisleId: "C3",
      shelfId: "S2",
      shelfName: "Middle Shelf S2",
      x: 510,
      y: 425,
    },
  },
  {
    id: "P008",
    name: "Lindt Excellence Dark Chocolate 100g",
    price: 150.0,
    weightGrams: 105,
    category: "Snacks",
    brand: "Lindt",
    stock: 40,
    location: {
      aisleId: "B3",
      shelfId: "S1",
      shelfName: "Top Shelf S1",
      x: 510,
      y: 275,
    },
  },
  {
    id: "P009",
    name: "Multigrain Sourdough Bread 400g",
    price: 45.0,
    weightGrams: 400,
    category: "Bakery",
    brand: "Modern Bakery",
    stock: 15,
    location: {
      aisleId: "A2",
      shelfId: "S1",
      shelfName: "Fresh Bread Shelf S1",
      x: 320,
      y: 125,
    },
  },
  {
    id: "P010",
    name: "Fresh Organic Red Apples 1kg",
    price: 180.0,
    weightGrams: 1000,
    category: "Fresh Produce",
    brand: "Organic Fresh",
    stock: 50,
    location: {
      aisleId: "A1",
      shelfId: "S1",
      shelfName: "Display Rack S1",
      x: 130,
      y: 125,
    },
  },
];
