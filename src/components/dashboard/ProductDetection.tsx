"use client";

import React from "react";
import { Eye, CheckCircle2, Sparkles } from "lucide-react";
import { ImageDropzone } from "@/components/ui/ImageDropzone";
import { useCart } from "@/hooks/useCart";

export interface ProductDetectionProps {
  onConfirmDetection?: (id: string) => void;
}

export const ProductDetection: React.FC<ProductDetectionProps> = ({
  onConfirmDetection,
}) => {
  const { detectedProducts } = useCart();

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4 shadow-sm">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2.5">
          <div className="p-2 bg-emerald-500/10 border border-emerald-500/20 rounded-lg text-emerald-400">
            <Eye className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-slate-100 text-base">
              Product Detection Feed
            </h3>
            <p className="text-xs text-slate-400">
              Camera vision & AI object recognition status
            </p>
          </div>
        </div>

        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold rounded-full">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          Active Vision Stream
        </span>
      </div>

      <ImageDropzone className="my-3 min-h-[140px]" />

      <div className="space-y-2">
        <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center justify-between">
          <span>Detected Items Pending Action</span>
          <span className="text-emerald-400 font-mono">
            {detectedProducts.length} detected
          </span>
        </h4>

        {detectedProducts.length === 0 ? (
          <div className="p-4 text-center text-xs text-slate-500 border border-slate-800/80 rounded-xl bg-slate-950/40">
            No products currently in detection zone.
          </div>
        ) : (
          <div className="space-y-2">
            {detectedProducts.map((item) => (
              <div
                key={item.id}
                className="flex items-center justify-between p-3 bg-slate-800/60 border border-slate-700/60 rounded-xl text-sm"
              >
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-amber-500/10 border border-amber-500/20 text-amber-400 rounded-lg">
                    <Sparkles className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="font-medium text-slate-200">{item.label}</p>
                    <p className="text-xs text-slate-400">
                      Confidence: {(item.confidence * 100).toFixed(0)}% • Est:{" "}
                      {item.estimatedWeightGrams}g
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => onConfirmDetection?.(item.id)}
                  className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-medium rounded-lg transition-colors flex items-center gap-1.5"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Add to Cart
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductDetection;
