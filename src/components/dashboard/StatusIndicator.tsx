"use client";

import React from "react";
import { Activity, Radio, Camera, Scale } from "lucide-react";
import { useCart } from "@/hooks/useCart";
import { ConnectionStatus } from "@/types";

export interface StatusIndicatorProps {
  onReconnect?: () => void;
}

export const StatusIndicator: React.FC<StatusIndicatorProps> = ({
  onReconnect,
}) => {
  const { trolleyStatus } = useCart();

  const renderStatusBadge = (status: ConnectionStatus) => {
    switch (status) {
      case "connected":
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            Online
          </span>
        );
      case "connecting":
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-400 bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded-full">
            Connecting...
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-rose-400 bg-rose-500/10 border border-rose-500/20 px-2 py-0.5 rounded-full">
            Offline
          </span>
        );
    }
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4 shadow-sm">
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <div className="flex items-center space-x-2.5">
          <div className="p-2 bg-purple-500/10 border border-purple-500/20 rounded-lg text-purple-400">
            <Activity className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-slate-100 text-base">
              System Telemetry & Status
            </h3>
            <p className="text-xs text-slate-400">
              Hardware communication status flags
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={onReconnect}
          className="px-2.5 py-1 text-xs text-purple-300 hover:text-white bg-purple-500/10 hover:bg-purple-500/20 border border-purple-500/30 rounded-lg transition-colors"
        >
          Sync Signal
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="p-3 bg-slate-800/50 border border-slate-700/60 rounded-xl flex items-center justify-between">
          <div className="flex items-center space-x-2 text-xs text-slate-300">
            <Radio className="w-4 h-4 text-emerald-400" />
            <span>MQTT Broker</span>
          </div>
          {renderStatusBadge(trolleyStatus.mqttConnection)}
        </div>

        <div className="p-3 bg-slate-800/50 border border-slate-700/60 rounded-xl flex items-center justify-between">
          <div className="flex items-center space-x-2 text-xs text-slate-300">
            <Camera className="w-4 h-4 text-cyan-400" />
            <span>AI Camera</span>
          </div>
          {renderStatusBadge(trolleyStatus.cameraConnection)}
        </div>

        <div className="p-3 bg-slate-800/50 border border-slate-700/60 rounded-xl flex items-center justify-between">
          <div className="flex items-center space-x-2 text-xs text-slate-300">
            <Scale className="w-4 h-4 text-amber-400" />
            <span>HX711 Load Cell</span>
          </div>
          {renderStatusBadge(trolleyStatus.loadCellConnection)}
        </div>
      </div>
    </div>
  );
};

export default StatusIndicator;
