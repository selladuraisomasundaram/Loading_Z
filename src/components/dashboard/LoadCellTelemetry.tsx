"use client";

import React from "react";
import { Scale, CheckCircle2, Clock } from "lucide-react";
import { useCart } from "@/hooks/useCart";
import { formatWeight } from "@/lib/utils";

export const LoadCellTelemetry: React.FC = () => {
  const { loadCell } = useCart();

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-3">
      <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
        <div className="flex items-center space-x-2.5">
          <div className="p-2 bg-sky-50 text-sky-600 rounded-xl border border-sky-100">
            <Scale className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-slate-900 text-base">
              Load Cell Telemetry
            </h3>
            <p className="text-xs text-slate-500">
              HX711 strain gauge real-time cart weight
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          {/* Stable / Unstable Status */}
          <span
            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${
              loadCell.isStable
                ? "bg-emerald-50 text-emerald-700 border-emerald-300"
                : "bg-amber-50 text-amber-700 border-amber-300 animate-pulse"
            }`}
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            {loadCell.statusText}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 items-center">
        {/* Current Weight Display with Gold/Yellow Highlight */}
        <div className="p-4 bg-amber-50/70 border border-amber-200 rounded-xl space-y-0.5">
          <span className="text-[11px] font-bold text-amber-800 uppercase tracking-wider">
            Current Scale Weight
          </span>
          <p className="text-3xl font-black text-amber-600 font-mono tracking-tight">
            {formatWeight(loadCell.currentWeightGrams)}
          </p>
        </div>

        {/* Expected vs Last Updated */}
        <div className="space-y-2 text-xs">
          <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between">
            <span className="text-slate-500 font-medium">Expected Item Weight:</span>
            <span className="font-bold text-slate-800 font-mono">
              {formatWeight(loadCell.expectedWeightGrams)}
            </span>
          </div>

          <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between">
            <span className="text-slate-500 font-medium flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-sky-600" />
              Last Sensor Heartbeat:
            </span>
            <span className="font-semibold text-slate-700 font-mono">
              {loadCell.lastUpdated}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoadCellTelemetry;
