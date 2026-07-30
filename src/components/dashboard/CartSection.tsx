"use client";

import React from "react";
import { ShoppingBag, Plus, Minus, Trash2, PackageOpen } from "lucide-react";
import { useCart } from "@/hooks/useCart";
import { formatCurrency, formatWeight } from "@/lib/utils";

export const CartSection: React.FC = () => {
  const { items, totalItemCount, updateQuantity, removeItem, clearCart } =
    useCart();

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-4">
      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
        <div className="flex items-center space-x-2.5">
          <div className="p-2 bg-sky-50 text-sky-600 rounded-xl border border-sky-100">
            <ShoppingBag className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-slate-900 text-base">
              Active Trolley Cart
            </h3>
            <p className="text-xs text-slate-500">
              Live items currently inside the trolley
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <span className="bg-amber-100 text-amber-900 font-bold text-xs px-2.5 py-1 rounded-full border border-amber-300">
            {totalItemCount} {totalItemCount === 1 ? "Item" : "Items"}
          </span>

          {items.length > 0 && (
            <button
              type="button"
              onClick={clearCart}
              className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
              title="Clear all items"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {items.length === 0 ? (
        <div className="py-12 flex flex-col items-center justify-center text-center space-y-3 bg-slate-50/50 rounded-xl border border-dashed border-slate-200">
          <div className="p-4 bg-white rounded-full text-slate-400 shadow-2xs border border-slate-200">
            <PackageOpen className="w-8 h-8 text-sky-500" />
          </div>
          <div>
            <p className="text-slate-800 text-sm font-bold">
              Your trolley cart is empty
            </p>
            <p className="text-slate-400 text-xs mt-1">
              Add items via Gemma AI Vision scan or recommendations
            </p>
          </div>
        </div>
      ) : (
        <div className="space-y-2.5 max-h-[360px] overflow-y-auto pr-1">
          {items.map((item) => (
            <div
              key={item.product.id}
              className="flex items-center justify-between p-3.5 bg-slate-50/80 border border-slate-200 rounded-xl hover:border-sky-300 hover:bg-white transition-all gap-3"
            >
              <div className="min-w-0 flex-1">
                <div className="flex items-center space-x-2">
                  <h4 className="font-bold text-slate-900 text-sm truncate">
                    {item.product.name}
                  </h4>
                  {item.product.brand && (
                    <span className="bg-slate-200/80 text-slate-700 text-[10px] font-semibold px-1.5 py-0.5 rounded">
                      {item.product.brand}
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-500 mt-0.5 flex items-center gap-2">
                  <span>{formatCurrency(item.product.price)} each</span>
                  <span>•</span>
                  <span>{formatWeight(item.product.weightGrams)}</span>
                </p>
              </div>

              {/* Quantity Controls & Controls */}
              <div className="flex items-center space-x-3 shrink-0">
                <div className="flex items-center bg-white border border-slate-300 rounded-lg p-1 shadow-2xs">
                  <button
                    type="button"
                    onClick={() =>
                      updateQuantity(item.product.id, item.quantity - 1)
                    }
                    className="p-1 hover:bg-slate-100 rounded text-slate-600 transition-colors"
                  >
                    <Minus className="w-3.5 h-3.5" />
                  </button>
                  <span className="w-7 text-center font-bold text-slate-900 text-xs">
                    {item.quantity}
                  </span>
                  <button
                    type="button"
                    onClick={() =>
                      updateQuantity(item.product.id, item.quantity + 1)
                    }
                    className="p-1 hover:bg-slate-100 rounded text-slate-600 transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="text-right w-20">
                  <p className="font-extrabold text-amber-600 text-sm font-mono">
                    {formatCurrency(item.product.price * item.quantity)}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => removeItem(item.product.id)}
                  className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                  title="Remove item"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default CartSection;
