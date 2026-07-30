"use client";

import React from "react";
import { ShoppingCart, Cpu, Server, Sparkles } from "lucide-react";
import { useCart } from "@/hooks/useCart";

export const Header: React.FC = () => {
  const { itemCount } = useCart();

  return (
    <header className="w-full bg-white border-b border-slate-200 shadow-sm sticky top-0 z-30 px-6 py-3.5 flex flex-wrap items-center justify-between gap-4">
      {/* Brand & Team */}
      <div className="flex items-center space-x-3.5">
        <div className="p-2.5 bg-sky-500/10 border border-sky-500/20 rounded-xl text-sky-600 flex items-center justify-center">
          <ShoppingCart className="w-6 h-6" />
        </div>
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">
              Smart Trolley OS
            </h1>
            <span className="bg-sky-100 text-sky-800 text-[11px] font-bold px-2 py-0.5 rounded-full border border-sky-200">
              v2.4
            </span>
          </div>
          <p className="text-xs font-semibold text-sky-700 flex items-center gap-1.5 mt-0.5">
            <span>Team:</span>
            <span className="bg-amber-100 text-amber-900 px-2 py-0.5 rounded border border-amber-200 font-bold">
              Agaram Acolytes
            </span>
          </p>
        </div>
      </div>

      {/* Status Badges */}
      <div className="flex items-center space-x-3">
        {/* Gemma Status Indicator */}
        <div className="flex items-center space-x-2 bg-slate-50 border border-slate-200 px-3.5 py-1.5 rounded-xl shadow-2xs">
          <div className="p-1 bg-amber-100 text-amber-600 rounded-md">
            <Sparkles className="w-3.5 h-3.5" />
          </div>
          <div className="text-left">
            <p className="text-[10px] uppercase tracking-wider font-bold text-slate-400">
              Vision AI Model
            </p>
            <p className="text-xs font-semibold text-slate-700 flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              Gemma 2B Vision • Online
            </p>
          </div>
        </div>

        {/* Backend Connection Indicator */}
        <div className="flex items-center space-x-2 bg-slate-50 border border-slate-200 px-3.5 py-1.5 rounded-xl shadow-2xs">
          <div className="p-1 bg-sky-100 text-sky-600 rounded-md">
            <Server className="w-3.5 h-3.5" />
          </div>
          <div className="text-left">
            <p className="text-[10px] uppercase tracking-wider font-bold text-slate-400">
              Backend Server
            </p>
            <p className="text-xs font-semibold text-slate-700 flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              FastAPI • Connected
            </p>
          </div>
        </div>

        {/* Trolley Cart Counter */}
        <div className="flex items-center space-x-2 bg-sky-600 text-white px-4 py-2 rounded-xl font-bold text-sm shadow-sm hover:bg-sky-500 transition-colors">
          <Cpu className="w-4 h-4 text-sky-200" />
          <span>Cart: {itemCount} Items</span>
        </div>
      </div>
    </header>
  );
};

export default Header;
