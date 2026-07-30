"use client";

import React from "react";
import { Scale, Wifi, RefreshCw } from "lucide-react";
import { useSensorData } from "@/hooks/useSensorData";

export const LoadCellCard: React.FC = () => {
  const { sensorData, tareScale } = useSensorData();

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
        <div className="flex items-center space-x-2.5">
          <div className="p-2 bg-sky-50 text-sky-600 rounded-xl border border-sky-100">
            <Scale className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-extrabold text-slate-900 text-sm tracking-wider uppercase">
              LIVE WEIGHT
            </h3>
            <p className="text-xs text-slate-500">
              HX711 Strain Gauge Telemetry
            </p>
          </div>
        </div>

        {/* Sensor Connection State */}
        <div className="flex items-center space-x-2">
          <span
            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold border ${
              sensorData.connected
                ? "bg-sky-50 text-sky-700 border-sky-200"
                : "bg-rose-50 text-rose-700 border-rose-200"
            }`}
          >
            <Wifi className="w-3.5 h-3.5" />
            {sensorData.connected ? "Sensor Connected" : "Sensor Offline"}
          </span>

          <button
            type="button"
            onClick={tareScale}
            className="p-1.5 text-slate-400 hover:text-sky-600 hover:bg-sky-50 rounded-lg transition-colors"
            title="Tare Scale"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main Weight Display in Kg & Status Badges */}
      <div className="p-4 bg-amber-50/80 border border-amber-200 rounded-xl space-y-2">
        <span className="text-[10px] font-bold text-amber-900 uppercase tracking-widest block">
          Current Cart Weight
        </span>

        <div className="flex items-baseline justify-between">
          <p className="text-4xl font-black text-amber-600 font-mono tracking-tight">
            {sensorData.weightKg.toFixed(3)}{" "}
            <span className="text-xl font-bold text-amber-700">kg</span>
          </p>

          {/* Stability Status Badge */}
          <span
            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider border ${
              sensorData.stable
                ? "bg-emerald-100 text-emerald-900 border-emerald-300 shadow-2xs"
                : "bg-amber-100 text-amber-900 border-amber-300 animate-pulse"
            }`}
          >
            <span className={`w-2 h-2 rounded-full ${sensorData.stable ? "bg-emerald-600" : "bg-amber-600"}`} />
            {sensorData.stable ? "STABLE" : "MEASURING..."}
          </span>
        </div>

        {/* Timestamp */}
        <p className="text-[11px] text-slate-500 font-medium border-t border-amber-200/60 pt-2 mt-2">
          {sensorData.timestamp}
        </p>
      </div>
    </div>
  );
};

export default LoadCellCard;
