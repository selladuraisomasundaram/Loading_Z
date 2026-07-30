"use client";

import React from "react";
import { Plus, Minus, Trash2, MapPin } from "lucide-react";
import { CartItemType } from "@/types";
import { useCart } from "@/hooks/useCart";
import { formatCurrency } from "@/lib/utils";

export interface CartItemProps {
  item: CartItemType;
  onLocateItem?: (item: CartItemType) => void;
}

export const CartItem: React.FC<CartItemProps> = ({ item, onLocateItem }) => {
  const { increaseQuantity, decreaseQuantity, removeItem, setActiveTab } =
    useCart();

  const handleLocate = () => {
    onLocateItem?.(item);
    setActiveTab("map");
  };

  return (
    <div className="p-4 bg-slate-50/80 hover:bg-white border border-slate-200 rounded-xl transition-all space-y-3 shadow-2xs">
      <div className="flex items-start justify-between gap-3">
        {/* Product Details */}
        <div className="min-w-0 flex-1">
          <span className="text-[10px] font-extrabold text-sky-700 bg-sky-50 px-2 py-0.5 rounded uppercase tracking-wider border border-sky-100">
            {item.product.category}
          </span>
          <h4 className="font-extrabold text-slate-900 text-sm mt-1 truncate">
            {item.product.name}
          </h4>
          {item.product.brand && (
            <p className="text-xs text-slate-500 font-medium">
              Brand: {item.product.brand}
            </p>
          )}
        </div>

        {/* Price Tag */}
        <div className="text-right shrink-0">
          <span className="text-base font-black text-amber-600 font-mono block">
            {formatCurrency(item.product.price * item.quantity)}
          </span>
          <span className="text-[11px] text-slate-400 font-mono">
            {formatCurrency(item.product.price)} each
          </span>
        </div>
      </div>

      {/* Action Controls Bar */}
      <div className="flex items-center justify-between pt-2 border-t border-slate-200/70">
        {/* Locate on Map Button */}
        <button
          type="button"
          onClick={handleLocate}
          className="px-2.5 py-1 bg-sky-50 hover:bg-sky-100 text-sky-700 font-bold text-[11px] rounded-lg transition-colors flex items-center gap-1 border border-sky-200"
          title="Locate product on Store Map"
        >
          <MapPin className="w-3.5 h-3.5 text-sky-600" />
          <span>Locate</span>
        </button>

        {/* Quantity Increment / Decrement & Remove Controls */}
        <div className="flex items-center space-x-2">
          <div className="flex items-center border border-slate-300 rounded-lg bg-white overflow-hidden shadow-2xs">
            <button
              type="button"
              onClick={() => decreaseQuantity(item.product.id)}
              disabled={item.quantity <= 1}
              className="p-1.5 text-slate-600 hover:bg-slate-100 disabled:opacity-30 disabled:hover:bg-white transition-colors"
              title="Decrease quantity"
            >
              <Minus className="w-3.5 h-3.5" />
            </button>
            <span className="px-3 font-mono font-bold text-xs text-slate-900">
              {item.quantity}
            </span>
            <button
              type="button"
              onClick={() => increaseQuantity(item.product.id)}
              className="p-1.5 text-slate-600 hover:bg-slate-100 transition-colors"
              title="Increase quantity"
            >
              <Plus className="w-3.5 h-3.5" />
            </button>
          </div>

          <button
            type="button"
            onClick={() => removeItem(item.product.id)}
            className="p-1.5 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-lg transition-colors"
            title="Remove from cart"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default CartItem;
