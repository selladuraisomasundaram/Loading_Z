"use client";

import React from "react";
import { Plus, Minus, Trash2, Package } from "lucide-react";
import { CartItemType } from "@/types";
import { formatCurrency, formatWeight } from "@/lib/utils";

export interface CartItemProps {
  item: CartItemType;
  onIncrease?: (productId: string) => void;
  onDecrease?: (productId: string) => void;
  onRemove?: (productId: string) => void;
}

export const CartItem: React.FC<CartItemProps> = ({
  item,
  onIncrease,
  onDecrease,
  onRemove,
}) => {
  const { product, quantity } = item;

  return (
    <div className="flex items-center justify-between p-3.5 bg-slate-50/80 border border-slate-200 rounded-xl hover:border-sky-300 hover:bg-white transition-all gap-3">
      <div className="flex items-center space-x-3 min-w-0">
        <div className="w-10 h-10 rounded-lg bg-sky-50 border border-sky-100 flex items-center justify-center text-sky-600 shrink-0">
          <Package className="w-5 h-5" />
        </div>
        <div className="min-w-0">
          <div className="flex items-center space-x-2">
            <h4 className="font-bold text-slate-900 text-sm truncate">
              {product.name}
            </h4>
            {product.brand && (
              <span className="bg-slate-200/80 text-slate-700 text-[10px] font-semibold px-1.5 py-0.5 rounded">
                {product.brand}
              </span>
            )}
          </div>
          <p className="text-xs text-slate-500 mt-0.5 flex items-center gap-2">
            <span>{formatCurrency(product.price)} / unit</span>
            <span>•</span>
            <span>{formatWeight(product.weightGrams)}</span>
          </p>
        </div>
      </div>

      <div className="flex items-center space-x-3 shrink-0">
        {/* Quantity Increment/Decrement Controls */}
        <div className="flex items-center bg-white border border-slate-300 rounded-lg p-1 shadow-2xs">
          <button
            type="button"
            onClick={() => onDecrease?.(product.id)}
            disabled={quantity <= 1}
            className="p-1 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed rounded text-slate-600 transition-colors"
            title={quantity <= 1 ? "Minimum quantity reached (Use trash icon to remove)" : "Decrease quantity"}
          >
            <Minus className="w-3.5 h-3.5" />
          </button>
          <span className="w-7 text-center font-bold text-slate-900 text-xs">
            {quantity}
          </span>
          <button
            type="button"
            onClick={() => onIncrease?.(product.id)}
            className="p-1 hover:bg-slate-100 rounded text-slate-600 transition-colors"
            title="Increase quantity"
          >
            <Plus className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Item Subtotal Price */}
        <div className="text-right w-20">
          <p className="font-extrabold text-amber-600 text-sm font-mono">
            {formatCurrency(product.price * quantity)}
          </p>
        </div>

        {/* Remove Button Completely Deletes Product */}
        <button
          type="button"
          onClick={() => onRemove?.(product.id)}
          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
          title="Remove product completely"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

export default CartItem;
