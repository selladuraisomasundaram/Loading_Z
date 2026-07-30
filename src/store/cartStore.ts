import { create } from "zustand";
import {
  CartItemType,
  GemmaDetectionResult,
  LoadCellTelemetryData,
  Product,
  RecommendationItem,
} from "@/types";

export interface CartStoreState {
  // Required Cart State
  items: CartItemType[];
  itemCount: number;
  subtotal: number;
  discount: number;
  tax: number;
  total: number;

  // Vision Analysis State
  uploadedImage: string | null;
  uploadedFileName: string | null;
  isAnalyzing: boolean;
  gemmaResult: GemmaDetectionResult | null;

  // Hardware Load Cell Telemetry
  loadCell: LoadCellTelemetryData;

  // Recommendations
  recommendations: RecommendationItem[];
  isRecommendationsLoading: boolean;

  // Required Cart Actions
  addItem: (product: Product) => void;
  removeItem: (productId: string) => void;
  increaseQuantity: (productId: string) => void;
  decreaseQuantity: (productId: string) => void;
  clearCart: () => void;

  // Helper Actions
  uploadImage: (file: File) => void;
  removeImage: () => void;
  analyzeImage: () => void;
  addGemmaResultToCart: () => void;
  addRecommendationToCart: (recId: string) => void;
  updateLoadCellWeight: (weightGrams: number, isStable?: boolean) => void;
}

// Initial Mock Catalog Products
const initialMockCartItems: CartItemType[] = [
  {
    product: {
      id: "prod-101",
      name: "Organic Whole Milk 1L",
      brand: "Amul Fresh",
      category: "Dairy & Eggs",
      price: 68.0,
      weightGrams: 1030,
    },
    quantity: 2,
    addedAt: new Date().toISOString(),
  },
  {
    product: {
      id: "prod-102",
      name: "Multigrain Sourdough Bread",
      brand: "Modern Bakery",
      category: "Bakery",
      price: 45.0,
      weightGrams: 400,
    },
    quantity: 1,
    addedAt: new Date().toISOString(),
  },
];

const initialRecommendations: RecommendationItem[] = [
  {
    id: "rec-01",
    product: {
      id: "prod-rec-01",
      name: "Unsalted Creamery Butter 200g",
      brand: "Amul",
      category: "Dairy",
      price: 58.0,
      weightGrams: 200,
    },
    reason: "Frequently bought together with Sourdough Bread",
  },
  {
    id: "rec-02",
    product: {
      id: "prod-rec-02",
      name: "Classic Roasted Oats 500g",
      brand: "Quaker",
      category: "Breakfast Cereal",
      price: 185.0,
      weightGrams: 500,
    },
    reason: "Popular healthy breakfast choice",
  },
  {
    id: "rec-03",
    product: {
      id: "prod-rec-03",
      name: "Organic Honey 250g",
      brand: "Dabur",
      category: "Pantry",
      price: 140.0,
      weightGrams: 250,
    },
    reason: "Pairs naturally with Oats & Milk",
  },
];

// Helper to deterministically compute totals
function calculateCartTotals(items: CartItemType[]) {
  const itemCount = items.reduce((acc, curr) => acc + curr.quantity, 0);
  const subtotal = items.reduce(
    (acc, curr) => acc + curr.product.price * curr.quantity,
    0
  );
  // Promotional discount rule
  const discount = subtotal > 150 ? 15.0 : 0;
  const taxableAmount = Math.max(0, subtotal - discount);
  // GST Tax at 18%
  const tax = Math.round(taxableAmount * 0.18 * 100) / 100;
  const total = Math.round((taxableAmount + tax) * 100) / 100;
  const expectedWeightGrams = items.reduce(
    (acc, curr) => acc + curr.product.weightGrams * curr.quantity,
    0
  );

  return {
    itemCount,
    subtotal,
    discount,
    tax,
    total,
    expectedWeightGrams,
  };
}

const initialTotals = calculateCartTotals(initialMockCartItems);

