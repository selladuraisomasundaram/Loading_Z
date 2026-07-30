"use client";

import React, { useRef, useState } from "react";
import {
  UploadCloud,
  ImageIcon,
  Trash2,
  Sparkles,
  Loader2,
  AlertCircle,
  FileCheck,
} from "lucide-react";
import { useCart } from "@/hooks/useCart";
import { formatFileSize } from "@/lib/utils";

export const ImageDropzone: React.FC = () => {
  const {
    uploadedImage,
    uploadedFileName,
    uploadedFileSize,
    fileError,
    isAnalyzing,
    selectFile,
    removeImage,
    analyzeSelectedFile,
  } = useCart();

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragOver, setIsDragOver] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      selectFile(e.target.files[0]);
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
      selectFile(e.dataTransfer.files[0]);
    }
  };

  return (
    <div className="space-y-3">
      {/* File input accepting JPG, JPEG, PNG, WEBP */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,.jpg,.jpeg,.png,.webp"
        onChange={handleFileChange}
        className="hidden"
      />

      {/* Validation Error Notice */}
      {fileError && (
        <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl flex items-start space-x-2 text-rose-700 text-xs">
          <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
          <span className="font-medium">{fileError}</span>
        </div>
      )}

      {/* Drop area or Image Preview */}
      {!uploadedImage ? (
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all flex flex-col items-center justify-center gap-3 ${
            isDragOver
              ? "border-sky-500 bg-sky-50 text-sky-700 shadow-sm"
              : "border-slate-300 bg-slate-50/60 hover:border-sky-400 hover:bg-sky-50/30 text-slate-500"
          }`}
        >
          <div className="p-3 bg-white rounded-full shadow-2xs border border-slate-200 text-sky-600">
            <UploadCloud className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm font-bold text-slate-800">
              Drag & Drop Product Image
            </p>
            <p className="text-xs text-slate-500 mt-1">
              or <span className="text-sky-600 font-extrabold underline">click to browse</span>
            </p>
          </div>
          <div className="flex items-center gap-1 text-[11px] font-semibold text-slate-400 bg-white border border-slate-200 px-2.5 py-1 rounded-md shadow-2xs">
            <ImageIcon className="w-3.5 h-3.5 text-sky-500" />
            <span>Supported formats: JPG, JPEG, PNG, WEBP</span>
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          {/* Selected Image Preview with Overlay */}
          <div className="relative rounded-xl border border-slate-200 overflow-hidden bg-slate-900 shadow-xs group">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={uploadedImage}
              alt="Uploaded Preview"
              className="w-full h-48 object-cover transition-opacity group-hover:opacity-90"
            />

            {/* Remove selected image button */}
            <button
              type="button"
              onClick={removeImage}
              className="absolute top-2.5 right-2.5 p-2 bg-rose-600 hover:bg-rose-700 text-white rounded-lg shadow-md transition-all flex items-center gap-1 text-xs font-bold"
              title="Remove selected image"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Remove</span>
            </button>

            {/* Preview Banner Details: Name & Size */}
            <div className="absolute bottom-0 inset-x-0 bg-slate-950/80 backdrop-blur-xs p-3 text-white flex items-center justify-between text-xs border-t border-slate-800">
              <div className="flex items-center space-x-2 min-w-0 pr-2">
                <FileCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                <div className="min-w-0">
                  <p className="font-mono font-bold text-slate-100 truncate">
                    {uploadedFileName || "captured-frame.jpg"}
                  </p>
                  {uploadedFileSize !== null && (
                    <p className="text-[10px] text-slate-400 font-mono">
                      Size: {formatFileSize(uploadedFileSize)}
                    </p>
                  )}
                </div>
              </div>
              <span className="bg-sky-500/20 text-sky-300 border border-sky-400/40 text-[10px] font-bold px-2 py-0.5 rounded shrink-0">
                Ready for AI
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Analyze Button with Loading State */}
      <button
        type="button"
        onClick={() => analyzeSelectedFile()}
        disabled={isAnalyzing || (!uploadedImage && !fileError)}
        className="w-full py-3 bg-sky-600 hover:bg-sky-500 disabled:bg-slate-200 disabled:text-slate-400 disabled:cursor-not-allowed text-white font-extrabold text-sm rounded-xl transition-all shadow-xs flex items-center justify-center gap-2"
      >
        {isAnalyzing ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin text-sky-200" />
            <span>Analyzing with Vision AI...</span>
          </>
        ) : (
          <>
            <Sparkles className="w-4 h-4 text-amber-300" />
            <span>Analyze Product Image</span>
          </>
        )}
      </button>
    </div>
  );
};

export default ImageDropzone;
