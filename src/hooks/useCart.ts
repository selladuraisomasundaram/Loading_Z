"use client";

import { useCartStore } from "@/store/cartStore";
import { GSTBillingSummaryData } from "@/types";

export function useCart() {
  const items = useCartStore((state) => state.items);
  const uploadedImage = useCartStore((state) => state.uploadedImage);
  const uploadedFileName = useCartStore((state) => state.uploadedFileName);
  const isAnalyzing = useCartStore((state) => state.isAnalyzing);
  const gemmaResult = useCartStore((state) => state.gemmaResult);
  const loadCell = useCartStore((state) => state.loadCell);
  const recommendations = useCartStore((state) => state.recommendations);
  const isRecommendationsLoading = useCartStore(
    (state) => state.isRecommendationsLoading
  );

  const uploadImage = useCartStore((state) => state.uploadImage);
  const removeImage = useCartStore((state) => state.removeImage);
  const analyzeImage = useCartStore((state) => state.analyzeImage);
  const addGemmaResultToCart = useCartStore(
    (state) => state.addGemmaResultToCart
  );

  const addItem = useCartStore((state) => state.addItem);
  const removeItem = useCartStore((state) => state.removeItem);
  const updateQuantity = useCartStore((state) => state.updateQuantity);
  const clearCart = useCartStore((state) => state.clearCart);
  const addRecommendationToCart = useCartStore(
    (state) => state.addRecommendationToCart
  );

  const totalItemCount = items.reduce((acc, curr) => acc + curr.quantity, 0);

  const subtotal = items.reduce(
    (acc, curr) => acc + curr.product.price * curr.quantity,
    0
  );

  // 5% discount if subtotal > ₹150
  const discount = subtotal > 150 ? 15.0 : 0;
  const taxableAmount = Math.max(0, subtotal - discount);
  const gstRatePercent = 18;
  const gstAmount = (taxableAmount * gstRatePercent) / 100;
  const finalPayableAmount = taxableAmount + gstAmount;

  const billingSummary: GSTBillingSummaryData = {
    itemCount: totalItemCount,
    subtotal,
    discount,
    gstRatePercent,
    gstAmount,
    finalPayableAmount,
    currency: "₹",
  };

  return {
    items,
    totalItemCount,
    uploadedImage,
    uploadedFileName,
    isAnalyzing,
    gemmaResult,
    loadCell,
    recommendations,
    isRecommendationsLoading,
    billingSummary,
    uploadImage,
    removeImage,
    analyzeImage,
    addGemmaResultToCart,
    addItem,
    removeItem,
    updateQuantity,
    clearCart,
    addRecommendationToCart,
  };
}