export const useCartStore = create<CartStoreState>((set, get) => ({
  // State
  items: initialMockCartItems,
  itemCount: initialTotals.itemCount,
  subtotal: initialTotals.subtotal,
  discount: initialTotals.discount,
  tax: initialTotals.tax,
  total: initialTotals.total,

  uploadedImage: null,
  uploadedFileName: null,
  isAnalyzing: false,
  gemmaResult: {
    productName: "Dark Chocolate Almond Bar 100g",
    brand: "Lindt Excellence",
    category: "Confectionery",
    confidence: 0.964,
    estimatedWeightGrams: 105,
    verificationStatus: "Verified",
    suggestedPrice: 150.0,
    detectedAt: new Date().toLocaleTimeString(),
  },

  loadCell: {
    currentWeightGrams: initialTotals.expectedWeightGrams,
    expectedWeightGrams: initialTotals.expectedWeightGrams,
    isStable: true,
    statusText: "Stable",
    lastUpdated: "Just now",
  },

  recommendations: initialRecommendations,
  isRecommendationsLoading: false,

  // Rule 1 & 2: addItem(product)
  addItem: (product: Product) => {
    const { items, loadCell } = get();
    const existingIndex = items.findIndex((i) => i.product.id === product.id);

    let updatedItems: CartItemType[];
    if (existingIndex > -1) {
      // Rule 1: Adding existing product increases quantity
      updatedItems = items.map((item, idx) =>
        idx === existingIndex
          ? { ...item, quantity: item.quantity + 1 }
          : item
      );
    } else {
      // Rule 2: Adding new product creates a cart item
      updatedItems = [
        ...items,
        { product, quantity: 1, addedAt: new Date().toISOString() },
      ];
    }

    const totals = calculateCartTotals(updatedItems);

    set({
      items: updatedItems,
      itemCount: totals.itemCount,
      subtotal: totals.subtotal,
      discount: totals.discount,
      tax: totals.tax,
      total: totals.total,
      loadCell: {
        ...loadCell,
        currentWeightGrams: totals.expectedWeightGrams,
        expectedWeightGrams: totals.expectedWeightGrams,
        isStable: true,
        statusText: "Stable",
        lastUpdated: new Date().toLocaleTimeString(),
      },
    });
  },

  // Rule 4: removeItem(productId) completely deletes product
  removeItem: (productId: string) => {
    const { items, loadCell } = get();
    const updatedItems = items.filter((i) => i.product.id !== productId);
    const totals = calculateCartTotals(updatedItems);

    set({
      items: updatedItems,
      itemCount: totals.itemCount,
      subtotal: totals.subtotal,
      discount: totals.discount,
      tax: totals.tax,
      total: totals.total,
      loadCell: {
        ...loadCell,
        currentWeightGrams: totals.expectedWeightGrams,
        expectedWeightGrams: totals.expectedWeightGrams,
        isStable: true,
        statusText: "Stable",
        lastUpdated: new Date().toLocaleTimeString(),
      },
    });
  },

  // increaseQuantity(productId)
  increaseQuantity: (productId: string) => {
    const { items, loadCell } = get();
    const updatedItems = items.map((item) =>
      item.product.id === productId
        ? { ...item, quantity: item.quantity + 1 }
        : item
    );
    const totals = calculateCartTotals(updatedItems);

    set({
      items: updatedItems,
      itemCount: totals.itemCount,
      subtotal: totals.subtotal,
      discount: totals.discount,
      tax: totals.tax,
      total: totals.total,
      loadCell: {
        ...loadCell,
        currentWeightGrams: totals.expectedWeightGrams,
        expectedWeightGrams: totals.expectedWeightGrams,
        isStable: true,
        statusText: "Stable",
        lastUpdated: new Date().toLocaleTimeString(),
      },
    });
  },

  // Rule 3: decreaseQuantity(productId) - quantity cannot become less than 1
  decreaseQuantity: (productId: string) => {
    const { items, loadCell } = get();
    const updatedItems = items.map((item) => {
      if (item.product.id === productId) {
        // Clamped at minimum 1
        const newQty = Math.max(1, item.quantity - 1);
        return { ...item, quantity: newQty };
      }
      return item;
    });

    const totals = calculateCartTotals(updatedItems);

    set({
      items: updatedItems,
      itemCount: totals.itemCount,
      subtotal: totals.subtotal,
      discount: totals.discount,
      tax: totals.tax,
      total: totals.total,
      loadCell: {
        ...loadCell,
        currentWeightGrams: totals.expectedWeightGrams,
        expectedWeightGrams: totals.expectedWeightGrams,
        isStable: true,
        statusText: "Stable",
        lastUpdated: new Date().toLocaleTimeString(),
      },
    });
  },

  // clearCart()
  clearCart: () => {
    set((state) => ({
      items: [],
      itemCount: 0,
      subtotal: 0,
      discount: 0,
      tax: 0,
      total: 0,
      loadCell: {
        ...state.loadCell,
        currentWeightGrams: 0,
        expectedWeightGrams: 0,
        isStable: true,
        statusText: "Stable",
        lastUpdated: new Date().toLocaleTimeString(),
      },
    }));
  },

  // Helper Actions
  uploadImage: (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      set({
        uploadedImage: e.target?.result as string,
        uploadedFileName: file.name,
      });
    };
    reader.readAsDataURL(file);
  },

  removeImage: () => {
    set({
      uploadedImage: null,
      uploadedFileName: null,
      gemmaResult: null,
    });
  },

  analyzeImage: () => {
    set({ isAnalyzing: true });
    setTimeout(() => {
      // Rule 6 & 7: Verified price comes from product database, not raw model output
      const mockResult: GemmaDetectionResult = {
        productName: "Almond Milk Unsweetened 1L",
        brand: "Silk Fresh",
        category: "Dairy Alternatives",
        confidence: 0.982,
        estimatedWeightGrams: 1020,
        verificationStatus: "Verified",
        suggestedPrice: 190.0,
        detectedAt: new Date().toLocaleTimeString(),
      };
      set({
        isAnalyzing: false,
        gemmaResult: mockResult,
      });
    }, 1200);
  },

  addGemmaResultToCart: () => {
    const { gemmaResult } = get();
    if (!gemmaResult) return;

    // Rule 6 & 7: Price comes from product catalog object
    const product: Product = {
      id: `prod-gemma-${Date.now()}`,
      name: gemmaResult.productName,
      brand: gemmaResult.brand,
      category: gemmaResult.category,
      price: gemmaResult.suggestedPrice,
      weightGrams: gemmaResult.estimatedWeightGrams,
    };

    get().addItem(product);
  },

  addRecommendationToCart: (recId: string) => {
    const { recommendations } = get();
    const target = recommendations.find((r) => r.id === recId);
    if (target) {
      get().addItem(target.product);
    }
  },

  updateLoadCellWeight: (weightGrams: number, isStable = true) => {
    set((state) => ({
      loadCell: {
        ...state.loadCell,
        currentWeightGrams: weightGrams,
        isStable,
        statusText: isStable ? "Stable" : "Measuring...",
        lastUpdated: new Date().toLocaleTimeString(),
      },
    }));
  },
}));
