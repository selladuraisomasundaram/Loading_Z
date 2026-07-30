"use client";

import React from "react";
import { ShoppingCart, Target, Store, CreditCard, Sparkles } from "lucide-react";

export interface StoreGridProps {
  currentLocation: string;
  targetLocation: string;
  onSelectAisle: (aisleId: string) => void;
  isNavigating?: boolean;
}

export const StoreGrid: React.FC<StoreGridProps> = ({
  currentLocation = "ENTRANCE",
  targetLocation = "AISLE 2",
  onSelectAisle,
  isNavigating = false,
}) => {
  const aisles = [
    {
      id: "AISLE 1",
      name: "AISLE 1",
      category: "Produce & Bakery",
      items: ["Fresh Fruits", "Organic Greens", "Sourdough Bread"],
      shelfCount: 4,
      gridArea: "aisle-1",
    },
    {
      id: "AISLE 2",
      name: "AISLE 2",
      category: "Instant Foods & Snacks",
      items: ["Maggi Noodles", "Oats", "Peanuts", "Pasta"],
      shelfCount: 4,
      gridArea: "aisle-2",
    },
    {
      id: "AISLE 3",
      name: "AISLE 3",
      category: "Dairy & Eggs",
      items: ["Amul Milk 1L", "Creamery Butter", "Greek Yogurt"],
      shelfCount: 4,
      gridArea: "aisle-3",
    },
    {
      id: "AISLE 4",
      name: "AISLE 4",
      category: "Pantry & Condiments",
      items: ["Heinz Ketchup", "Olive Oil", "Organic Honey"],
      shelfCount: 4,
      gridArea: "aisle-4",
    },
  ];

  return (
    <div className="relative bg-slate-950 border border-slate-800 rounded-2xl p-6 shadow-2xl text-white overflow-hidden select-none">
      {/* Background Blueprint Grid Lines */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] bg-[size:24px_24px] opacity-30 pointer-events-none" />

      {/* Header Info */}
      <div className="relative z-10 flex items-center justify-between border-b border-slate-800 pb-4 mb-6">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-sky-500/10 border border-sky-500/20 rounded-xl text-sky-400">
            <Store className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-extrabold text-slate-100 text-sm tracking-wider uppercase">
              2D SUPERMARKET FLOOR PLAN
            </h3>
            <p className="text-xs text-slate-400 font-mono">
              Click any aisle to set navigation target
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-3 text-xs font-mono">
          <span className="flex items-center gap-1.5 px-2.5 py-1 bg-slate-900 border border-slate-800 rounded-lg text-slate-300">
            <span className="w-2.5 h-2.5 rounded-full bg-sky-500 animate-pulse" />
            Trolley: <strong className="text-sky-400">{currentLocation}</strong>
          </span>

          <span className="flex items-center gap-1.5 px-2.5 py-1 bg-slate-900 border border-slate-800 rounded-lg text-slate-300">
            <Target className="w-3.5 h-3.5 text-amber-400" />
            Target: <strong className="text-amber-400">{targetLocation}</strong>
          </span>
        </div>
      </div>

      {/* 2D STORE GRID MAP CANVAS */}
      <div className="relative z-10 space-y-6">
        {/* CENTER AISLES GRID (4 AISLES) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {aisles.map((aisle) => {
            const isTarget = targetLocation === aisle.id;
            const isCurrent = currentLocation === aisle.id;

            return (
              <div
                key={aisle.id}
                onClick={() => onSelectAisle(aisle.id)}
                className={`relative p-4 rounded-xl border-2 transition-all cursor-pointer space-y-3 shadow-md ${
                  isTarget
                    ? "bg-amber-950/40 border-amber-400 shadow-amber-500/10 ring-2 ring-amber-400/20"
                    : isCurrent
                    ? "bg-sky-950/40 border-sky-400 shadow-sky-500/10"
                    : "bg-slate-900/90 border-slate-800 hover:border-slate-700 hover:bg-slate-800/80"
                }`}
              >
                {/* Active Target Indicator Badge */}
                {isTarget && (
                  <div className="absolute -top-3 right-3 bg-amber-500 text-slate-950 text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full flex items-center gap-1 shadow-sm">
                    <Target className="w-3 h-3" /> Target Aisle
                  </div>
                )}

                {/* Active Trolley Position Indicator Badge */}
                {isCurrent && !isTarget && (
                  <div className="absolute -top-3 left-3 bg-sky-500 text-slate-950 text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full flex items-center gap-1 shadow-sm">
                    <ShoppingCart className="w-3 h-3" /> Current Pos
                  </div>
                )}

                {/* Aisle Header */}
                <div>
                  <span className="text-xs font-black font-mono text-slate-400 block uppercase">
                    {aisle.name}
                  </span>
                  <h4 className="text-sm font-extrabold text-slate-100 mt-0.5">
                    {aisle.category}
                  </h4>
                </div>

                {/* Shelf Items List */}
                <div className="space-y-1 pt-1 border-t border-slate-800">
                  <span className="text-[10px] text-slate-500 font-mono block uppercase">
                    Featured Shelves
                  </span>
                  <ul className="text-[11px] text-slate-300 font-medium space-y-0.5">
                    {aisle.items.map((item, idx) => (
                      <li key={idx} className="flex items-center gap-1 truncate">
                        <span className="w-1.5 h-1.5 rounded-full bg-slate-600" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            );
          })}
        </div>

        {/* BOTTOM STORE ZONES: ENTRANCE & CHECKOUT COUNTERS */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
          {/* Entrance Zone */}
          <div
            onClick={() => onSelectAisle("ENTRANCE")}
            className={`p-4 rounded-xl border-2 transition-all cursor-pointer flex items-center justify-between ${
              currentLocation === "ENTRANCE"
                ? "bg-sky-950/60 border-sky-400"
                : "bg-slate-900 border-slate-800 hover:border-slate-700"
            }`}
          >
            <div className="flex items-center space-x-3">
              <div className="p-2.5 bg-sky-500/20 text-sky-400 rounded-xl border border-sky-500/30">
                <ShoppingCart className={`w-5 h-5 ${isNavigating ? "animate-bounce" : ""}`} />
              </div>
              <div>
                <span className="text-[10px] font-mono text-slate-400 uppercase tracking-widest block">
                  Main Gateway
                </span>
                <h4 className="text-sm font-black text-slate-100">
                  ENTRANCE & TROLLEY DOCK
                </h4>
              </div>
            </div>

            {currentLocation === "ENTRANCE" && (
              <span className="bg-sky-500 text-slate-950 text-[10px] font-black px-2.5 py-1 rounded-full uppercase tracking-wider">
                🛒 You Are Here
              </span>
            )}
          </div>

          {/* Checkout Counters Zone */}
          <div
            onClick={() => onSelectAisle("CHECKOUT")}
            className={`p-4 rounded-xl border-2 transition-all cursor-pointer flex items-center justify-between ${
              targetLocation === "CHECKOUT"
                ? "bg-emerald-950/60 border-emerald-400"
                : "bg-slate-900 border-slate-800 hover:border-slate-700"
            }`}
          >
            <div className="flex items-center space-x-3">
              <div className="p-2.5 bg-emerald-500/20 text-emerald-400 rounded-xl border border-emerald-500/30">
                <CreditCard className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[10px] font-mono text-slate-400 uppercase tracking-widest block">
                  Express Payment
                </span>
                <h4 className="text-sm font-black text-slate-100">
                  CHECKOUT COUNTERS
                </h4>
              </div>
            </div>

            {targetLocation === "CHECKOUT" ? (
              <span className="bg-emerald-400 text-slate-950 text-[10px] font-black px-2.5 py-1 rounded-full uppercase tracking-wider">
                🎯 Target Destination
              </span>
            ) : (
              <span className="text-[11px] text-slate-500 font-mono">
                Counter 1–4
              </span>
            )}
          </div>
        </div>

        {/* Pathfinder Status Banner */}
        <div className="p-3 bg-slate-900 border border-slate-800 rounded-xl flex items-center justify-between text-xs text-slate-300">
          <div className="flex items-center space-x-2">
            <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
            <span className="font-mono text-slate-300">
              Pathfinder: <strong className="text-emerald-400">{currentLocation}</strong> → <strong className="text-amber-400">{targetLocation}</strong>
            </span>
          </div>
          <span className="text-[10px] font-mono text-slate-500 uppercase">
            Click any aisle box to navigate
          </span>
        </div>
      </div>
    </div>
  );
};

export default StoreGrid;
