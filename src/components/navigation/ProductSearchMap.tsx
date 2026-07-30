"use client";

import React, { useState } from "react";
import { Search, Tag, PackageCheck, Sparkles, X } from "lucide-react";
import { catalogProducts } from "./storeMapData";
import { Product } from "@/types";
import { formatCurrency } from "@/lib/utils";

export interface ProductSearchMapProps {
  onSelectProduct: (product: Product) => void;
  selectedProduct?: Product | null;
  onClearSelection?: () => void;
}

export const ProductSearchMap: React.FC<ProductSearchMapProps> = ({
  onSelectProduct,
  selectedProduct,
  onClearSelection,
}) => {
  const [searchTerm, setSearchTerm] = useState("");

  const filteredProducts = catalogProducts.filter(
    (p) =>
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.brand?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.location?.aisleId.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-4">
      {/* Header & Clear Trigger */}
      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
        <div className="flex items-center space-x-2.5">
          <div className="p-2 bg-sky-50 text-sky-600 rounded-xl border border-sky-100">
            <Search className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-extrabold text-slate-900 text-sm">
              Supermarket Product Location Search
            </h3>
            <p className="text-xs text-slate-500">
              Find exact Aisle & Shelf map coordinates
            </p>
          </div>
        </div>

        {selectedProduct && (
          <button
            type="button"
            onClick={onClearSelection}
            className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-lg transition-colors flex items-center gap-1"
          >
            <X className="w-3.5 h-3.5" /> Clear Focus
          </button>
        )}
      </div>

      {/* Search Input Bar */}
      <div className="relative">
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search product (e.g. Parle-G, Maggi, Milk, Shampoo)..."
          className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-sky-500 focus:bg-white transition-all font-medium"
        />
        <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
      </div>

      {/* Active Selected Product Card */}
      {selectedProduct && selectedProduct.location && (
        <div className="p-3.5 bg-amber-50 border border-amber-300 rounded-xl flex items-center justify-between shadow-2xs">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-amber-500 text-white rounded-lg font-black text-sm">
              📍
            </div>
            <div>
              <span className="text-[10px] font-bold text-amber-900 uppercase tracking-widest block">
                Active Map Target
              </span>
              <h4 className="font-black text-slate-900 text-sm">
                {selectedProduct.name}
              </h4>
              <p className="text-xs text-amber-800 font-bold font-mono">
                Aisle: {selectedProduct.location.aisleId} • Shelf: {selectedProduct.location.shelfId} ({selectedProduct.location.shelfName || "Standard Shelf"})
              </p>
            </div>
          </div>

          <span className="font-mono font-black text-amber-600 text-sm">
            {formatCurrency(selectedProduct.price)}
          </span>
        </div>
      )}

      {/* Search Results / Quick Pick Grid */}
      <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
          Catalog Products ({filteredProducts.length})
        </span>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {filteredProducts.map((p) => {
            const isSelected = selectedProduct?.id === p.id;
            return (
              <div
                key={p.id}
                onClick={() => onSelectProduct(p)}
                className={`p-2.5 rounded-xl border transition-all cursor-pointer flex items-center justify-between text-xs ${
                  isSelected
                    ? "bg-amber-100/80 border-amber-400 font-bold shadow-2xs"
                    : "bg-slate-50/80 border-slate-200 hover:border-sky-300 hover:bg-white"
                }`}
              >
                <div className="min-w-0 pr-2">
                  <p className="font-bold text-slate-900 truncate">{p.name}</p>
                  <div className="flex items-center gap-1.5 text-[10px] text-slate-500 mt-0.5">
                    <Tag className="w-3 h-3 text-sky-600 shrink-0" />
                    <span>{formatCurrency(p.price)}</span>
                    <span>•</span>
                    <PackageCheck className="w-3 h-3 text-emerald-600 shrink-0" />
                    <span>Stock: {p.stock || 20}</span>
                  </div>
                </div>

                {p.location && (
                  <span className="bg-sky-100 text-sky-900 font-bold text-[10px] px-2 py-0.5 rounded-md border border-sky-300 shrink-0 font-mono flex items-center gap-1">
                    <Sparkles className="w-3 h-3 text-amber-500" />
                    {p.location.aisleId}/{p.location.shelfId}
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default ProductSearchMap;
