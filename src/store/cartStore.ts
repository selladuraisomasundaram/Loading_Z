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

  // Load Cell Animation state
  animationInterval: NodeJS.Timeout | null;

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
    lastUpdated: new Date().toLocaleTimeString(),
  },

  recommendations: [],
  isRecommendationsLoading: false,

  animationInterval: null,

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
      
      // Generate a consistent pseudo-random weight based on product name
      const generateWeight = (name: string) => {
        let hash = 0;
        for (let i = 0; i < name.length; i++) {
          hash = name.charCodeAt(i) + ((hash << 5) - hash);
        }
        return 150 + (Math.abs(hash) % 850); // 150g to 1000g
      };

      const result: GemmaDetectionResult = {
        product_id: p.product_id || (p as any).sku || "WEB-ITEM",
        product_name: p.product_name,
        brand: p.brand,
        category: p.category,
        sub_category: p.sub_category,
        price: p.price,
        confidence: p.confidence || (p as any).gemma_confidence || 0.9,
        verified: p.verified,
        estimatedWeightGrams: p.estimatedWeightGrams || (p as any).weightGrams || generateWeight(p.product_name),
        imageUrl: p.image_url || (p as any).imageUrl || undefined,
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
    const { items } = get();
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
    });

    get().updateLoadCellWeight(totals.expectedWeightGrams, false);

    get().fetchRecommendations();
  },

  removeItem: (productId: string) => {
    const { items } = get();
    const updatedItems = items.filter((i) => i.product.id !== productId);
    const totals = calculateCartTotals(updatedItems);

    set({
      items: updatedItems,
      itemCount: totals.itemCount,
      subtotal: totals.subtotal,
      discount: totals.discount,
      tax: totals.tax,
      total: totals.total,
    });

    get().updateLoadCellWeight(totals.expectedWeightGrams, false);
    get().fetchRecommendations();
  },

  increaseQuantity: (productId: string) => {
    const { items } = get();
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
    });

    get().updateLoadCellWeight(totals.expectedWeightGrams, false);
  },

  decreaseQuantity: (productId: string) => {
    const { items } = get();
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
    });

    get().updateLoadCellWeight(totals.expectedWeightGrams, false);
  },

  clearCart: () => {
    set(() => ({
      items: [],
      itemCount: 0,
      subtotal: 0,
      discount: 0,
      tax: 0,
      total: 0,
      recommendations: [],
    }));
    get().updateLoadCellWeight(0, false);
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
      const generateWeight = (name: string) => {
        let hash = 0;
        for (let i = 0; i < name.length; i++) {
          hash = name.charCodeAt(i) + ((hash << 5) - hash);
        }
        return 150 + (Math.abs(hash) % 850);
      };
      
      const product: Product = {
        id: target.product.id,
        name: target.product.name,
        brand: target.product.brand,
        category: target.product.category || "General",
        price: target.product.price,
        weightGrams: target.product.weightGrams || generateWeight(target.product.name),
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

  updateLoadCellWeight: (targetWeight: number, instant: boolean = false) => {
    const state = get();
    if (state.animationInterval) {
      clearInterval(state.animationInterval);
    }

    if (instant) {
      set({
        loadCell: {
          ...state.loadCell,
          currentWeightGrams: targetWeight,
          expectedWeightGrams: targetWeight,
          isStable: true,
          statusText: "Stable",
          lastUpdated: new Date().toLocaleTimeString(),
        },
        animationInterval: null,
      });
      return;
    }

    set({
      loadCell: {
        ...state.loadCell,
        expectedWeightGrams: targetWeight,
        isStable: false,
        statusText: "Measuring...",
      },
    });

    const duration = 1200;
    const startTime = Date.now();
    const startWeight = state.loadCell.currentWeightGrams;

    const interval = setInterval(() => {
      const now = Date.now();
      const progress = now - startTime;

      if (progress >= duration) {
        clearInterval(interval);
        set((s) => ({
          loadCell: {
            ...s.loadCell,
            currentWeightGrams: targetWeight,
            isStable: true,
            statusText: "Stable",
            lastUpdated: new Date().toLocaleTimeString(),
          },
          animationInterval: null,
        }));
      } else {
        const t = progress / duration;
        // Ease out quint
        const easeOut = 1 - Math.pow(1 - t, 5);
        const noise = (Math.random() - 0.5) * 40; // +/- 20g noise for realism
        const current = startWeight + (targetWeight - startWeight) * easeOut + noise;
        
        set((s) => ({
          loadCell: {
            ...s.loadCell,
            currentWeightGrams: Math.max(0, current), // prevent negative weight
          },
        }));
      }
    }, 50); // 20 FPS update

    set({ animationInterval: interval });
  },
}));
