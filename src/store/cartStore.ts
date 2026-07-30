import { create } from "zustand";
import {
  CartItemType,
  GemmaDetectionResult,
  LoadCellTelemetryData,
  Product,
  RecommendationItem,
} from "@/types";
import { identifyProduct } from "@/lib/api";

const ALLOWED_MIME_TYPES = [
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
];

const ALLOWED_EXTENSIONS = [".jpg", ".jpeg", ".png", ".webp"];

export interface CartStoreState {
  // Cart State
  items: CartItemType[];
  itemCount: number;
  subtotal: number;
  discount: number;
  tax: number;
  total: number;

  // Image & Vision Analysis State
  selectedFile: File | null;
  uploadedImage: string | null;
  uploadedFileName: string | null;
  uploadedFileSize: number | null;
  fileError: string | null;
  isAnalyzing: boolean;
  gemmaResult: GemmaDetectionResult | null;

  // Hardware Load Cell Telemetry
  loadCell: LoadCellTelemetryData;

  // Recommendations
  recommendations: RecommendationItem[];
  isRecommendationsLoading: boolean;

  // Actions
  selectFile: (file: File) => boolean; // Returns true if valid file selected
  removeImage: () => void;
  analyzeSelectedFile: () => Promise<void>;
  addGemmaResultToCart: () => void;

  addItem: (product: Product) => void;
  removeItem: (productId: string) => void;
  increaseQuantity: (productId: string) => void;
  decreaseQuantity: (productId: string) => void;
  clearCart: () => void;

  addRecommendationToCart: (recId: string) => void;
  updateLoadCellWeight: (weightGrams: number, isStable?: boolean) => void;
}

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

function calculateCartTotals(items: CartItemType[]) {
  const itemCount = items.reduce((acc, curr) => acc + curr.quantity, 0);
  const subtotal = items.reduce(
    (acc, curr) => acc + curr.product.price * curr.quantity,
    0
  );
  const discount = subtotal > 150 ? 15.0 : 0;
  const taxableAmount = Math.max(0, subtotal - discount);
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
  items: initialMockCartItems,
  itemCount: initialTotals.itemCount,
  subtotal: initialTotals.subtotal,
  discount: initialTotals.discount,
  tax: initialTotals.tax,
  total: initialTotals.total,

  selectedFile: null,
  uploadedImage: null,
  uploadedFileName: null,
  uploadedFileSize: null,
  fileError: null,
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

  // Select file & validate format (accept JPG, JPEG, PNG, WEBP)
  selectFile: (file: File) => {
    const ext = file.name.substring(file.name.lastIndexOf(".")).toLowerCase();
    const isValidType =
      ALLOWED_MIME_TYPES.includes(file.type.toLowerCase()) ||
      ALLOWED_EXTENSIONS.includes(ext);

    if (!isValidType) {
      set({
        fileError: `Unsupported file type "${file.name}". Please upload a JPG, JPEG, PNG, or WEBP image.`,
      });
      return false;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      set({
        selectedFile: file,
        uploadedImage: e.target?.result as string,
        uploadedFileName: file.name,
        uploadedFileSize: file.size,
        fileError: null,
      });
    };
    reader.readAsDataURL(file);
    return true;
  },

  removeImage: () => {
    set({
      selectedFile: null,
      uploadedImage: null,
      uploadedFileName: null,
      uploadedFileSize: null,
      fileError: null,
      gemmaResult: null,
    });
  },

  // Calls identifyProduct(file) abstraction layer
  analyzeSelectedFile: async () => {
    const { selectedFile, uploadedImage } = get();
    if (!selectedFile && !uploadedImage) {
      set({ fileError: "Please upload an image before analyzing." });
      return;
    }

    set({ isAnalyzing: true, fileError: null });

    try {
      // Use selected file or create dummy file fallback if loaded from initial state
      const targetFile =
        selectedFile ||
        new File(["dummy"], "product.jpg", { type: "image/jpeg" });

      // Call API abstraction function
      const result = await identifyProduct(targetFile);

      set({
        gemmaResult: result,
        isAnalyzing: false,
      });
    } catch (err: unknown) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to analyze image.";
      set({
        fileError: errorMessage,
        isAnalyzing: false,
      });
    }
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

  addItem: (product: Product) => {
    const { items, loadCell } = get();
    const existingIndex = items.findIndex((i) => i.product.id === product.id);

    let updatedItems: CartItemType[];
    if (existingIndex > -1) {
      updatedItems = items.map((item, idx) =>
        idx === existingIndex
          ? { ...item, quantity: item.quantity + 1 }
          : item
      );
    } else {
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

  decreaseQuantity: (productId: string) => {
    const { items, loadCell } = get();
    const updatedItems = items.map((item) => {
      if (item.product.id === productId) {
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
