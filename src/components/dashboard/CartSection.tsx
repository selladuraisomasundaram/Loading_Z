"use client";

import React from "react";
import { ShoppingBag, Trash2 } from "lucide-react";
import CartItem from "@/components/ui/CartItem";
import { useCart } from "@/hooks/useCart";

export const CartSection: React.FC = () => {
  const { items, itemCount, clearCart } = useCart();

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
        <div className="flex items-center space-x-2.5">
          <div className="p-2 bg-sky-50 text-sky-600 rounded-xl border border-sky-100">
            <ShoppingBag className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-slate-900 text-base">Active Cart</h3>
            <p className="text-xs text-slate-500">
              {itemCount} {itemCount === 1 ? "item" : "items"} in trolley
            </p>
          </div>
        </div>

        {items.length > 0 && (
          <button
            type="button"
            onClick={clearCart}
            className="text-xs text-rose-600 hover:text-rose-700 font-semibold hover:underline flex items-center gap-1"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Clear Cart</span>
          </button>
        )}
      </div>

      {/* Cart Items List */}
      {items.length === 0 ? (
        <div className="py-12 text-center space-y-2 bg-slate-50 rounded-xl border border-dashed border-slate-200">
          <ShoppingBag className="w-8 h-8 text-slate-300 mx-auto" />
          <p className="text-xs text-slate-500 font-medium">
            Your trolley is empty.
          </p>
          <p className="text-[11px] text-slate-400">
            Scan an item or select a product to add to cart.
          </p>
        </div>
      ) : (
        <div className="space-y-3 max-h-[380px] overflow-y-auto pr-1">
          {items.map((item) => (
            <CartItem key={item.product.id} item={item} />
          ))}
        </div>
      )}
    </div>
  );
};

export default CartSection;
