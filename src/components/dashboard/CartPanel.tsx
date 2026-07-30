"use client";

import React from "react";
import { ShoppingCart, Trash2, PackageOpen } from "lucide-react";
import { CartItem } from "@/components/ui/CartItem";
import { useCart } from "@/hooks/useCart";

export interface CartPanelProps {
  onClearCart?: () => void;
}

export const CartPanel: React.FC<CartPanelProps> = ({ onClearCart }) => {
  const { items, removeItem, updateQuantity, clearCart } = useCart();

  const handleClear = () => {
    if (onClearCart) {
      onClearCart();
    } else {
      clearCart();
    }
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4 shadow-sm">
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <div className="flex items-center space-x-2.5">
          <div className="p-2 bg-emerald-500/10 border border-emerald-500/20 rounded-lg text-emerald-400">
            <ShoppingCart className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-slate-100 text-base">Current Cart</h3>
            <p className="text-xs text-slate-400">
              Items added automatically or manually
            </p>
          </div>
        </div>

        {items.length > 0 && (
          <button
            type="button"
            onClick={handleClear}
            className="px-2.5 py-1 text-xs text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 border border-rose-500/20 rounded-lg transition-colors flex items-center gap-1.5"
          >
            <Trash2 className="w-3.5 h-3.5" />
            Clear All
          </button>
        )}
      </div>

      {items.length === 0 ? (
        <div className="py-12 flex flex-col items-center justify-center text-center space-y-3">
          <div className="p-4 bg-slate-800/50 rounded-full text-slate-500">
            <PackageOpen className="w-10 h-10" />
          </div>
          <div>
            <p className="text-slate-300 text-sm font-semibold">
              Your trolley cart is empty
            </p>
            <p className="text-slate-500 text-xs mt-1">
              Place items inside the physical trolley to auto-add them
            </p>
          </div>
        </div>
      ) : (
        <div className="space-y-3 max-h-[380px] overflow-y-auto pr-1">
          {items.map((item) => (
            <CartItem
              key={item.product.id}
              item={item}
              onIncrement={(id) => updateQuantity(id, item.quantity + 1)}
              onDecrement={(id) => updateQuantity(id, item.quantity - 1)}
              onRemove={(id) => removeItem(id)}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default CartPanel;
