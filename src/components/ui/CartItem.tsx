"use client";

import React from "react";
import { Plus, Minus, Trash2, Package } from "lucide-react";
import { CartItemType } from "@/types";
import { formatCurrency, formatWeight } from "@/lib/utils";

export interface CartItemProps {
  item: CartItemType;
  onIncrement?: (productId: string) => void;
  onDecrement?: (productId: string) => void;
  onRemove?: (productId: string) => void;
}

export const CartItem: React.FC<CartItemProps> = ({
  item,
  onIncrement,
  onDecrement,
  onRemove,
}) => {
  const { product, quantity } = item;

  return (
    <div className="flex items-center justify-between p-4 bg-slate-800/80 border border-slate-700/80 rounded-xl hover:border-slate-600 transition-colors gap-4">
      <div className="flex items-center gap-3.5 min-w-0">
        <div className="w-12 h-12 rounded-lg bg-slate-700/60 border border-slate-600/50 flex items-center justify-center text-slate-400 shrink-0">
          <Package className="w-6 h-6 text-emerald-400" />
        </div>
        <div className="min-w-0">
          <h4 className="font-semibold text-slate-100 text-sm truncate">
            {product.name}
          </h4>
          <p className="text-xs text-slate-400 flex items-center gap-2 mt-0.5">
            <span>{formatCurrency(product.price)} / unit</span>
            <span>•</span>
            <span>{formatWeight(product.weightGrams)}</span>
          </p>
        </div>
      </div>

      <div className="flex items-center gap-4 shrink-0">
        {/* Quantity Controls */}
        <div className="flex items-center bg-slate-900 border border-slate-700 rounded-lg p-1">
          <button
            type="button"
            onClick={() => onDecrement?.(product.id)}
            className="p-1 hover:bg-slate-800 rounded text-slate-300 hover:text-white transition-colors"
            title="Decrease quantity"
          >
            <Minus className="w-3.5 h-3.5" />
          </button>
          <span className="w-8 text-center text-xs font-bold text-slate-100">
            {quantity}
          </span>
          <button
            type="button"
            onClick={() => onIncrement?.(product.id)}
            className="p-1 hover:bg-slate-800 rounded text-slate-300 hover:text-white transition-colors"
            title="Increase quantity"
          >
            <Plus className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Item Total */}
        <div className="text-right w-20">
          <p className="font-bold text-emerald-400 text-sm">
            {formatCurrency(product.price * quantity)}
          </p>
        </div>

        {/* Remove action */}
        <button
          type="button"
          onClick={() => onRemove?.(product.id)}
          className="p-2 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors"
          title="Remove item"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

export default CartItem;
