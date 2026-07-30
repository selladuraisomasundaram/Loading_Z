"use client";

import React from "react";
import { ShoppingCart, ShoppingBag, BatteryCharging, Radio } from "lucide-react";
import { useCart } from "@/hooks/useCart";

export interface HeaderProps {
  title?: string;
}

export const Header: React.FC<HeaderProps> = ({
  title = "Smart Trolley Assistant",
}) => {
  const { trolleyStatus, totalItemCount } = useCart();

  return (
    <header className="w-full bg-slate-900 border-b border-slate-800 text-white px-6 py-4 flex flex-wrap items-center justify-between gap-4 shadow-md">
      <div className="flex items-center space-x-3">
        <div className="p-2.5 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-emerald-400">
          <ShoppingBag className="w-6 h-6" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-slate-100 tracking-tight">
            {title}
          </h1>
          <p className="text-xs text-slate-400 font-mono">
            {trolleyStatus.trolleyId}
          </p>
        </div>
      </div>

      <div className="flex items-center space-x-6 text-sm">
        {/* Connection status placeholder */}
        <div className="flex items-center space-x-2 bg-slate-800/80 px-3 py-1.5 rounded-lg border border-slate-700">
          <Radio className="w-4 h-4 text-emerald-400 animate-pulse" />
          <span className="text-xs font-medium text-slate-300">Live Sync</span>
        </div>

        {/* Battery placeholder */}
        <div className="flex items-center space-x-2 bg-slate-800/80 px-3 py-1.5 rounded-lg border border-slate-700">
          <BatteryCharging className="w-4 h-4 text-emerald-400" />
          <span className="text-xs font-semibold text-slate-300">
            {trolleyStatus.batteryLevelPercent}%
          </span>
        </div>

        {/* Cart Count badge */}
        <div className="relative flex items-center justify-center p-2.5 bg-emerald-600 rounded-xl text-white font-medium shadow-sm hover:bg-emerald-500 transition-colors">
          <ShoppingCart className="w-5 h-5" />
          {totalItemCount > 0 && (
            <span className="absolute -top-1 -right-1 bg-amber-500 text-slate-950 font-bold text-xs w-5 h-5 rounded-full flex items-center justify-center border-2 border-slate-900">
              {totalItemCount}
            </span>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
