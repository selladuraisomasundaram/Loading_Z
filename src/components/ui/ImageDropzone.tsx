"use client";

import React, { useState } from "react";
import { UploadCloud, Camera, Image as ImageIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export interface ImageDropzoneProps {
  onImageSelected?: (file: File) => void;
  className?: string;
}

export const ImageDropzone: React.FC<ImageDropzoneProps> = ({
  onImageSelected,
  className,
}) => {
  const [isDragOver, setIsDragOver] = useState(false);

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
      onImageSelected?.(e.dataTransfer.files[0]);
    }
  };

  return (
    <div
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={cn(
        "border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all flex flex-col items-center justify-center gap-3",
        isDragOver
          ? "border-emerald-500 bg-emerald-500/10 text-emerald-300"
          : "border-slate-700 bg-slate-800/50 hover:border-slate-600 text-slate-400 hover:text-slate-200",
        className
      )}
    >
      <div className="p-3 bg-slate-800 rounded-full border border-slate-700 text-emerald-400">
        <UploadCloud className="w-6 h-6" />
      </div>

      <div>
        <p className="text-sm font-semibold text-slate-200">
          Upload Camera Frame / Scan Image
        </p>
        <p className="text-xs text-slate-400 mt-1">
          Drag & drop item preview image here or click to browse
        </p>
      </div>

      <div className="flex items-center gap-2 mt-1 text-xs text-slate-400">
        <span className="inline-flex items-center gap-1 bg-slate-800 px-2.5 py-1 rounded-md border border-slate-700">
          <Camera className="w-3.5 h-3.5 text-emerald-400" /> WebCam Mock
        </span>
        <span className="inline-flex items-center gap-1 bg-slate-800 px-2.5 py-1 rounded-md border border-slate-700">
          <ImageIcon className="w-3.5 h-3.5 text-cyan-400" /> JPG / PNG
        </span>
      </div>
    </div>
  );
};

export default ImageDropzone;
