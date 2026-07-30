"use client";

import React from "react";
import { Camera } from "lucide-react";
import ImageDropzone from "@/components/ui/ImageDropzone";
import { useCart } from "@/hooks/useCart";

export const ProductDetection: React.FC = () => {
  const { detectionStatus } = useCart();

  const getStatusBadge = () => {
    switch (detectionStatus) {
      case "uploading":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 bg-sky-100 text-sky-800 text-[11px] font-bold rounded-full border border-sky-300">
            <span className="w-1.5 h-1.5 rounded-full bg-sky-600 animate-ping" />
            Uploading Image...
          </span>
        );
      case "analyzing":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 bg-amber-100 text-amber-900 text-[11px] font-bold rounded-full border border-amber-300">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-600 animate-pulse" />
            Vision AI Analyzing...
          </span>
        );
      case "success":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 bg-emerald-100 text-emerald-800 text-[11px] font-bold rounded-full border border-emerald-300">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
            Detection Success
          </span>
        );
      case "error":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 bg-rose-100 text-rose-800 text-[11px] font-bold rounded-full border border-rose-300">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-600" />
            Detection Error
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 bg-slate-100 text-slate-700 text-[11px] font-bold rounded-full border border-slate-300">
            State: Idle
          </span>
        );
    }
  };

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-4">
      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
        <div className="flex items-center space-x-2.5">
          <div className="p-2 bg-sky-50 text-sky-600 rounded-xl border border-sky-100">
            <Camera className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-slate-900 text-base">
              Product Identification
            </h3>
            <p className="text-xs text-slate-500">
              State machine camera vision workflow
            </p>
          </div>
        </div>

        {getStatusBadge()}
      </div>

      <ImageDropzone />
    </div>
  );
};

export default ProductDetection;
