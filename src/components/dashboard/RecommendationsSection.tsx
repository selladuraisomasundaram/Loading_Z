"use client";

import React, { useEffect } from "react";
import { Sparkles, Plus, Tag, Loader2, PackageX, ShoppingBag } from "lucide-react";
import { useCart } from "@/hooks/useCart";
import { formatCurrency } from "@/lib/utils";

export const RecommendationsSection: React.FC = () => {
  const {
    recommendations,
    isRecommendationsLoading,
    addRecommendationToCart,
    fetchRecommendations,
  } = useCart();

  useEffect(() => {
    // Fetch cold start recommendations on mount if none exist
    if (recommendations.length === 0) {
      fetchRecommendations();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-4">
      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
        <div className="flex items-center space-x-2.5">
          <div className="p-2 bg-amber-50 text-amber-600 rounded-xl border border-amber-200">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-slate-900 text-base">
              Smart Recommendations
            </h3>
            <p className="text-xs text-slate-500">
              AI-generated item pairings for your trolley
            </p>
          </div>
        </div>

        <span className="bg-amber-100 text-amber-900 font-bold text-xs px-2.5 py-0.5 rounded-full border border-amber-300">
          Gemma AI
        </span>
      </div>

      {isRecommendationsLoading ? (
        <div className="py-12 flex flex-col items-center justify-center space-y-2 text-slate-400">
          <Loader2 className="w-6 h-6 animate-spin text-sky-600" />
          <p className="text-xs font-semibold text-slate-600">
            Fetching Gemma AI recommendations...
          </p>
        </div>
      ) : recommendations.length === 0 ? (
        <div className="py-8 flex flex-col items-center justify-center text-center space-y-2 bg-slate-50 rounded-xl border border-dashed border-slate-200">
          <PackageX className="w-8 h-8 text-slate-400" />
          <p className="text-xs text-slate-500 font-medium">
            No recommendations available right now.
          </p>
        </div>
      ) : (
        <div className="space-y-3 max-h-[340px] overflow-y-auto pr-1 custom-scrollbar">
          {recommendations.map((item) => (
            <div
              key={item.id}
              className="p-3.5 bg-slate-50/80 border border-slate-200 rounded-xl hover:border-sky-300 hover:bg-white transition-all space-y-3 shadow-2xs"
            >
              {/* Header Title / Tag */}
              <div className="flex items-center justify-between text-[11px] font-bold text-amber-800">
                <span className="flex items-center gap-1 uppercase tracking-wider">
                  <Sparkles className="w-3 h-3 text-amber-600" />
                  {item.title || "You may also like"}
                </span>
                {item.product.brand && (
                  <span className="text-[10px] bg-slate-200/80 text-slate-700 font-semibold px-1.5 py-0.5 rounded">
                    {item.product.brand}
                  </span>
                )}
              </div>

              {/* Product Info with Image Placeholder */}
              <div className="flex items-center space-x-3">
                {/* Product Image Placeholder / Thumbnail */}
                <div className="w-12 h-12 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-600 shrink-0">
                  {item.product.imageUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={item.product.imageUrl}
                      alt={item.product.name}
                      className="w-full h-full object-cover rounded-xl"
                    />
                  ) : (
                    <ShoppingBag className="w-6 h-6 text-amber-600" />
                  )}
                </div>

                <div className="min-w-0 flex-1">
                  <h4 className="font-extrabold text-slate-900 text-sm truncate">
                    {item.product.name}
                  </h4>
                  <div className="flex items-start gap-1 text-xs text-slate-600 mt-0.5">
                    <Tag className="w-3 h-3 text-amber-600 shrink-0 mt-0.5" />
                    <span className="text-[11px] italic font-medium leading-tight">
                      &quot;{item.reason}&quot;
                    </span>
                  </div>
                </div>
              </div>

              {/* Footer: Price & Add Button */}
              <div className="flex items-center justify-between pt-2 border-t border-slate-200/70">
                <span className="font-black text-amber-600 text-base font-mono">
                  {formatCurrency(item.product.price)}
                </span>

                <button
                  type="button"
                  onClick={() => addRecommendationToCart(item.id)}
                  className="px-3.5 py-1.5 bg-sky-600 hover:bg-sky-500 text-white font-extrabold text-xs rounded-lg transition-colors flex items-center gap-1 shadow-2xs"
                >
                  <Plus className="w-3.5 h-3.5" /> Add
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default RecommendationsSection;
