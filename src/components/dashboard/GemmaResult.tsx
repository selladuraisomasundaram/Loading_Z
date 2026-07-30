"use client";

import React from "react";
import { Sparkles, CheckCircle2, ShoppingCart, Tag, Award } from "lucide-react";
import { useCart } from "@/hooks/useCart";
import { formatCurrency } from "@/lib/utils";

export const GemmaResult: React.FC = () => {
  const { gemmaResult, addGemmaResultToCart, isAnalyzing } = useCart();

  if (isAnalyzing) {
    return (
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs text-center space-y-3">
        <div className="p-3 bg-amber-50 rounded-full w-12 h-12 mx-auto flex items-center justify-center text-amber-600 animate-pulse">
          <Sparkles className="w-6 h-6" />
        </div>
        <p className="text-sm font-bold text-slate-800">
          Running Gemma AI Object Inference...
        </p>
        <p className="text-xs text-slate-400">
          Scanning visual features & matching item taxonomy
        </p>
      </div>
    );
  }

  if (!gemmaResult) {
    return (
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs text-center space-y-2">
        <p className="text-slate-400 text-xs font-medium">
          No Gemma AI result detected yet.
        </p>
        <p className="text-slate-500 text-xs">
          Upload an image above and click &quot;Analyze with Gemma&quot;.
        </p>
      </div>
    );
  }

  const confidencePercent = (gemmaResult.confidence * 100).toFixed(1);

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-4">
      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
        <div className="flex items-center space-x-2.5">
          <div className="p-2 bg-amber-50 text-amber-600 rounded-xl border border-amber-200">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-slate-900 text-base">
              Gemma Identification Result
            </h3>
            <p className="text-xs text-slate-500">
              AI Vision confidence analysis & item details
            </p>
          </div>
        </div>

        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-amber-100 border border-amber-300 text-amber-900 text-xs font-bold rounded-full">
          {confidencePercent}% Match
        </span>
      </div>

      <div className="space-y-3">
        <div>
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
            Detected Product
          </span>
          <h4 className="text-lg font-extrabold text-slate-900 leading-tight">
            {gemmaResult.productName}
          </h4>
        </div>

        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className="bg-slate-50 border border-slate-200 p-2.5 rounded-xl">
            <span className="text-slate-400 font-semibold block text-[10px] uppercase">
              Brand
            </span>
            <span className="font-bold text-slate-800 flex items-center gap-1 mt-0.5">
              <Award className="w-3.5 h-3.5 text-sky-600" />
              {gemmaResult.brand}
            </span>
          </div>

          <div className="bg-slate-50 border border-slate-200 p-2.5 rounded-xl">
            <span className="text-slate-400 font-semibold block text-[10px] uppercase">
              Category
            </span>
            <span className="font-bold text-slate-800 flex items-center gap-1 mt-0.5">
              <Tag className="w-3.5 h-3.5 text-amber-600" />
              {gemmaResult.category}
            </span>
          </div>
        </div>

        <div className="flex items-center justify-between bg-emerald-50 border border-emerald-200 px-3 py-2 rounded-xl text-xs">
          <div className="flex items-center space-x-2 text-emerald-800 font-semibold">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>Verification Status:</span>
          </div>
          <span className="bg-emerald-600 text-white font-bold px-2 py-0.5 rounded text-[11px]">
            {gemmaResult.verificationStatus}
          </span>
        </div>

        <div className="flex items-center justify-between pt-1">
          <div>
            <span className="text-xs text-slate-400">Unit Price:</span>
            <p className="text-xl font-black text-amber-600 font-mono">
              {formatCurrency(gemmaResult.suggestedPrice)}
            </p>
          </div>

          <button
            type="button"
            onClick={addGemmaResultToCart}
            className="px-4 py-2.5 bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center gap-2"
          >
            <ShoppingCart className="w-4 h-4" />
            Add to Cart
          </button>
        </div>
      </div>
    </div>
  );
};

export default GemmaResult;
