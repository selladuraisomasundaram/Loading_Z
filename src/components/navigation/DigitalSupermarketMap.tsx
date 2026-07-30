"use client";

import React, { useState } from "react";
import {
  Layers,
  Footprints,
} from "lucide-react";
import {
  storeMapConfig,
  majorStoreZones,
  walkableCorridors,
  checkoutLanes,
  entryExitGateways,
  storeAisles,
  catalogProducts,
  AisleData,
} from "./storeMapData";
import { Product } from "@/types";

export interface DigitalSupermarketMapProps {
  selectedAisleId?: string;
  onAisleSelect?: (aisle: AisleData) => void;
  onProductSelect?: (product: Product) => void;
}

export const DigitalSupermarketMap: React.FC<DigitalSupermarketMapProps> = ({
  selectedAisleId = "A3",
  onAisleSelect,
  onProductSelect,
}) => {
  const [activeAisle, setActiveAisle] = useState<string>(selectedAisleId);
  const [showCorridors, setShowCorridors] = useState<boolean>(true);
  const [showZones, setShowZones] = useState<boolean>(true);

  const selectedAisleData =
    storeAisles.find((a) => a.id === activeAisle) || storeAisles[0]!;

  const handleAisleClick = (aisle: AisleData) => {
    setActiveAisle(aisle.id);
    onAisleSelect?.(aisle);
  };

  const { viewWidth, viewHeight, boundaries } = storeMapConfig;

  return (
    <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-6">
      {/* HEADER BAR & MAP TOGGLES */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-100">
        <div className="flex items-center space-x-3">
          <div className="p-3 bg-sky-50 text-sky-600 rounded-2xl border border-sky-100">
            <Layers className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-base font-extrabold text-slate-900 tracking-tight">
              Digital 2D Supermarket Floor Plan
            </h3>
            <p className="text-xs text-slate-500 font-medium">
              Interactive Architectural Map • Boundaries, Corridors, Aisles & Zones
            </p>
          </div>
        </div>

        {/* MAP LAYER CONTROLS */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setShowZones(!showZones)}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all border ${
              showZones
                ? "bg-sky-50 border-sky-200 text-sky-700 shadow-2xs"
                : "bg-slate-50 border-slate-200 text-slate-500 hover:bg-slate-100"
            }`}
          >
            {showZones ? "✓ Major Dept Zones" : "Show Dept Zones"}
          </button>
          <button
            onClick={() => setShowCorridors(!showCorridors)}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all border ${
              showCorridors
                ? "bg-emerald-50 border-emerald-200 text-emerald-700 shadow-2xs"
                : "bg-slate-50 border-slate-200 text-slate-500 hover:bg-slate-100"
            }`}
          >
            {showCorridors ? "✓ Walkable Corridors" : "Show Corridors"}
          </button>
        </div>
      </div>

      {/* SVG DIGITAL SUPERMARKET CANVAS */}
      <div className="relative bg-slate-950 rounded-2xl overflow-hidden shadow-inner border border-slate-800">
        <svg
          viewBox={`0 0 ${viewWidth} ${viewHeight}`}
          className="w-full h-auto select-none"
          style={{ maxHeight: "580px" }}
        >
          <defs>
            {/* WALKABLE CORRIDOR GRID PATTERN */}
            <pattern
              id="corridorPattern"
              width="20"
              height="20"
              patternUnits="userSpaceOnUse"
            >
              <path
                d="M 20 0 L 0 0 0 20"
                fill="none"
                stroke="#1e293b"
                strokeWidth="0.8"
                strokeDasharray="2,2"
              />
            </pattern>
            {/* AISLE SHELF STRIPE PATTERN */}
            <pattern
              id="shelfPattern"
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
          </defs>

          {/* 1. STORE BACKGROUND */}
          <rect width={viewWidth} height={viewHeight} fill="#090d16" />

          {/* 2. WALKABLE CORRIDOR SPACES */}
          {showCorridors && (
            <g id="walkable-spaces" opacity="0.6">
              {walkableCorridors.map((corridor) => (
                <g key={corridor.id}>
                  <rect
                    x={corridor.x}
                    y={corridor.y}
                    width={corridor.width}
                    height={corridor.height}
                    fill="url(#corridorPattern)"
                    rx={6}
                  />
                  <rect
                    x={corridor.x}
                    y={corridor.y}
                    width={corridor.width}
                    height={corridor.height}
                    fill="none"
                    stroke="#334155"
                    strokeWidth="0.8"
                    strokeDasharray="3,3"
                    rx={6}
                  />
                </g>
              ))}
            </g>
          )}

          {/* 3. MAJOR SUPERMARKET ZONES */}
          {showZones && (
            <g id="major-zones">
              {majorStoreZones.map((zone) => (
                <g key={zone.id}>
                  <rect
                    x={zone.x}
                    y={zone.y}
                    width={zone.width}
                    height={zone.height}
                    fill={zone.color}
                    fillOpacity={0.06}
                    stroke={zone.badgeBg}
                    strokeWidth={1.5}
                    strokeDasharray="4,4"
                    rx={12}
                  />
                  <rect
                    x={zone.x + 8}
                    y={zone.y + 8}
                    width={160}
                    height={20}
                    fill={zone.badgeBg}
                    fillOpacity={0.85}
                    rx={6}
                  />
                  <text
                    x={zone.x + 14}
                    y={zone.y + 22}
                    fill="#ffffff"
                    fontSize="9"
                    fontWeight="800"
                    fontFamily="sans-serif"
                    letterSpacing="0.4"
                  >
                    {zone.name.toUpperCase()}
                  </text>
                </g>
              ))}
            </g>
          )}

          {/* 4. SUPERMARKET OUTER BOUNDARIES & WALLS */}
          <g id="store-boundaries">
            {/* Outer Wall Shadow */}
            <rect
              x={boundaries.x - 2}
              y={boundaries.y - 2}
              width={boundaries.width + 4}
              height={boundaries.height + 4}
              fill="none"
              stroke="#0f172a"
              strokeWidth={boundaries.wallThickness + 4}
              rx={20}
            />
            {/* Main Outer Wall */}
            <rect
              x={boundaries.x}
              y={boundaries.y}
              width={boundaries.width}
              height={boundaries.height}
              fill="none"
              stroke="#38bdf8"
              strokeWidth={boundaries.wallThickness}
              strokeOpacity={0.8}
              rx={18}
            />
          </g>

          {/* 5. AISLES & PRODUCT SHELF SECTIONS */}
          <g id="store-aisles">
            {storeAisles.map((aisle) => {
              const isSelected = aisle.id === activeAisle;
              return (
                <g
                  key={aisle.id}
                  onClick={() => handleAisleClick(aisle)}
                  className="cursor-pointer transition-transform duration-200 hover:scale-[1.01]"
                >
                  {/* Aisle Base Background */}
                  <rect
                    x={aisle.x}
                    y={aisle.y}
                    width={aisle.width}
                    height={aisle.height}
                    fill={isSelected ? "#0284c7" : "#1e293b"}
                    fillOpacity={isSelected ? 0.35 : 0.9}
                    stroke={isSelected ? "#38bdf8" : "#475569"}
                    strokeWidth={isSelected ? 2.5 : 1.2}
                    rx={10}
                  />

                  {/* Inner Shelf Texture Pattern */}
                  <rect
                    x={aisle.x + 6}
                    y={aisle.y + 6}
                    width={aisle.width - 12}
                    height={aisle.height - 12}
                    fill="url(#shelfPattern)"
                    opacity="0.4"
                    rx={6}
                  />

                  {/* Aisle ID Badge Pill */}
                  <rect
                    x={aisle.x + 8}
                    y={aisle.y + 8}
                    width={38}
                    height={22}
                    fill={isSelected ? "#38bdf8" : "#0f172a"}
                    rx={6}
                  />
                  <text
                    x={aisle.x + 27}
                    y={aisle.y + 23}
                    fill="#ffffff"
                    fontSize="11"
                    fontWeight="900"
                    textAnchor="middle"
                    fontFamily="sans-serif"
                  >
                    {aisle.label}
                  </text>

                  {/* Category Name Label */}
                  <text
                    x={aisle.x + 52}
                    y={aisle.y + 22}
                    fill={isSelected ? "#e0f2fe" : "#cbd5e1"}
                    fontSize="9.5"
                    fontWeight="700"
                    fontFamily="sans-serif"
                  >
                    {aisle.category}
                  </text>

                  {/* Shelf Count Indicator */}
                  <text
                    x={aisle.x + 12}
                    y={aisle.y + aisle.height - 10}
                    fill="#94a3b8"
                    fontSize="8.5"
                    fontWeight="600"
                    fontFamily="sans-serif"
                  >
                    {aisle.shelfCount} Shelves (S1–S{aisle.shelfCount})
                  </text>
                </g>
              );
            })}
          </g>

          {/* 6. PRODUCT LOCATION PINS */}
          <g id="product-pins">
            {catalogProducts.map((p) => {
              if (!p.location) return null;
              const isSelectedProduct = p.location.aisleId === activeAisle;
              return (
                <g
                  key={p.id}
                  onClick={(e) => {
                    e.stopPropagation();
                    onProductSelect?.(p);
                  }}
                  className="cursor-pointer"
                >
                  <circle
                    cx={p.location.x}
                    cy={p.location.y}
                    r={isSelectedProduct ? 7 : 5}
                    fill={isSelectedProduct ? "#f59e0b" : "#64748b"}
                    stroke="#ffffff"
                    strokeWidth={1.5}
                  />
                </g>
              );
            })}
          </g>

          {/* 7. CHECKOUT COUNTERS & LANES */}
          <g id="checkout-area">
            {/* Checkout Area Backdrop */}
            <rect
              x={485}
              y={505}
              width={195}
              height={60}
              fill="#1e1b4b"
              fillOpacity={0.7}
              stroke="#6366f1"
              strokeWidth={1.5}
              rx={10}
            />
            <text
              x={582}
              y={520}
              fill="#a5b4fc"
              fontSize="9"
              fontWeight="800"
              textAnchor="middle"
              fontFamily="sans-serif"
            >
              EXPRESS CHECKOUT LANES
            </text>

            {checkoutLanes.map((lane) => (
              <g key={lane.id}>
                <rect
                  x={lane.x}
                  y={lane.y + 12}
                  width={lane.width}
                  height={lane.height - 15}
                  fill="#312e81"
                  stroke="#818cf8"
                  strokeWidth={1}
                  rx={4}
                />
                <text
                  x={lane.x + lane.width / 2}
                  y={lane.y + 30}
                  fill="#ffffff"
                  fontSize="7.5"
                  fontWeight="800"
                  textAnchor="middle"
                  fontFamily="sans-serif"
                >
                  {lane.label}
                </text>
              </g>
            ))}
          </g>

          {/* 8. ENTRY & EXIT GATEWAYS */}
          <g id="entry-exit-gateways">
            {entryExitGateways.map((gw) => {
              const isEntry = gw.type === "entry";
              return (
                <g key={gw.id}>
                  <rect
                    x={gw.x}
                    y={gw.y}
                    width={gw.width}
                    height={gw.height}
                    fill={isEntry ? "#064e3b" : "#7f1d1d"}
                    fillOpacity={0.85}
                    stroke={isEntry ? "#10b981" : "#ef4444"}
                    strokeWidth={2}
                    rx={8}
                  />
                  <text
                    x={gw.x + gw.width / 2}
                    y={gw.y + 26}
                    fill="#ffffff"
                    fontSize="11"
                    fontWeight="900"
                    textAnchor="middle"
                    fontFamily="sans-serif"
                    letterSpacing="0.8"
                  >
                    {isEntry ? "🛒 ENTRANCE & TROLLEY DOCK" : "🚪 EXIT GATEWAY"}
                  </text>
                </g>
              );
            })}
          </g>
        </svg>
      </div>

      {/* ACTIVE AISLE DETAILS PANEL */}
      <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-sky-600 text-white font-extrabold text-sm rounded-xl flex items-center justify-center shadow-xs">
            {selectedAisleData.label}
          </div>
          <div>
            <h4 className="text-sm font-bold text-slate-900">
              {selectedAisleData.category}
            </h4>
            <p className="text-xs text-slate-500">
              {selectedAisleData.description}
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2 text-xs font-semibold text-slate-600 bg-white border border-slate-200 px-3 py-1.5 rounded-xl">
          <Footprints className="w-4 h-4 text-emerald-600" />
          <span>Walkable Aisle Corridor Active</span>
        </div>
      </div>
    </div>
  );
};

export default DigitalSupermarketMap;
