"use client";

import React from "react";
import { MapPin, Navigation, ShoppingBag, Info } from "lucide-react";
import { useCart } from "@/hooks/useCart";

export const StoreMapView: React.FC = () => {
  const { items } = useCart();

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-100 pb-4">
        <div className="flex items-center space-x-3">
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl border border-emerald-200">
            <MapPin className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-lg font-extrabold text-slate-900">
              Interactive Store Map
            </h2>
            <p className="text-xs text-slate-500">
              Aisle layout & optimized picking route for active cart items
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <span className="bg-emerald-100 text-emerald-900 font-bold text-xs px-3 py-1 rounded-full border border-emerald-300 flex items-center gap-1.5">
            <Navigation className="w-3.5 h-3.5 text-emerald-700" />
            Route Optimized
          </span>
        </div>
      </div>

      {/* Grid Floor Plan Preview */}
      <div className="bg-slate-900 rounded-2xl p-6 text-white space-y-4">
        <div className="flex items-center justify-between text-xs text-slate-400 border-b border-slate-800 pb-3">
          <span className="font-mono font-bold text-emerald-400">
            STORE FLOOR PLAN: SUPERMARKET ZONE A
          </span>
          <span>Trolley Position: Aisle 3 (Dairy)</span>
        </div>

        {/* Mock Aisle Grid */}
        <div className="grid grid-cols-4 gap-4 py-4">
          <div className="p-4 bg-slate-800/80 border border-slate-700 rounded-xl text-center space-y-1">
            <span className="text-xs font-bold text-sky-400">Aisle 1</span>
            <p className="text-xs text-slate-300 font-semibold">Produce & Bakery</p>
          </div>

          <div className="p-4 bg-slate-800/80 border border-slate-700 rounded-xl text-center space-y-1">
            <span className="text-xs font-bold text-sky-400">Aisle 2</span>
            <p className="text-xs text-slate-300 font-semibold">Beverages & Juices</p>
          </div>

          <div className="p-4 bg-emerald-950/60 border-2 border-emerald-500 rounded-xl text-center space-y-1 shadow-md">
            <span className="text-xs font-black text-emerald-400 flex items-center justify-center gap-1">
              <MapPin className="w-3.5 h-3.5 animate-bounce" />
              Aisle 3 (You)
            </span>
            <p className="text-xs text-emerald-200 font-bold">Dairy & Eggs</p>
          </div>

          <div className="p-4 bg-slate-800/80 border border-slate-700 rounded-xl text-center space-y-1">
            <span className="text-xs font-bold text-sky-400">Aisle 4</span>
            <p className="text-xs text-slate-300 font-semibold">Snacks & Instant Foods</p>
          </div>
        </div>
      </div>

      {/* Cart Items Location Summary */}
      <div className="space-y-3">
        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
          <ShoppingBag className="w-4 h-4 text-sky-600" />
          Aisle Locations for Current Cart ({items.length} items)
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          {items.map((item) => (
            <div
              key={item.product.id}
              className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between"
            >
              <div>
                <p className="font-bold text-slate-900">{item.product.name}</p>
                <p className="text-slate-500 text-[11px]">
                  {item.product.category}
                </p>
              </div>
              <span className="bg-sky-100 text-sky-900 font-bold px-2.5 py-1 rounded-lg border border-sky-300">
                Aisle 3
              </span>
            </div>
          ))}
        </div>

        <div className="p-3 bg-sky-50 border border-sky-200 rounded-xl flex items-center space-x-2 text-xs text-sky-800">
          <Info className="w-4 h-4 text-sky-600 shrink-0" />
          <span>
            Follow the green highlighted route on the map for the fastest checkout path.
          </span>
        </div>
      </div>
    </div>
  );
};

export default StoreMapView;
