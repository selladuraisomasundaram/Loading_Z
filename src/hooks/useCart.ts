"use client";

import { useCartStore } from "@/store/cartStore";

export function useCart() {
  const activeTab = useCartStore((state) => state.activeTab);
  const setActiveTab = useCartStore((state) => state.setActiveTab);

  const items = useCartStore((state) => state.items);
  const itemCount = useCartStore((state) => state.itemCount);
  const subtotal = useCartStore((state) => state.subtotal);
  const discount = useCartStore((state) => state.discount);
  const tax = useCartStore((state) => state.tax);
  const total = useCartStore((state) => state.total);

  const detectionStatus = useCartStore((state) => state.detectionStatus);
  const selectedFile = useCartStore((state) => state.selectedFile);
  const uploadedImage = useCartStore((state) => state.uploadedImage);
  const uploadedFileName = useCartStore((state) => state.uploadedFileName);
  const uploadedFileSize = useCartStore((state) => state.uploadedFileSize);
  const fileError = useCartStore((state) => state.fileError);
  const isAnalyzing = useCartStore((state) => state.isAnalyzing);
  const gemmaResult = useCartStore((state) => state.gemmaResult);

  const checkoutStatus = useCartStore((state) => state.checkoutStatus);
  const lastOrder = useCartStore((state) => state.lastOrder);

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
  const assistantTargetProduct = useCartStore((state) => state.assistantTargetProduct);
  const setAssistantTargetProduct = useCartStore((state) => state.setAssistantTargetProduct);

  const selectFile = useCartStore((state) => state.selectFile);
  const removeImage = useCartStore((state) => state.removeImage);
  const analyzeSelectedFile = useCartStore(
    (state) => state.analyzeSelectedFile
  );
  const addGemmaResultToCart = useCartStore(
    (state) => state.addGemmaResultToCart
  );
  const addRecommendationToCart = useCartStore(
    (state) => state.addRecommendationToCart
  );
  const fetchRecommendations = useCartStore(
    (state) => state.fetchRecommendations
  );
  const processCheckout = useCartStore((state) => state.processCheckout);

  return {
    activeTab,
    setActiveTab,
    items,
    itemCount,
    subtotal,
    discount,
    tax,
    total,
    detectionStatus,
    selectedFile,
    uploadedImage,
    uploadedFileName,
    uploadedFileSize,
    fileError,
    isAnalyzing,
    gemmaResult,
    checkoutStatus,
    lastOrder,
    loadCell,
    recommendations,
    isRecommendationsLoading,
    addItem,
    removeItem,
    increaseQuantity,
    decreaseQuantity,
    clearCart,
    assistantTargetProduct,
    setAssistantTargetProduct,
    selectFile,
    removeImage,
    analyzeSelectedFile,
    addGemmaResultToCart,
    addRecommendationToCart,
    fetchRecommendations,
    processCheckout,
  };
}
