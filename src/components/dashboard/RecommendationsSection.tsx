"use client";

import React from "react";
import { Sparkles, Plus, Tag, Loader2, PackageX } from "lucide-react";
import { useCart } from "@/hooks/useCart";
import { formatCurrency } from "@/lib/utils";

export const RecommendationsSection: React.FC = () => {
  const {
    recommendations,
    isRecommendationsLoading,
    addRecommendationToCart,
  } = useCart();

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-4">
      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
        <div className="flex items-center space-x-2.5">
          <div className="p-2 bg-amber-50 text-amber-600 rounded-xl border border-amber-200">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-slate-900 text-base">
              Smart AI Recommendations
            </h3>
            <p className="text-xs text-slate-500">
              Personalized items suggested based on trolley items
            </p>
          </div>
        </div>

        <span className="bg-amber-100 text-amber-900 font-bold text-xs px-2.5 py-0.5 rounded-full border border-amber-300">
          AI Deals
        </span>
      </div>

      {isRecommendationsLoading ? (
        <div className="py-12 flex flex-col items-center justify-center space-y-2 text-slate-400">
          <Loader2 className="w-6 h-6 animate-spin text-sky-600" />
          <p className="text-xs font-semibold">Generating recommendations...</p>
        </div>
      ) : recommendations.length === 0 ? (
        <div className="py-8 flex flex-col items-center justify-center text-center space-y-2 bg-slate-50 rounded-xl border border-dashed border-slate-200">
          <PackageX className="w-8 h-8 text-slate-400" />
          <p className="text-xs text-slate-500 font-medium">
            No recommendations available right now.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {recommendations.map((item) => (
            <div
              key={item.id}
              className="p-3.5 bg-slate-50/70 border border-slate-200 rounded-xl hover:border-sky-300 hover:bg-white transition-all space-y-2.5"
            >
              <div>
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="font-bold text-slate-900 truncate">
                    {item.product.name}
                  </span>
                  {item.product.brand && (
                    <span className="text-[10px] bg-slate-200 text-slate-700 px-1.5 py-0.2 rounded shrink-0">
                      {item.product.brand}
                    </span>
                  )}
                </div>

                <div className="flex items-start gap-1.5 text-xs text-amber-800 bg-amber-50 p-2 rounded-lg border border-amber-200/60 mt-1">
                  <Tag className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
                  <span className="font-medium text-[11px] leading-tight">
                    {item.reason}
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-between pt-1 border-t border-slate-200/60">
                <span className="font-extrabold text-amber-600 text-sm font-mono">
                  {formatCurrency(item.product.price)}
                </span>

                <button
                  type="button"
                  onClick={() => addRecommendationToCart(item.id)}
                  className="px-3 py-1.5 bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs rounded-lg transition-colors flex items-center gap-1 shadow-2xs"
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
