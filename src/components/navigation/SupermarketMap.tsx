"use client";

import React, { useState } from "react";
import {
  MapPin,
  Layers,
  Info,
  CheckCircle2,
  Package,
  Sparkles,
} from "lucide-react";
import {
  storeAisles,
  storeZones,
  storeMapConfig,
  catalogProducts,
  AisleData,
} from "./storeMapData";
import { Product, ProductLocation } from "@/types";
import { formatCurrency } from "@/lib/utils";

export interface SupermarketMapProps {
  initialSelectedAisleId?: string;
  selectedProduct?: Product | null;
  multiSelectedLocations?: ProductLocation[];
  onAisleSelect?: (aisle: AisleData) => void;
  onProductSelect?: (product: Product) => void;
}

export const SupermarketMap: React.FC<SupermarketMapProps> = ({
  initialSelectedAisleId = "A3",
  selectedProduct = null,
  multiSelectedLocations = [],
  onAisleSelect,
  onProductSelect,
}) => {
  const [selectedAisleId, setSelectedAisleId] = useState<string>(
    selectedProduct?.location?.aisleId || initialSelectedAisleId
  );

  const activeAisleId = selectedProduct?.location?.aisleId || selectedAisleId;
  const selectedAisle =
    storeAisles.find((a) => a.id === activeAisleId) || storeAisles[0]!;

  // Products stocked in the currently selected aisle (MAP -> PRODUCT flow)
  const aisleProducts = catalogProducts.filter(
    (p) => p.location?.aisleId === activeAisleId
  );

  const handleAisleClick = (aisle: AisleData) => {
    setSelectedAisleId(aisle.id);
    onAisleSelect?.(aisle);
  };

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
              Indoor Supermarket Floor Plan & Shelf Pin Locator
            </h2>
            <p className="text-xs text-slate-500">
              Phase 2: Product → Aisle → Shelf → Physical SVG Coordinates
            </p>
          </div>
        </div>

        {/* MAP LEGEND */}
        <div className="flex flex-wrap items-center gap-3 text-xs bg-slate-50 border border-slate-200 p-2.5 rounded-xl font-medium">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
            Legend:
          </span>
          <div className="flex items-center gap-1.5 text-slate-700">
            <span className="w-3 h-3 rounded-full bg-sky-500 border border-sky-600" />
            <span>Entrance</span>
          </div>
          <div className="flex items-center gap-1.5 text-slate-700">
            <span className="w-3 h-3 rounded-full bg-emerald-500 border border-emerald-600" />
            <span>Checkout</span>
          </div>
          <div className="flex items-center gap-1.5 text-slate-700">
            <span className="w-3 h-3 rounded-md bg-slate-700 border border-slate-600" />
            <span>Aisle</span>
          </div>
          <div className="flex items-center gap-1.5 text-amber-800 font-bold">
            <span className="w-3 h-3 rounded-md bg-amber-400 border border-amber-500 shadow-2xs" />
            <span>Selected Aisle</span>
          </div>
          <div className="flex items-center gap-1.5 text-purple-700 font-bold">
            <span className="w-3.5 h-3.5 rounded-full bg-purple-500 text-white flex items-center justify-center text-[10px]">
              📍
            </span>
            <span>Shelf Pin Marker</span>
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
              id="shelfTexturePattern"
              width="10"
              height="10"
              patternUnits="userSpaceOnUse"
            >
              <line
                x1="0"
                y1="5"
                x2="10"
                y2="5"
                stroke="#334155"
                strokeWidth="1"
              />
            </pattern>

            <linearGradient id="selectedGlowGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.9" />
              <stop offset="100%" stopColor="#d97706" stopOpacity="0.95" />
            </linearGradient>

            <linearGradient id="aisleGradientFill" x1="0%" y1="0%" x2="100%" y2="100%">
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

          {/* STORE TITLE BANNER ON CANVAS */}
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

          {/* RENDER 12 INTERACTIVE AISLES (A1-A4, B1-B4, C1-C4) */}
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
                  fill={isSelected ? "url(#selectedGlowGradient)" : "url(#aisleGradientFill)"}
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
                  fill="url(#shelfTexturePattern)"
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

          {/* RENDER MULTIPLE PRODUCT PINS (Multi-Product Selection / Cart Items) */}
          {multiSelectedLocations.map((loc, idx) => (
            <g key={`pin-multi-${idx}`}>
              <circle
                cx={loc.x}
                cy={loc.y}
                r="10"
                fill="#38bdf8"
                fillOpacity="0.3"
                className="animate-ping"
              />
              <circle cx={loc.x} cy={loc.y} r="8" fill="#0284c7" stroke="#ffffff" strokeWidth="2" />
              <text
                x={loc.x}
                y={loc.y + 4}
                textAnchor="middle"
                fill="#ffffff"
                fontSize="10"
                fontWeight="900"
              >
                📍
              </text>
            </g>
          ))}

          {/* RENDER ACTIVE SELECTED PRODUCT SHELF PIN (📍) AT EXACT SVG (X, Y) */}
          {selectedProduct && selectedProduct.location && (
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

              {/* Shelf Tag Overlay Label */}
              <rect
                x={selectedProduct.location.x - 30}
                y={selectedProduct.location.y - 32}
                width="60"
                height="18"
                rx="4"
                fill="#581c87"
                stroke="#c084fc"
                strokeWidth="1"
              />
              <text
                x={selectedProduct.location.x}
                y={selectedProduct.location.y - 20}
                textAnchor="middle"
                fill="#f3e8ff"
                fontSize="9"
                fontWeight="900"
                fontFamily="monospace"
              >
                {selectedProduct.location.shelfId}
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

      {/* MAP -> PRODUCT FLOW: AISLE INVENTORY DRAWER */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
        {/* Selected Aisle Information Panel */}
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

        {/* MAP -> PRODUCT DRAWER: Products stocked in clicked Aisle */}
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
