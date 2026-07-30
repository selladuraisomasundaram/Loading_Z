import { create } from "zustand";
import {
  CartItemType,
  DetectedProduct,
  LoadCellData,
  Product,
  TrolleyStatus,
} from "@/types";

interface CartStoreState {
  items: CartItemType[];
  detectedProducts: DetectedProduct[];
  loadCell: LoadCellData;
  trolleyStatus: TrolleyStatus;

  // Actions
  addItem: (product: Product, quantity?: number) => void;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  setDetectedProducts: (products: DetectedProduct[]) => void;
  updateLoadCell: (weightGrams: number) => void;
  setTrolleyStatus: (status: Partial<TrolleyStatus>) => void;
}

const initialMockProducts: CartItemType[] = [
  {
    product: {
      id: "prod-001",
      name: "Organic Whole Milk (1L)",
      price: 3.49,
      weightGrams: 1020,
      category: "Dairy",
    },
    quantity: 2,
    addedAt: new Date().toISOString(),
  },
  {
    product: {
      id: "prod-002",
      name: "Artisan Sourdough Bread",
      price: 4.99,
      weightGrams: 500,
      category: "Bakery",
    },
    quantity: 1,
    addedAt: new Date().toISOString(),
  },
];

export const useCartStore = create<CartStoreState>((set, get) => ({
  items: initialMockProducts,
  detectedProducts: [
    {
      id: "det-101",
      label: "Red Gala Apple",
      confidence: 0.94,
      estimatedWeightGrams: 180,
      detectedAt: new Date().toISOString(),
      status: "pending_verification",
    },
  ],
  loadCell: {
    currentWeightGrams: 2540,
    expectedWeightGrams: 2540,
    weightDeltaGrams: 0,
    isTareActive: false,
    isWeightMismatch: false,
    lastUpdated: new Date().toISOString(),
  },
  trolleyStatus: {
    trolleyId: "TROLLEY-SMART-042",
    batteryLevelPercent: 88,
    mqttConnection: "connected",
    cameraConnection: "connected",
    loadCellConnection: "connected",
    lastHeartbeat: new Date().toISOString(),
  },

  addItem: (product: Product, quantity = 1) => {
    const { items } = get();
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

    set((state) => ({
      items: updatedItems,
      loadCell: {
        ...state.loadCell,
        expectedWeightGrams: expectedWeight,
        weightDeltaGrams: state.loadCell.currentWeightGrams - expectedWeight,
        isWeightMismatch:
          Math.abs(state.loadCell.currentWeightGrams - expectedWeight) > 50,
      },
    }));
  },

  removeItem: (productId: string) => {
    const { items } = get();
    const updatedItems = items.filter((i) => i.product.id !== productId);
    const expectedWeight = updatedItems.reduce(
      (acc, curr) => acc + curr.product.weightGrams * curr.quantity,
      0
    );

    set((state) => ({
      items: updatedItems,
      loadCell: {
        ...state.loadCell,
        expectedWeightGrams: expectedWeight,
        weightDeltaGrams: state.loadCell.currentWeightGrams - expectedWeight,
        isWeightMismatch:
          Math.abs(state.loadCell.currentWeightGrams - expectedWeight) > 50,
      },
    }));
  },

  updateQuantity: (productId: string, quantity: number) => {
    if (quantity <= 0) {
      get().removeItem(productId);
      return;
    }

    const { items } = get();
    const updatedItems = items.map((item) =>
      item.product.id === productId ? { ...item, quantity } : item
    );

    const expectedWeight = updatedItems.reduce(
      (acc, curr) => acc + curr.product.weightGrams * curr.quantity,
      0
    );

    set((state) => ({
      items: updatedItems,
      loadCell: {
        ...state.loadCell,
        expectedWeightGrams: expectedWeight,
        weightDeltaGrams: state.loadCell.currentWeightGrams - expectedWeight,
        isWeightMismatch:
          Math.abs(state.loadCell.currentWeightGrams - expectedWeight) > 50,
      },
    }));
  },

  clearCart: () => {
    set((state) => ({
      items: [],
      loadCell: {
        ...state.loadCell,
        expectedWeightGrams: 0,
        currentWeightGrams: 0,
        weightDeltaGrams: 0,
        isWeightMismatch: false,
      },
    }));
  },

  setDetectedProducts: (products: DetectedProduct[]) => {
    set({ detectedProducts: products });
  },

  updateLoadCell: (weightGrams: number) => {
    set((state) => {
      const delta = weightGrams - state.loadCell.expectedWeightGrams;
      return {
        loadCell: {
          ...state.loadCell,
          currentWeightGrams: weightGrams,
          weightDeltaGrams: delta,
          isWeightMismatch: Math.abs(delta) > 50,
          lastUpdated: new Date().toISOString(),
        },
      };
    });
  },

  setTrolleyStatus: (status: Partial<TrolleyStatus>) => {
    set((state) => ({
      trolleyStatus: {
        ...state.trolleyStatus,
        ...status,
      },
    }));
  },
}));
