"use client";

import React, { useState } from "react";
import {
  Layers,
  Footprints,
  Tag,
  Grid,
} from "lucide-react";
import {
  storeMapConfig,
  detailedSupermarketZones,
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
  const [showShelves, setShowShelves] = useState<boolean>(true);

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
              2D Realistic Supermarket Floor Plan
            </h3>
            <p className="text-xs text-slate-500 font-medium">
              Zone Mapping: Fruits & Veg, Grocery, Snacks, Beverages, Dairy, Personal Care, Household, Frozen Food, Bakery, Food & Checkout
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
            <Tag className="w-3.5 h-3.5 inline mr-1" />
            {showZones ? "✓ Supermarket Zones" : "Show Zones"}
          </button>
          <button
            onClick={() => setShowShelves(!showShelves)}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all border ${
              showShelves
                ? "bg-amber-50 border-amber-200 text-amber-700 shadow-2xs"
                : "bg-slate-50 border-slate-200 text-slate-500 hover:bg-slate-100"
            }`}
          >
            <Grid className="w-3.5 h-3.5 inline mr-1" />
            {showShelves ? "✓ Shelf Racks" : "Show Racks"}
          </button>
          <button
            onClick={() => setShowCorridors(!showCorridors)}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all border ${
              showCorridors
                ? "bg-emerald-50 border-emerald-200 text-emerald-700 shadow-2xs"
                : "bg-slate-50 border-slate-200 text-slate-500 hover:bg-slate-100"
            }`}
          >
            <Footprints className="w-3.5 h-3.5 inline mr-1" />
            {showCorridors ? "✓ Walkable Paths" : "Show Paths"}
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

          {/* 3. DETAILED SUPERMARKET ZONES */}
          {showZones && (
            <g id="detailed-zones">
              {detailedSupermarketZones.map((zone) => (
                <g key={zone.id}>
                  <rect
                    x={zone.x}
                    y={zone.y}
                    width={zone.width}
                    height={zone.height}
                    fill={zone.color}
                    fillOpacity={0.07}
                    stroke={zone.borderColor}
                    strokeWidth={1.5}
                    strokeDasharray="4,4"
                    rx={12}
                  />
                  {/* Zone Header Label Badge */}
                  <rect
                    x={zone.x + 6}
                    y={zone.y + 6}
                    width={Math.min(zone.width - 12, 140)}
                    height={18}
                    fill={zone.badgeBg}
                    fillOpacity={0.88}
                    rx={5}
                  />
                  <text
                    x={zone.x + 12}
                    y={zone.y + 18}
                    fill={zone.badgeText}
                    fontSize="8.5"
                    fontWeight="800"
                    fontFamily="sans-serif"
                    letterSpacing="0.3"
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

          {/* 5. AISLES & INNER SHELF RACKS */}
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
                    fillOpacity={isSelected ? 0.4 : 0.9}
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
                    opacity="0.3"
                    rx={6}
                  />

                  {/* Detailed Internal Shelf Racks */}
                  {showShelves &&
                    aisle.shelves?.map((shelf) => (
                      <g key={shelf.id}>
                        <rect
                          x={shelf.x}
                          y={shelf.y}
                          width={shelf.width}
                          height={shelf.height}
                          fill={isSelected ? "#38bdf8" : "#334155"}
                          fillOpacity={0.6}
                          stroke={isSelected ? "#bae6fd" : "#64748b"}
                          strokeWidth={0.8}
                          rx={3}
                        />
                      </g>
                    ))}

                  {/* Aisle ID Badge Pill */}
                  <rect
                    x={aisle.x + 8}
                    y={aisle.y + 8}
                    width={34}
                    height={20}
                    fill={isSelected ? "#38bdf8" : "#0f172a"}
                    rx={5}
                  />
                  <text
                    x={aisle.x + 25}
                    y={aisle.y + 22}
                    fill="#ffffff"
                    fontSize="10"
                    fontWeight="900"
                    textAnchor="middle"
                    fontFamily="sans-serif"
                  >
                    {aisle.label}
                  </text>

                  {/* Category Name Label */}
                  <text
                    x={aisle.x + 48}
                    y={aisle.y + 21}
                    fill={isSelected ? "#e0f2fe" : "#cbd5e1"}
                    fontSize="9"
                    fontWeight="700"
                    fontFamily="sans-serif"
                  >
                    {aisle.category}
                  </text>

                  {/* Shelf Count & Orientation Indicator */}
                  <text
                    x={aisle.x + 12}
                    y={aisle.y + aisle.height - 10}
                    fill="#94a3b8"
                    fontSize="8"
                    fontWeight="600"
                    fontFamily="sans-serif"
                  >
                    {aisle.shelfCount} Racks ({aisle.orientation})
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
              width={345}
              height={60}
              fill="#1e1b4b"
              fillOpacity={0.7}
              stroke="#6366f1"
              strokeWidth={1.5}
              rx={10}
            />
            <text
              x={657}
              y={520}
              fill="#a5b4fc"
              fontSize="9"
              fontWeight="800"
              textAnchor="middle"
              fontFamily="sans-serif"
            >
              EXPRESS CHECKOUT COUNTERS
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
                    {isEntry ? "🛒 ENTRANCE & DOCK" : "🚪 EXIT GATEWAY"}
                  </text>
                </g>
              );
            })}
          </g>
        </svg>
      </div>

      {/* ACTIVE AISLE & ZONE DETAILS PANEL */}
      <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-sky-600 text-white font-extrabold text-sm rounded-xl flex items-center justify-center shadow-xs">
            {selectedAisleData.label}
          </div>
          <div>
            <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <span>{selectedAisleData.name}</span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-sky-100 text-sky-700 font-extrabold uppercase">
                {selectedAisleData.zoneId}
              </span>
            </h4>
            <p className="text-xs text-slate-500">
              {selectedAisleData.description}
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2 text-xs font-semibold text-slate-600 bg-white border border-slate-200 px-3 py-1.5 rounded-xl">
          <Footprints className="w-4 h-4 text-emerald-600" />
          <span>Orientation: {selectedAisleData.orientation.toUpperCase()}</span>
        </div>
      </div>
    </div>
  );
};

export default DigitalSupermarketMap;
