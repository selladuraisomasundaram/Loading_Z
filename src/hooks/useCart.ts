"use client";

import { useCartStore } from "@/store/cartStore";
import { BillingSummaryData } from "@/types";

export function useCart() {
  const items = useCartStore((state) => state.items);
  const detectedProducts = useCartStore((state) => state.detectedProducts);
  const loadCell = useCartStore((state) => state.loadCell);
  const trolleyStatus = useCartStore((state) => state.trolleyStatus);

  const addItem = useCartStore((state) => state.addItem);
  const removeItem = useCartStore((state) => state.removeItem);
  const updateQuantity = useCartStore((state) => state.updateQuantity);
  const clearCart = useCartStore((state) => state.clearCart);

  const subtotal = items.reduce(
    (acc, curr) => acc + curr.product.price * curr.quantity,
    0
  );
  const tax = subtotal * 0.08; // 8% estimated sales tax
  const discount = subtotal > 15 ? 2.0 : 0; // mock promo discount
  const total = Math.max(0, subtotal + tax - discount);
  const totalItemCount = items.reduce((acc, curr) => acc + curr.quantity, 0);

  const billingSummary: BillingSummaryData = {
    subtotal,
    tax,
    discount,
    total,
    currency: "USD",
    itemCount: totalItemCount,
  };

  return {
    items,
    detectedProducts,
    loadCell,
    trolleyStatus,
    billingSummary,
    totalItemCount,
    addItem,
    removeItem,
    updateQuantity,
    clearCart,
  };
}
