import { create } from "zustand";
import {
  ActiveTab,
  CartItemType,
  DetectionStatus,
  GemmaDetectionResult,
  LoadCellTelemetryData,
  Product,
  Recommendation,
  CheckoutResponse,
} from "@/types";
import { identifyProduct, getRecommendations, checkout } from "@/lib/api";

const ALLOWED_MIME_TYPES = [
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
];

const ALLOWED_EXTENSIONS = [".jpg", ".jpeg", ".png", ".webp"];

export interface CartStoreState {
  // Navigation Tab State
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;

  // Cart State
  items: CartItemType[];
  itemCount: number;
  subtotal: number;
  discount: number;
  tax: number;
  total: number;

  // Vision Analysis & Product Detection State Machine
  detectionStatus: DetectionStatus;
  selectedFile: File | null;
  uploadedImage: string | null;
  uploadedFileName: string | null;
  uploadedFileSize: number | null;
  fileError: string | null;
  isAnalyzing: boolean;
  gemmaResult: GemmaDetectionResult | null;

  // Checkout API State
  checkoutStatus: "idle" | "processing" | "success" | "error";
  lastOrder: CheckoutResponse["order"] | null;

  // Hardware Load Cell Telemetry
  loadCell: LoadCellTelemetryData;

  // AI Recommendations State
  recommendations: Recommendation[];
  isRecommendationsLoading: boolean;

  // Actions
  selectFile: (file: File) => boolean;
  removeImage: () => void;
  analyzeSelectedFile: () => Promise<void>;
  addGemmaResultToCart: () => void;

  addItem: (product: Product) => void;
  removeItem: (productId: string) => void;
  increaseQuantity: (productId: string) => void;
  decreaseQuantity: (productId: string) => void;
  clearCart: () => void;

  fetchRecommendations: () => Promise<void>;
  addRecommendationToCart: (recId: string) => void;
  processCheckout: () => Promise<CheckoutResponse | null>;
  updateLoadCellWeight: (weightGrams: number, isStable?: boolean) => void;
}

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



export const useCartStore = create<CartStoreState>((set, get) => ({
  // Navigation State
  activeTab: "dashboard",
  setActiveTab: (tab: ActiveTab) => set({ activeTab: tab }),

  // Cart State
  items: [],
  itemCount: 0,
  subtotal: 0,
  discount: 0,
  tax: 0,
  total: 0,

  detectionStatus: "success",
  selectedFile: null,
  uploadedImage: null,
  uploadedFileName: null,
  uploadedFileSize: null,
  fileError: null,
  isAnalyzing: false,
  gemmaResult: null,

  checkoutStatus: "idle",
  lastOrder: null,

  loadCell: {
    currentWeightGrams: 0,
    expectedWeightGrams: 0,
    isStable: true,
    statusText: "Stable",
    lastUpdated: "Just now",
  },

  recommendations: [],
  isRecommendationsLoading: false,

  selectFile: (file: File) => {
    const ext = file.name.substring(file.name.lastIndexOf(".")).toLowerCase();
    const isValidType =
      ALLOWED_MIME_TYPES.includes(file.type.toLowerCase()) ||
      ALLOWED_EXTENSIONS.includes(ext);

    if (!isValidType) {
      set({
        detectionStatus: "error",
        fileError: `Unsupported file type "${file.name}". Please upload a JPG, JPEG, PNG, or WEBP image.`,
      });
      return false;
    }

    set({ detectionStatus: "uploading", fileError: null });

    const reader = new FileReader();
    reader.onload = (e) => {
      set({
        selectedFile: file,
        uploadedImage: e.target?.result as string,
        uploadedFileName: file.name,
        uploadedFileSize: file.size,
        fileError: null,
        detectionStatus: "idle",
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
      detectionStatus: "idle",
    });
  },

  analyzeSelectedFile: async () => {
    const { selectedFile, uploadedImage } = get();
    if (!selectedFile && !uploadedImage) {
      set({
        detectionStatus: "error",
        fileError: "Please upload an image before analyzing.",
      });
      return;
    }

    set({
      detectionStatus: "analyzing",
      isAnalyzing: true,
      fileError: null,
    });

    try {
      const targetFile =
        selectedFile ||
        new File(["dummy"], "maggi_noodles.jpg", { type: "image/jpeg" });

      const response = await identifyProduct(targetFile);

      if (!response.success || !response.product) {
        throw new Error(response.error || "Unable to identify product.");
      }

      const p = response.product;
      const result: GemmaDetectionResult = {
        product_id: p.product_id,
        product_name: p.product_name,
        brand: p.brand,
        category: p.category,
        sub_category: p.sub_category,
        price: p.price,
        confidence: p.confidence,
        verified: p.verified,
        estimatedWeightGrams: p.estimatedWeightGrams || 70,
        imageUrl: p.image_url || undefined,
        detectedAt: new Date().toLocaleTimeString(),
      };

      set({
        gemmaResult: result,
        isAnalyzing: false,
        detectionStatus: "success",
      });
    } catch (err: unknown) {
      const errorMessage =
        err instanceof Error ? err.message : "Unable to identify product.";
      set({
        fileError: errorMessage,
        isAnalyzing: false,
        detectionStatus: "error",
      });
    }
  },

  addGemmaResultToCart: () => {
    const { gemmaResult } = get();
    if (!gemmaResult) return;

    const product: Product = {
      id: gemmaResult.product_id,
      name: gemmaResult.product_name,
      brand: gemmaResult.brand,
      category: `${gemmaResult.category} / ${gemmaResult.sub_category}`,
      price: gemmaResult.price,
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

    get().fetchRecommendations();
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

    get().fetchRecommendations();
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

  fetchRecommendations: async () => {
    const { items } = get();
    set({ isRecommendationsLoading: true });
    try {
      const payload = items.map((i) => i.product.name);
      const response = await getRecommendations(payload);

      if (response.success && response.recommendations) {
        const mappedRecs: Recommendation[] = response.recommendations.map(
          (rec, idx) => ({
            id: `rec-resp-${rec.product_id}-${idx}`,
            title: "You may also like",
            product: {
              id: rec.product_id,
              name: rec.product_name,
              price: rec.price,
              imageUrl: rec.image_url || undefined,
            },
            reason: rec.reason,
          })
        );
        set({ recommendations: mappedRecs, isRecommendationsLoading: false });
      } else {
        set({ isRecommendationsLoading: false });
      }
    } catch {
      set({ isRecommendationsLoading: false });
    }
  },

  addRecommendationToCart: (recId: string) => {
    const { recommendations } = get();
    const target = recommendations.find((r) => r.id === recId);
    if (target) {
      const product: Product = {
        id: target.product.id,
        name: target.product.name,
        brand: target.product.brand,
        category: target.product.category || "General",
        price: target.product.price,
        weightGrams: target.product.weightGrams || 250,
      };
      get().addItem(product);
    }
  },

  processCheckout: async () => {
    const { items } = get();
    if (items.length === 0) return null;

    set({ checkoutStatus: "processing" });

    try {
      const payload = items.map((i) => ({
        product_id: i.product.id,
        quantity: i.quantity,
      }));

      const response = await checkout(payload);

      if (response.success && response.order) {
        set({
          checkoutStatus: "success",
          lastOrder: response.order,
        });
        get().clearCart();
        return response;
      } else {
        set({ checkoutStatus: "error" });
        throw new Error(response.error || "Checkout failed.");
      }
    } catch (err: unknown) {
      set({ checkoutStatus: "error" });
      throw err;
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
