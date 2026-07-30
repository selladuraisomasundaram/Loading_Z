"use client";

import { useCartStore } from "@/store/cartStore";

export function useCart() {
  const items = useCartStore((state) => state.items);
  const itemCount = useCartStore((state) => state.itemCount);
  const subtotal = useCartStore((state) => state.subtotal);
  const discount = useCartStore((state) => state.discount);
  const tax = useCartStore((state) => state.tax);
  const total = useCartStore((state) => state.total);

  const uploadedImage = useCartStore((state) => state.uploadedImage);
  const uploadedFileName = useCartStore((state) => state.uploadedFileName);
  const isAnalyzing = useCartStore((state) => state.isAnalyzing);
  const gemmaResult = useCartStore((state) => state.gemmaResult);
  const loadCell = useCartStore((state) => state.loadCell);
  const recommendations = useCartStore((state) => state.recommendations);
  const isRecommendationsLoading = useCartStore(
    (state) => state.isRecommendationsLoading
  );

  const addItem = useCartStore((state) => state.addItem);
  const removeItem = useCartStore((state) => state.removeItem);
  const increaseQuantity = useCartStore((state) => state.increaseQuantity);
  const decreaseQuantity = useCartStore((state) => state.decreaseQuantity);
  const clearCart = useCartStore((state) => state.clearCart);

  const uploadImage = useCartStore((state) => state.uploadImage);
  const removeImage = useCartStore((state) => state.removeImage);
  const analyzeImage = useCartStore((state) => state.analyzeImage);
  const addGemmaResultToCart = useCartStore(
    (state) => state.addGemmaResultToCart
  );
  const addRecommendationToCart = useCartStore(
    (state) => state.addRecommendationToCart
  );

  return {
    items,
    itemCount,
    subtotal,
    discount,
    tax,
    total,
    uploadedImage,
    uploadedFileName,
    isAnalyzing,
    gemmaResult,
    loadCell,
    recommendations,
    isRecommendationsLoading,
    addItem,
    removeItem,
    increaseQuantity,
    decreaseQuantity,
    clearCart,
    uploadImage,
    removeImage,
    analyzeImage,
    addGemmaResultToCart,
    addRecommendationToCart,
  };
}
