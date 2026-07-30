"use client";

import React, { useRef, useState } from "react";
import { UploadCloud, Image as ImageIcon, Trash2, Sparkles, Loader2 } from "lucide-react";
import { useCart } from "@/hooks/useCart";

export const ProductIdentification: React.FC = () => {
  const {
    uploadedImage,
    uploadedFileName,
    isAnalyzing,
    uploadImage,
    removeImage,
    analyzeImage,
  } = useCart();

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragOver, setIsDragOver] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      uploadImage(e.target.files[0]);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      uploadImage(e.dataTransfer.files[0]);
    }
  };

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-4">
      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
        <div className="flex items-center space-x-2.5">
          <div className="p-2 bg-sky-50 text-sky-600 rounded-xl border border-sky-100">
            <UploadCloud className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-slate-900 text-base">
              Product Identification
            </h3>
            <p className="text-xs text-slate-500">
              Upload or drag item camera frame for vision detection
            </p>
          </div>
        </div>

        {uploadedImage && (
          <button
            type="button"
            onClick={removeImage}
            className="px-2.5 py-1 text-xs font-semibold text-rose-600 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-lg transition-colors flex items-center gap-1.5"
          >
            <Trash2 className="w-3.5 h-3.5" />
            Remove Image
          </button>
        )}
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="hidden"
      />

      {/* Upload Dropzone or Image Preview */}
      {!uploadedImage ? (
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all flex flex-col items-center justify-center gap-3 ${
            isDragOver
              ? "border-sky-500 bg-sky-50 text-sky-700"
              : "border-slate-300 bg-slate-50/60 hover:border-sky-400 hover:bg-sky-50/30 text-slate-500"
          }`}
        >
          <div className="p-3 bg-white rounded-full shadow-xs border border-slate-200 text-sky-600">
            <ImageIcon className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm font-semibold text-slate-800">
              Drag & Drop Product Image
            </p>
            <p className="text-xs text-slate-400 mt-1">
              or <span className="text-sky-600 font-bold underline">click to browse</span> from your device
            </p>
          </div>
        </div>
      ) : (
        <div className="relative rounded-xl border border-slate-200 overflow-hidden bg-slate-900 group">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={uploadedImage}
            alt="Uploaded Preview"
            className="w-full h-44 object-cover"
          />
          <div className="absolute bottom-0 inset-x-0 bg-slate-900/80 backdrop-blur-xs p-2.5 text-white flex items-center justify-between text-xs">
            <span className="truncate max-w-[200px] font-mono">
              {uploadedFileName || "captured-frame.jpg"}
            </span>
            <span className="bg-sky-500 text-white font-bold text-[10px] px-2 py-0.5 rounded">
              Ready for AI
            </span>
          </div>
        </div>
      )}

      {/* Analyze Button with Loading State */}
      <button
        type="button"
        onClick={analyzeImage}
        disabled={isAnalyzing}
        className="w-full py-3 bg-sky-600 hover:bg-sky-500 disabled:bg-slate-200 disabled:text-slate-400 disabled:cursor-not-allowed text-white font-bold text-sm rounded-xl transition-all shadow-sm flex items-center justify-center gap-2"
      >
        {isAnalyzing ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin text-sky-200" />
            <span>Analyzing with Gemma AI...</span>
          </>
        ) : (
          <>
            <Sparkles className="w-4 h-4 text-amber-300" />
            <span>Analyze with Gemma Vision AI</span>
          </>
        )}
      </button>
    </div>
  );
};

export default ProductIdentification;
