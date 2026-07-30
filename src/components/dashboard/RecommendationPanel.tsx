"use client";

import React from "react";
import { Sparkles, Plus, Tag } from "lucide-react";
import { Recommendation } from "@/types";
import { useCart } from "@/hooks/useCart";
import { formatCurrency } from "@/lib/utils";

export interface RecommendationPanelProps {
  recommendations?: Recommendation[];
}

const mockRecommendations: Recommendation[] = [
  {
    id: "rec-001",
    title: "Frequently Bought Together",
    reason: "Pairs great with Organic Milk",
    suggestedProduct: {
      id: "prod-rec-1",
      name: "Organic Whole Grain Cereal",
      price: 4.29,
      weightGrams: 450,
      category: "Breakfast",
    },
    discountPercentage: 10,
  },
  {
    id: "rec-002",
    title: "Aisle 4 Special Deal",
    reason: "On sale near your location",
    suggestedProduct: {
      id: "prod-rec-2",
      name: "Salted Butter (250g)",
      price: 2.79,
      weightGrams: 250,
      category: "Dairy",
    },
  },
];

export const RecommendationPanel: React.FC<RecommendationPanelProps> = ({
  recommendations = mockRecommendations,
}) => {
  const { addItem } = useCart();

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4 shadow-sm">
      <div className="flex items-center space-x-2.5 border-b border-slate-800 pb-3">
        <div className="p-2 bg-amber-500/10 border border-amber-500/20 rounded-lg text-amber-400">
          <Sparkles className="w-5 h-5" />
        </div>
        <div>
          <h3 className="font-bold text-slate-100 text-base">
            Smart Recommendations
          </h3>
          <p className="text-xs text-slate-400">
            Suggested items based on your active trolley basket
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {recommendations.map((rec) => (
          <div
            key={rec.id}
            className="p-3.5 bg-slate-800/50 border border-slate-700/60 rounded-xl space-y-2.5 flex flex-col justify-between hover:border-slate-600 transition-colors"
          >
            <div>
              <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
                <span className="font-semibold text-amber-400 flex items-center gap-1">
                  <Tag className="w-3 h-3" />
                  {rec.title}
                </span>
                {rec.discountPercentage && (
                  <span className="bg-amber-500/10 text-amber-400 border border-amber-500/20 text-[10px] px-1.5 py-0.5 rounded">
                    {rec.discountPercentage}% OFF
                  </span>
                )}
              </div>
              <h4 className="font-bold text-slate-200 text-sm">
                {rec.suggestedProduct.name}
              </h4>
              <p className="text-xs text-slate-400 mt-0.5">{rec.reason}</p>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-slate-800">
              <span className="font-bold text-emerald-400 text-sm font-mono">
                {formatCurrency(rec.suggestedProduct.price)}
              </span>
              <button
                type="button"
                onClick={() => addItem(rec.suggestedProduct)}
                className="px-2.5 py-1 bg-slate-700 hover:bg-slate-600 text-slate-100 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5 text-emerald-400" /> Add
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RecommendationPanel;
