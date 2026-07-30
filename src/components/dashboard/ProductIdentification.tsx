"use client";

import React from "react";
import { Camera } from "lucide-react";
import ImageDropzone from "@/components/ui/ImageDropzone";

export const ProductIdentification: React.FC = () => {
  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-4">
      <div className="flex items-center space-x-2.5 border-b border-slate-100 pb-3">
        <div className="p-2 bg-sky-50 text-sky-600 rounded-xl border border-sky-100">
          <Camera className="w-5 h-5" />
        </div>
        <div>
          <h3 className="font-bold text-slate-900 text-base">
            Product Identification
          </h3>
          <p className="text-xs text-slate-500">
            Upload or capture item frame for vision AI recognition
          </p>
        </div>
      </div>

      <ImageDropzone />
    </div>
  );
};

export default ProductIdentification;
