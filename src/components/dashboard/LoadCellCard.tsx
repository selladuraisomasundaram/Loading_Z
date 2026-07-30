"use client";

import React from "react";
import { Scale, AlertTriangle, CheckCircle, RefreshCw } from "lucide-react";
import { useCart } from "@/hooks/useCart";
import { formatWeight } from "@/lib/utils";

export interface LoadCellCardProps {
  onTareScale?: () => void;
}

export const LoadCellCard: React.FC<LoadCellCardProps> = ({ onTareScale }) => {
  const { loadCell } = useCart();

  const isMismatch = loadCell.isWeightMismatch;

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4 shadow-sm">
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <div className="flex items-center space-x-2.5">
          <div className="p-2 bg-blue-500/10 border border-blue-500/20 rounded-lg text-blue-400">
            <Scale className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-slate-100 text-base">
              Load Cell Weight Sensor
            </h3>
            <p className="text-xs text-slate-400">
              Real-time hardware weight validation
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={onTareScale}
          className="px-2.5 py-1 text-xs text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg transition-colors flex items-center gap-1.5"
        >
          <RefreshCw className="w-3 h-3 text-blue-400" />
          Tare Scale
        </button>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="p-3 bg-slate-800/50 border border-slate-700/60 rounded-xl space-y-1">
          <span className="text-xs text-slate-400 font-medium">Measured Scale</span>
          <p className="text-xl font-bold text-slate-100 font-mono">
            {formatWeight(loadCell.currentWeightGrams)}
          </p>
        </div>

        <div className="p-3 bg-slate-800/50 border border-slate-700/60 rounded-xl space-y-1">
          <span className="text-xs text-slate-400 font-medium">Expected Cart</span>
          <p className="text-xl font-bold text-slate-100 font-mono">
            {formatWeight(loadCell.expectedWeightGrams)}
          </p>
        </div>
      </div>

      {/* Verification Status Banner */}
      <div
        className={`p-3 rounded-xl border flex items-center justify-between text-xs ${
          isMismatch
            ? "bg-rose-500/10 border-rose-500/30 text-rose-300"
            : "bg-emerald-500/10 border-emerald-500/30 text-emerald-300"
        }`}
      >
        <div className="flex items-center space-x-2">
          {isMismatch ? (
            <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
          ) : (
            <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
          )}
          <span className="font-semibold">
            {isMismatch
              ? `Weight Mismatch (${formatWeight(Math.abs(loadCell.weightDeltaGrams))})`
              : "Weight Verification Passed"}
          </span>
        </div>
        <span className="text-[10px] text-slate-400">
          Delta: {loadCell.weightDeltaGrams > 0 ? "+" : ""}
          {loadCell.weightDeltaGrams}g
        </span>
      </div>
    </div>
  );
};

export default LoadCellCard;
