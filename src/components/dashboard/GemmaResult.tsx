"use client";

import React from "react";
import {
  Sparkles,
  ShieldCheck,
  ShoppingCart,
  Tag,
  Award,
  Layers,
  CheckCircle2,
  AlertTriangle,
  Loader2,
  Cpu,
} from "lucide-react";
import { useCart } from "@/hooks/useCart";
import { formatCurrency } from "@/lib/utils";

export const GemmaResult: React.FC = () => {
  const {
    gemmaResult,
    detectionStatus,
    uploadedImage,
    addGemmaResultToCart,
    addItem,
    fileError,
  } = useCart();

  // State Machine: Analyzing
  if (detectionStatus === "analyzing") {
    return (
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs text-center space-y-3">
        <div className="p-3 bg-amber-50 rounded-full w-12 h-12 mx-auto flex items-center justify-center text-amber-600 animate-pulse border border-amber-200">
          <Loader2 className="w-6 h-6 animate-spin text-sky-600" />
        </div>
        <div>
          <h4 className="text-sm font-extrabold text-slate-900">
            Running Gemma AI Vision Inference...
          </h4>
          <p className="text-xs text-slate-500 mt-1">
            Analyzing visual features & checking catalog database
          </p>
        </div>
      </div>
    );
  }

  // State Machine: Error
  if (detectionStatus === "error" && fileError) {
    return (
      <div className="bg-white border border-rose-200 rounded-2xl p-5 shadow-xs space-y-2">
        <div className="flex items-center space-x-2 text-rose-700 font-bold text-sm">
          <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
          <span>Product Detection Error</span>
        </div>
        <p className="text-xs text-slate-600">{fileError}</p>
      </div>
    );
  }

  // State Machine: Idle / Uploading (No result yet)
  if (!gemmaResult || detectionStatus === "idle" || detectionStatus === "uploading") {
    return (
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs text-center space-y-2">
        <p className="text-slate-400 text-xs font-bold uppercase tracking-wider">
          Awaiting Detection Analysis
        </p>
        <p className="text-slate-500 text-xs">
          Select or drag an image above and click &quot;Analyze Product Image&quot;.
        </p>
      </div>
    );
  }

  // State Machine: Success
  const confidencePercent = (gemmaResult.confidence * 100).toFixed(0);

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
        <div className="flex items-center space-x-2.5">
          <div className="p-2 bg-amber-50 text-amber-600 rounded-xl border border-amber-200">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-slate-900 text-base">
              Detection & Verification Result
            </h3>
            <p className="text-xs text-slate-500">
              SKU: <span className="font-mono font-bold text-slate-700">{gemmaResult.product_id}</span>
            </p>
          </div>
        </div>
      </div>

      {/* DISTINCT VISUAL BADGES: Gemma Identified vs Catalog Verified */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        {/* Badge 1: Gemma AI Identified (Confidence directly from AI) */}
        <div className="p-2.5 bg-purple-50/80 border border-purple-200 rounded-xl flex items-center space-x-2">
          <div className="p-1.5 bg-purple-100 text-purple-700 rounded-lg shrink-0">
            <Cpu className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <span className="text-[10px] font-bold text-purple-700 uppercase tracking-wider block">
              Gemma Identified
            </span>
            <span className="text-xs font-black text-purple-900 font-mono">
              {confidencePercent}% Model Confidence
            </span>
          </div>
        </div>

        {/* Badge 2: Catalog Verified (Database Verification Status) */}
        <div className="p-2.5 bg-emerald-50/80 border border-emerald-200 rounded-xl flex items-center space-x-2">
          <div className="p-1.5 bg-emerald-100 text-emerald-700 rounded-lg shrink-0">
            <ShieldCheck className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <span className="text-[10px] font-bold text-emerald-700 uppercase tracking-wider block">
              Catalog Verified
            </span>
            <span className="text-xs font-black text-emerald-900 flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              {gemmaResult.verified ? "Verified DB SKU" : "Unverified SKU"}
            </span>
          </div>
        </div>
      </div>

      {/* Main Product Card */}
      <div className="space-y-3 pt-1">
        {/* Product Image Thumbnail */}
        {uploadedImage && (
          <div className="w-full h-32 rounded-xl border border-slate-200 overflow-hidden bg-slate-100">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={uploadedImage}
              alt={gemmaResult.product_name}
              className="w-full h-full object-cover"
            />
          </div>
        )}

        <div>
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
            Product Name
          </span>
          <h4 className="text-lg font-black text-slate-900 leading-tight">
            {gemmaResult.product_name}
          </h4>
        </div>

        {/* Grid: Brand, Category, Subcategory */}
        <div className="grid grid-cols-3 gap-2 text-xs">
          <div className="bg-slate-50 border border-slate-200 p-2 rounded-xl">
            <span className="text-slate-400 font-semibold block text-[10px] uppercase">
              Brand
            </span>
            <span className="font-bold text-slate-800 flex items-center gap-1 mt-0.5 truncate">
              <Award className="w-3.5 h-3.5 text-sky-600 shrink-0" />
              {gemmaResult.brand}
            </span>
          </div>

          <div className="bg-slate-50 border border-slate-200 p-2 rounded-xl">
            <span className="text-slate-400 font-semibold block text-[10px] uppercase">
              Category
            </span>
            <span className="font-bold text-slate-800 flex items-center gap-1 mt-0.5 truncate">
              <Tag className="w-3.5 h-3.5 text-amber-600 shrink-0" />
              {gemmaResult.category}
            </span>
          </div>

          <div className="bg-slate-50 border border-slate-200 p-2 rounded-xl">
            <span className="text-slate-400 font-semibold block text-[10px] uppercase">
              Subcategory
            </span>
            <span className="font-bold text-slate-800 flex items-center gap-1 mt-0.5 truncate">
              <Layers className="w-3.5 h-3.5 text-purple-600 shrink-0" />
              {gemmaResult.sub_category}
            </span>
          </div>
        </div>

        {/* Price & Add to Cart */}
        <div className="flex items-center justify-between pt-2 border-t border-slate-100">
          <div>
            <span className="text-[11px] text-slate-400 font-medium block">
              Verified Price:
            </span>
            <p className="text-xl font-black text-amber-600 font-mono">
              {formatCurrency(gemmaResult.price)}
            </p>
          </div>

          <button
            type="button"
            onClick={addGemmaResultToCart}
            className="px-4 py-2.5 bg-sky-600 hover:bg-sky-500 text-white font-extrabold text-xs rounded-xl shadow-xs transition-colors flex items-center gap-2"
          >
            <ShoppingCart className="w-4 h-4" />
            <span>Add to Cart</span>
          </button>
        </div>
      </div>

{/* Recommendations Carousel */}
{gemmaResult.recommendations && gemmaResult.recommendations.length > 0 && (
  <div className="mt-4">
    <h4 className="text-sm font-semibold text-slate-800 mb-2">Recommended Products</h4>
    <div className="flex overflow-x-auto gap-3 pb-2">
      {gemmaResult.recommendations.map((rec: { product_id?: string; product_name: string; price: number; image_url?: string }, idx: number) => (
        <div
          key={rec.product_id ?? idx}
          className="min-w-[150px] bg-white border border-slate-200 rounded-xl p-3 shadow-sm"
        >
          {rec.image_url && (
            <img src={rec.image_url} alt={rec.product_name} className="w-full h-20 object-cover rounded" />
          )}
          <h5 className="mt-2 text-xs font-bold text-slate-900 truncate">{rec.product_name}</h5>
          <p className="text-xs text-amber-600">{formatCurrency(rec.price)}</p>
          <button
            onClick={() => {
              addItem({
                id: rec.product_id || `rec-${idx}`,
                name: rec.product_name,
                price: rec.price,
                weightGrams: 100,
                category: "Recommended",
              });
            }}
            className="mt-1 w-full text-xs bg-sky-600 hover:bg-sky-500 text-white py-1 rounded font-bold"
          >
            Add to Cart
          </button>
        </div>
      ))}
    </div>
  </div>
)}
    </div>
  );
};

export default GemmaResult;
