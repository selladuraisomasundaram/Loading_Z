"use client";

import React from "react";
import { Activity, Radio, Camera, Scale } from "lucide-react";

export const StatusIndicator: React.FC = () => {
  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-2xs flex flex-wrap items-center justify-between gap-4">
      <div className="flex items-center space-x-2">
        <div className="p-2 bg-sky-50 text-sky-600 rounded-lg border border-sky-100">
          <Activity className="w-4 h-4" />
        </div>
        <div>
          <h4 className="font-bold text-slate-900 text-xs">
            Hardware & System Telemetry
          </h4>
          <p className="text-[11px] text-slate-400">
            Real-time status indicators
          </p>
        </div>
      </div>

      <div className="flex items-center space-x-3 text-xs font-semibold">
        <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 px-3 py-1 rounded-lg">
          <Radio className="w-3.5 h-3.5 text-emerald-600 animate-pulse" />
          <span className="text-slate-700">MQTT Broker: Online</span>
        </div>

        <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 px-3 py-1 rounded-lg">
          <Camera className="w-3.5 h-3.5 text-sky-600" />
          <span className="text-slate-700">AI Camera: Active</span>
        </div>

        <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 px-3 py-1 rounded-lg">
          <Scale className="w-3.5 h-3.5 text-amber-600" />
          <span className="text-slate-700">HX711 Load Cell: Calibrated</span>
        </div>
      </div>
    </div>
  );
};

export default StatusIndicator;
