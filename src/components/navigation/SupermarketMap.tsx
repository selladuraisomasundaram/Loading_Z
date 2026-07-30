"use client";

import React, { useState } from "react";
import {
  MapPin,
  Layers,
  Info,
  CheckCircle2,
  Package,
  Sparkles,
  Play,
  Square,
  Compass,
} from "lucide-react";
import {
  storeAisles,
  storeZones,
  storeMapConfig,
  catalogProducts,
  AisleData,
} from "./storeMapData";
import { Product, ProductLocation, MultiProductRouteResult } from "@/types";
import { supermarketGraph } from "@/lib/navigation/navigationGraph";
import { findShortestPathAStar } from "@/lib/navigation/aStar";
import { optimizeMultiProductRoute } from "@/lib/navigation/routeOptimizer";
import { formatCurrency } from "@/lib/utils";

export interface SupermarketMapProps {
  initialSelectedAisleId?: string;
  selectedProduct?: Product | null;
  multiSelectedLocations?: ProductLocation[];
  cartProducts?: Product[];
  onAisleSelect?: (aisle: AisleData) => void;
  onProductSelect?: (product: Product) => void;
}

export const SupermarketMap: React.FC<SupermarketMapProps> = ({
  initialSelectedAisleId = "A3",
  selectedProduct = null,
  multiSelectedLocations = [],
  cartProducts = [],
  onAisleSelect,
  onProductSelect,
}) => {
  const [selectedAisleId, setSelectedAisleId] = useState<string>(
    selectedProduct?.location?.aisleId || initialSelectedAisleId
  );
  const [isNavigating, setIsNavigating] = useState<boolean>(false);

  const activeAisleId = selectedProduct?.location?.aisleId || selectedAisleId;
  const selectedAisle =
    storeAisles.find((a) => a.id === activeAisleId) || storeAisles[0]!;

  const aisleProducts = catalogProducts.filter(
    (p) => p.location?.aisleId === activeAisleId
  );

  const handleAisleClick = (aisle: AisleData) => {
    setSelectedAisleId(aisle.id);
    onAisleSelect?.(aisle);
  };

  // PHASE 4: Multi-Product TSP Route Optimizer Calculation
  const activeProductList: Product[] =
    cartProducts.length > 0
      ? cartProducts
      : selectedProduct
      ? [selectedProduct]
      : [];

  const multiRoute: MultiProductRouteResult = optimizeMultiProductRoute(
    activeProductList
  );

  // Fallback single-product route if no cart items
  const singleRoute = findShortestPathAStar(
    supermarketGraph,
    "N_ENTRANCE",
    `N_AISLE_${activeAisleId}`
  );

  const activeWaypoints =
    multiRoute.fullSvgWaypoints.length > 0
      ? multiRoute.fullSvgWaypoints
      : singleRoute.waypoints;

  const svgPathD =
    activeWaypoints.length > 0
      ? activeWaypoints.reduce(
          (acc, curr, idx) =>
            idx === 0 ? `M ${curr.x} ${curr.y}` : `${acc} L ${curr.x} ${curr.y}`,
          ""
        )
      : "";

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* MAP HEADER & LEGEND BAR */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 bg-sky-50 text-sky-600 rounded-xl border border-sky-100">
            <MapPin className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-lg font-extrabold text-slate-900 tracking-tight">
              Supermarket Floor Map & Multi-Product Route Engine
            </h2>
            <p className="text-xs text-slate-500">
              Phase 4: TSP Route Optimization • Numbered Waypoint Order • Checkout Destination
            </p>
          </div>
        </div>

        {/* MAP LEGEND */}
        <div className="flex flex-wrap items-center gap-3 text-xs bg-slate-50 border border-slate-200 p-2.5 rounded-xl font-medium">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
            Legend:
          </span>
          <div className="flex items-center gap-1.5 text-slate-700">
            <span className="w-3 h-3 rounded-full bg-emerald-500 border border-emerald-600" />
            <span>🟢 Start</span>
          </div>
          <div className="flex items-center gap-1.5 text-sky-700 font-bold">
            <span className="w-4 h-1 bg-sky-400 rounded-full" />
            <span>━━ TSP Route</span>
          </div>
          <div className="flex items-center gap-1.5 text-amber-800 font-bold">
            <span className="w-4 h-4 rounded-full bg-amber-500 text-slate-950 flex items-center justify-center font-black text-[9px]">
              ①
            </span>
            <span>Stop Order</span>
          </div>
          <div className="flex items-center gap-1.5 text-emerald-800 font-bold">
            <span className="w-3 h-3 rounded-full bg-emerald-500 border border-emerald-600" />
            <span>🏁 Checkout</span>
          </div>
        </div>
      </div>

      {/* SVG INTERACTIVE SUPERMARKET FLOOR CANVAS */}
      <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 sm:p-6 shadow-2xl relative overflow-hidden select-none">
        {/* Background Blueprint Grid Lines */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] bg-[size:30px_30px] opacity-20 pointer-events-none" />

        <svg
          viewBox={`0 0 ${storeMapConfig.viewWidth} ${storeMapConfig.viewHeight}`}
          preserveAspectRatio="xMidYMid meet"
          className="w-full h-auto max-h-[520px] drop-shadow-md"
        >
          <defs>
            <pattern
              id="shelfPattern"
              width="10"
              height="10"
              patternUnits="userSpaceOnUse"
            >
              <line x1="0" y1="5" x2="10" y2="5" stroke="#334155" strokeWidth="1" />
            </pattern>

            <linearGradient id="selectedGlowGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.9" />
              <stop offset="100%" stopColor="#d97706" stopOpacity="0.95" />
            </linearGradient>

            <linearGradient id="aisleGradFill" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#1e293b" stopOpacity="0.95" />
              <stop offset="100%" stopColor="#0f172a" stopOpacity="0.95" />
            </linearGradient>
          </defs>

          {/* STORE OUTER BOUNDARY WALL */}
          <rect
            x="20"
            y="20"
            width="860"
            height="560"
            rx="20"
            fill="none"
            stroke="#334155"
            strokeWidth="3"
            strokeDasharray="6 6"
          />

          {/* STORE TITLE BANNER */}
          <text
            x="450"
            y="48"
            textAnchor="middle"
            fill="#64748b"
            fontSize="14"
            fontWeight="bold"
            letterSpacing="3"
          >
            SMART SUPERMARKET FLOOR PLAN — ZONE A
          </text>

          {/* WALKING CORRIDORS */}
          <path
            d="M 150 510 L 150 125 L 720 125 M 340 510 L 340 125 M 530 510 L 530 125 M 720 510 L 720 125"
            fill="none"
            stroke="#1e293b"
            strokeWidth="12"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* RENDER 12 INTERACTIVE AISLES (A1-C4) */}
          {storeAisles.map((aisle) => {
            const isSelected = activeAisleId === aisle.id;

            return (
              <g
                key={aisle.id}
                onClick={() => handleAisleClick(aisle)}
                className="cursor-pointer transition-all duration-200 group"
              >
                <rect
                  x={aisle.x}
                  y={aisle.y}
                  width={aisle.width}
                  height={aisle.height}
                  rx="12"
                  fill={isSelected ? "url(#selectedGlowGrad)" : "url(#aisleGradFill)"}
                  stroke={isSelected ? "#fbbf24" : "#334155"}
                  strokeWidth={isSelected ? "3" : "1.5"}
                  className="group-hover:stroke-sky-400 transition-colors"
                />

                <rect
                  x={aisle.x + 8}
                  y={aisle.y + 28}
                  width={aisle.width - 16}
                  height={aisle.height - 36}
                  rx="6"
                  fill="url(#shelfPattern)"
                  opacity={isSelected ? "0.3" : "0.5"}
                />

                <rect
                  x={aisle.x + 10}
                  y={aisle.y + 8}
                  width="42"
                  height="22"
                  rx="6"
                  fill={isSelected ? "#78350f" : "#0284c7"}
                />

                <text
                  x={aisle.x + 31}
                  y={aisle.y + 23}
                  textAnchor="middle"
                  fill="#ffffff"
                  fontSize="12"
                  fontWeight="900"
                  fontFamily="monospace"
                >
                  {aisle.label}
                </text>

                <text
                  x={aisle.x + 58}
                  y={aisle.y + 23}
                  fill={isSelected ? "#451a03" : "#cbd5e1"}
                  fontSize="10"
                  fontWeight="bold"
                  className="truncate"
                >
                  {aisle.category.split("&")[0]?.trim() || aisle.category}
                </text>
              </g>
            );
          })}

          {/* RENDER MULTI-PRODUCT PINS */}
          {multiSelectedLocations.map((loc, idx) => (
            <g key={`pin-m-${idx}`}>
              <circle cx={loc.x} cy={loc.y} r="10" fill="#38bdf8" fillOpacity="0.3" />
              <circle cx={loc.x} cy={loc.y} r="8" fill="#0284c7" stroke="#ffffff" strokeWidth="2" />
              <text x={loc.x} y={loc.y + 4} textAnchor="middle" fill="#ffffff" fontSize="10" fontWeight="900">
                📍
              </text>
            </g>
          ))}

          {/* PHASE 4: RENDER CONTINUOUS SVG TSP ROUTE POLYLINE */}
          {isNavigating && svgPathD && (
            <g>
              <path
                d={svgPathD}
                fill="none"
                stroke="#38bdf8"
                strokeWidth="10"
                strokeLinecap="round"
                strokeLinejoin="round"
                opacity="0.4"
                className="animate-pulse"
              />
              <path
                d={svgPathD}
                fill="none"
                stroke="#06b6d4"
                strokeWidth="5"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeDasharray="8 8"
              />
            </g>
          )}

          {/* PHASE 4: RENDER NUMBERED WAYPOINT BADGES (①, ②, ③, ④, ⑤ Checkout) ON SVG MAP */}
          {isNavigating &&
            multiRoute.waypoints.map((wp) => (
              <g key={wp.id} className="transition-all duration-300">
                {/* Glowing Outer Ring */}
                <circle
                  cx={wp.x}
                  cy={wp.y}
                  r="14"
                  fill={
                    wp.type === "start"
                      ? "#10b981"
                      : wp.type === "checkout"
                      ? "#059669"
                      : "#f59e0b"
                  }
                  fillOpacity="0.4"
                  className="animate-pulse"
                />
                {/* Inner Circle Badge */}
                <circle
                  cx={wp.x}
                  cy={wp.y}
                  r="11"
                  fill={
                    wp.type === "start"
                      ? "#059669"
                      : wp.type === "checkout"
                      ? "#047857"
                      : "#d97706"
                  }
                  stroke="#ffffff"
                  strokeWidth="2"
                />
                {/* Numbered Step Badge Text */}
                <text
                  x={wp.x}
                  y={wp.y + 4}
                  textAnchor="middle"
                  fill="#ffffff"
                  fontSize="11"
                  fontWeight="900"
                  fontFamily="monospace"
                >
                  {wp.type === "start"
                    ? "🟢"
                    : wp.type === "checkout"
                    ? "🏁"
                    : wp.stepNumber}
                </text>

                {/* Waypoint Text Overlay Label */}
                {wp.productName && wp.type === "product" && (
                  <g>
                    <rect
                      x={wp.x - 35}
                      y={wp.y - 28}
                      width="70"
                      height="16"
                      rx="4"
                      fill="#78350f"
                      stroke="#fcd34d"
                      strokeWidth="1"
                    />
                    <text
                      x={wp.x}
                      y={wp.y - 16}
                      textAnchor="middle"
                      fill="#fffbeb"
                      fontSize="8"
                      fontWeight="bold"
                    >
                      {wp.stepNumber}. {wp.productName.split(" ")[0]}
                    </text>
                  </g>
                )}
              </g>
            ))}

          {/* RENDER ACTIVE SELECTED PRODUCT SHELF PIN */}
          {selectedProduct && selectedProduct.location && !isNavigating && (
            <g className="animate-bounce">
              <circle
                cx={selectedProduct.location.x}
                cy={selectedProduct.location.y}
                r="18"
                fill="#a855f7"
                fillOpacity="0.4"
                className="animate-pulse"
              />
              <circle
                cx={selectedProduct.location.x}
                cy={selectedProduct.location.y}
                r="12"
                fill="#9333ea"
                stroke="#ffffff"
                strokeWidth="2.5"
              />
              <text
                x={selectedProduct.location.x}
                y={selectedProduct.location.y + 4}
                textAnchor="middle"
                fill="#ffffff"
                fontSize="12"
                fontWeight="bold"
              >
                📍
              </text>
            </g>
          )}

          {/* ENTRANCE & CHECKOUT ZONES */}
          {storeZones
            .filter((z) => z.type === "entrance")
            .map((zone) => (
              <g key={zone.id}>
                <rect
                  x={zone.x}
                  y={zone.y}
                  width={zone.width}
                  height={zone.height}
                  rx="12"
                  fill="#0284c7"
                  fillOpacity="0.2"
                  stroke="#38bdf8"
                  strokeWidth="2"
                />
                <circle cx={zone.x + 30} cy={zone.y + 27} r="14" fill="#0284c7" />
                <text x={zone.x + 30} y={zone.y + 32} textAnchor="middle" fill="#ffffff" fontSize="12">
                  🛒
                </text>
                <text x={zone.x + 52} y={zone.y + 26} fill="#f0f9ff" fontSize="12" fontWeight="900">
                  ENTRANCE
                </text>
                <text x={zone.x + 52} y={zone.y + 40} fill="#7dd3fc" fontSize="9" fontWeight="bold">
                  Trolley Pickup Dock
                </text>
              </g>
            ))}

          {storeZones
            .filter((z) => z.type === "checkout")
            .map((zone) => (
              <g key={zone.id}>
                <rect
                  x={zone.x}
                  y={zone.y}
                  width={zone.width}
                  height={zone.height}
                  rx="12"
                  fill="#059669"
                  fillOpacity="0.2"
                  stroke="#34d399"
                  strokeWidth="2"
                />
                <circle cx={zone.x + 30} cy={zone.y + 27} r="14" fill="#059669" />
                <text x={zone.x + 30} y={zone.y + 32} textAnchor="middle" fill="#ffffff" fontSize="12">
                  💳
                </text>
                <text x={zone.x + 52} y={zone.y + 26} fill="#ecfdf5" fontSize="12" fontWeight="900">
                  CHECKOUT
                </text>
                <text x={zone.x + 52} y={zone.y + 40} fill="#6ee7b7" fontSize="9" fontWeight="bold">
                  Express Self-Pay
                </text>
              </g>
            ))}
        </svg>
      </div>

      {/* PHASE 4 MULTI-PRODUCT ROUTE OPTIMIZATION TELEMETRY & CONTROLS */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 bg-emerald-50 text-emerald-600 rounded-xl border border-emerald-100">
              <Compass className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-slate-900 text-base">
                Multi-Product TSP Route Optimizer Summary
              </h3>
              <p className="text-xs text-slate-500">
                {activeProductList.length > 0
                  ? `Optimized visiting order for ${activeProductList.length} items to Checkout`
                  : "Select products or add cart items to calculate optimized route"}
              </p>
            </div>
          </div>

          <span className="bg-emerald-100 text-emerald-900 font-bold text-xs px-3 py-1 rounded-full border border-emerald-300">
            Saved: {multiRoute.distanceSavedMeters}m ({multiRoute.percentageSaved}%)
          </span>
        </div>

        {/* Route Distance Comparison Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs">
          <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
              Original Order Distance
            </span>
            <span className="font-black text-slate-500 font-mono text-sm block mt-0.5 line-through">
              {multiRoute.originalDistanceMeters} m
            </span>
          </div>

          <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl">
            <span className="text-[10px] font-bold text-emerald-800 uppercase tracking-wider block">
              Optimized TSP Distance
            </span>
            <span className="font-black text-emerald-600 font-mono text-sm block mt-0.5">
              {multiRoute.optimizedDistanceMeters} m
            </span>
          </div>

          <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl">
            <span className="text-[10px] font-bold text-amber-800 uppercase tracking-wider block">
              Distance Saved
            </span>
            <span className="font-black text-amber-600 font-mono text-sm block mt-0.5">
              {multiRoute.distanceSavedMeters} m ({multiRoute.percentageSaved}%)
            </span>
          </div>

          <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
              Total Waypoint Stops
            </span>
            <span className="font-black text-slate-900 font-mono text-sm block mt-0.5">
              {multiRoute.waypoints.length} Stops (1 Start → {activeProductList.length} Items → Checkout)
            </span>
          </div>
        </div>

        {/* OPTIMIZED VISITING ORDER LIST */}
        {multiRoute.waypoints.length > 0 && (
          <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-2 text-xs">
            <span className="text-[11px] font-extrabold text-slate-800 uppercase tracking-wider block">
              Optimized Visiting Sequence:
            </span>
            <div className="flex flex-wrap items-center gap-2 font-mono">
              {multiRoute.waypoints.map((wp, idx) => (
                <div key={wp.id} className="flex items-center gap-1.5">
                  <span
                    className={`px-2.5 py-1 rounded-lg border font-bold text-[11px] flex items-center gap-1 ${
                      wp.type === "start"
                        ? "bg-emerald-100 border-emerald-300 text-emerald-900"
                        : wp.type === "checkout"
                        ? "bg-emerald-600 border-emerald-700 text-white font-black"
                        : "bg-amber-100 border-amber-300 text-amber-900"
                    }`}
                  >
                    <span>
                      {wp.type === "start"
                        ? "🟢 Entrance"
                        : wp.type === "checkout"
                        ? "🏁 Checkout"
                        : `${wp.stepNumber}. ${wp.productName}`}
                    </span>
                    {wp.aisleId && (
                      <span className="text-[9px] opacity-75 font-normal">
                        ({wp.aisleId}/{wp.shelfId})
                      </span>
                    )}
                  </span>
                  {idx < multiRoute.waypoints.length - 1 && (
                    <span className="text-slate-400">→</span>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Action Controls: [ Optimize & Navigate ] & [ Clear Route ] */}
        <div className="flex items-center gap-3 pt-1">
          <button
            type="button"
            onClick={() => setIsNavigating(true)}
            disabled={isNavigating}
            className="flex-1 py-3 bg-emerald-600 hover:bg-emerald-500 disabled:bg-emerald-800/50 disabled:cursor-not-allowed text-white font-extrabold text-xs rounded-xl shadow-xs transition-colors flex items-center justify-center gap-2"
          >
            <Play className="w-4 h-4 fill-white" />
            <span>Optimize & Navigate Route (TSP)</span>
          </button>

          <button
            type="button"
            onClick={() => setIsNavigating(false)}
            disabled={!isNavigating}
            className="px-5 py-3 bg-rose-50 hover:bg-rose-100 disabled:opacity-40 text-rose-700 font-bold text-xs rounded-xl border border-rose-200 transition-colors flex items-center gap-1.5"
          >
            <Square className="w-3.5 h-3.5 fill-rose-700" />
            <span>Clear Route</span>
          </button>
        </div>
      </div>

      {/* AISLE INVENTORY DRAWER */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center space-x-2.5">
              <div className="p-2 bg-amber-50 text-amber-600 rounded-xl border border-amber-200">
                <Layers className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[10px] font-extrabold text-amber-800 uppercase tracking-widest block">
                  Location Information
                </span>
                <h3 className="font-extrabold text-slate-900 text-base">
                  Aisle <span className="font-mono text-amber-600">{selectedAisle.id}</span> — {selectedAisle.category}
                </h3>
              </div>
            </div>

            <span className="bg-amber-100 text-amber-900 font-bold text-xs px-3 py-1 rounded-full border border-amber-300 flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-amber-700" />
              Selected
            </span>
          </div>

          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-0.5">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                Grid Location
              </span>
              <span className="font-bold text-slate-800 font-mono text-sm">
                Row {selectedAisle.row} • Col {selectedAisle.col}
              </span>
            </div>

            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-0.5">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                Items Available
              </span>
              <span className="font-bold text-slate-800 font-mono text-sm">
                {aisleProducts.length} Catalog SKUs
              </span>
            </div>
          </div>

          <div className="p-3.5 bg-amber-50/70 border border-amber-200/80 rounded-xl flex items-start space-x-2.5 text-xs text-amber-900">
            <Info className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <p className="text-slate-700 font-medium">{selectedAisle.description}</p>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-3">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center space-x-2">
              <Package className="w-4 h-4 text-sky-600" />
              <h4 className="font-extrabold text-slate-900 text-sm">
                Products Stocked in Aisle {selectedAisle.id} ({aisleProducts.length})
              </h4>
            </div>
            <span className="text-[10px] font-mono text-slate-400 uppercase">
              Click product to pin location
            </span>
          </div>

          {aisleProducts.length === 0 ? (
            <p className="text-xs text-slate-400 italic py-4 text-center">
              No products mapped to Aisle {selectedAisle.id} in current catalog demo.
            </p>
          ) : (
            <div className="space-y-2 max-h-56 overflow-y-auto pr-1 text-xs">
              {aisleProducts.map((prod) => {
                const isSelected = selectedProduct?.id === prod.id;

                return (
                  <div
                    key={prod.id}
                    onClick={() => onProductSelect?.(prod)}
                    className={`p-3 rounded-xl border transition-all cursor-pointer flex items-center justify-between ${
                      isSelected
                        ? "bg-purple-50 border-purple-400 font-bold shadow-2xs"
                        : "bg-slate-50 border-slate-200 hover:border-sky-300 hover:bg-white"
                    }`}
                  >
                    <div>
                      <p className="font-extrabold text-slate-900">{prod.name}</p>
                      <div className="flex items-center gap-2 text-[11px] text-slate-500 mt-0.5">
                        <span className="text-amber-600 font-bold">
                          {formatCurrency(prod.price)}
                        </span>
                        <span>•</span>
                        <span>Stock: {prod.stock || 20}</span>
                      </div>
                    </div>

                    <span className="bg-purple-100 text-purple-900 font-bold text-[10px] px-2.5 py-1 rounded-lg border border-purple-300 font-mono flex items-center gap-1">
                      <Sparkles className="w-3 h-3 text-purple-600" />
                      {prod.location?.shelfId || "S1"}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SupermarketMap;
