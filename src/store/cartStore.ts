import { create } from "zustand";
import {
  CartItemType,
  GemmaDetectionResult,
  LoadCellTelemetryData,
  Product,
  RecommendationItem,
} from "@/types";

interface CartStoreState {
  // Cart
  items: CartItemType[];

  // Image Upload & Vision Analysis
  uploadedImage: string | null; // Data URL or Object URL
  uploadedFileName: string | null;
  isAnalyzing: boolean;
  gemmaResult: GemmaDetectionResult | null;

  // Load Cell Telemetry
  loadCell: LoadCellTelemetryData;

  // Recommendations
  recommendations: RecommendationItem[];
  isRecommendationsLoading: boolean;

  // Actions
  uploadImage: (file: File) => void;
  removeImage: () => void;
  analyzeImage: () => void;
  addGemmaResultToCart: () => void;

  addItem: (product: Product, quantity?: number) => void;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;

  addRecommendationToCart: (recId: string) => void;
  updateLoadCellWeight: (weightGrams: number, isStable?: boolean) => void;
}

const initialMockCart: CartItemType[] = [
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

export const useCartStore = create<CartStoreState>((set, get) => ({
  items: initialMockCart,

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
    currentWeightGrams: 2460,
    expectedWeightGrams: 2460,
    isStable: true,
    statusText: "Stable",
    lastUpdated: "Just now",
  },

  recommendations: initialRecommendations,
  isRecommendationsLoading: false,

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
    }, 1500);
  },

  addGemmaResultToCart: () => {
    const { gemmaResult } = get();
    if (!gemmaResult) return;

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

  addItem: (product: Product, quantity = 1) => {
    const { items, loadCell } = get();
    const existingIndex = items.findIndex((i) => i.product.id === product.id);

    let updatedItems: CartItemType[];
    if (existingIndex > -1) {
      updatedItems = items.map((item, idx) =>
        idx === existingIndex
          ? { ...item, quantity: item.quantity + quantity }
          : item
      );
    } else {
      updatedItems = [
        ...items,
        { product, quantity, addedAt: new Date().toISOString() },
      ];
    }

    const expectedWeight = updatedItems.reduce(
      (acc, curr) => acc + curr.product.weightGrams * curr.quantity,
      0
    );

    set({
      items: updatedItems,
      loadCell: {
        ...loadCell,
        currentWeightGrams: expectedWeight,
        expectedWeightGrams: expectedWeight,
        isStable: true,
        statusText: "Stable",
        lastUpdated: new Date().toLocaleTimeString(),
      },
    });
  },

  removeItem: (productId: string) => {
    const { items, loadCell } = get();
    const updatedItems = items.filter((i) => i.product.id !== productId);
    const expectedWeight = updatedItems.reduce(
      (acc, curr) => acc + curr.product.weightGrams * curr.quantity,
      0
    );

    set({
      items: updatedItems,
      loadCell: {
        ...loadCell,
        currentWeightGrams: expectedWeight,
        expectedWeightGrams: expectedWeight,
        isStable: true,
        statusText: "Stable",
        lastUpdated: new Date().toLocaleTimeString(),
      },
    });
  },

  updateQuantity: (productId: string, quantity: number) => {
    if (quantity <= 0) {
      get().removeItem(productId);
      return;
    }

    const { items, loadCell } = get();
    const updatedItems = items.map((item) =>
      item.product.id === productId ? { ...item, quantity } : item
    );

    const expectedWeight = updatedItems.reduce(
      (acc, curr) => acc + curr.product.weightGrams * curr.quantity,
      0
    );

    set({
      items: updatedItems,
      loadCell: {
        ...loadCell,
        currentWeightGrams: expectedWeight,
        expectedWeightGrams: expectedWeight,
        isStable: true,
        statusText: "Stable",
        lastUpdated: new Date().toLocaleTimeString(),
      },
    });
  },

  clearCart: () => {
    set((state) => ({
      items: [],
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
