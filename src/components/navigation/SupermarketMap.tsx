"use client";

import React, { useState } from "react";
import {
  MapPin,
  Layers,
  Info,
  Footprints,
  CheckCircle2,
} from "lucide-react";
import {
  storeAisles,
  storeZones,
  storeMapConfig,
  AisleData,
} from "./storeMapData";

export interface SupermarketMapProps {
  initialSelectedAisleId?: string;
  onAisleSelect?: (aisle: AisleData) => void;
}

export const SupermarketMap: React.FC<SupermarketMapProps> = ({
  initialSelectedAisleId = "A3",
  onAisleSelect,
}) => {
  const [selectedAisleId, setSelectedAisleId] = useState<string>(
    initialSelectedAisleId
  );

  const selectedAisle =
    storeAisles.find((a) => a.id === selectedAisleId) || storeAisles[0]!;

  const handleAisleClick = (aisle: AisleData) => {
    setSelectedAisleId(aisle.id);
    onAisleSelect?.(aisle);
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* MAP HEADER & QUICK LEGEND BAR */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 bg-sky-50 text-sky-600 rounded-xl border border-sky-100">
            <MapPin className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-lg font-extrabold text-slate-900 tracking-tight">
              Indoor Supermarket Floor Plan
            </h2>
            <p className="text-xs text-slate-500">
              Interactive 12-aisle spatial map for smart trolley navigation
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
          <div className="flex items-center gap-1.5 text-slate-500">
            <Footprints className="w-3.5 h-3.5 text-slate-400" />
            <span>Walking Corridor</span>
          </div>
        </div>
      </div>

      {/* SVG INTERACTIVE SUPERMARKET FLOOR CANVAS */}
      <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 sm:p-6 shadow-2xl relative overflow-hidden select-none">
        {/* Subtle Background Grid Lines */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] bg-[size:30px_30px] opacity-20 pointer-events-none" />

        <svg
          viewBox={`0 0 ${storeMapConfig.viewWidth} ${storeMapConfig.viewHeight}`}
          preserveAspectRatio="xMidYMid meet"
          className="w-full h-auto max-h-[520px] drop-shadow-md"
        >
          <defs>
            {/* Pattern for Shelf Texture */}
            <pattern
              id="shelfTexture"
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

            {/* Glowing Gradient for Selected Aisle */}
            <linearGradient id="selectedGlow" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.9" />
              <stop offset="100%" stopColor="#d97706" stopOpacity="0.95" />
            </linearGradient>

            {/* Default Aisle Gradient */}
            <linearGradient id="aisleGradient" x1="0%" y1="0%" x2="100%" y2="100%">
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

          {/* WALKING CORRIDORS & PATH GUIDE LINES */}
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
            const isSelected = selectedAisleId === aisle.id;

            return (
              <g
                key={aisle.id}
                onClick={() => handleAisleClick(aisle)}
                className="cursor-pointer transition-all duration-200 group"
              >
                {/* Outer Aisle Box Container */}
                <rect
                  x={aisle.x}
                  y={aisle.y}
                  width={aisle.width}
                  height={aisle.height}
                  rx="12"
                  fill={isSelected ? "url(#selectedGlow)" : "url(#aisleGradient)"}
                  stroke={isSelected ? "#fbbf24" : "#334155"}
                  strokeWidth={isSelected ? "3" : "1.5"}
                  className="group-hover:stroke-sky-400 transition-colors"
                />

                {/* Inner Shelf Texture Visual */}
                <rect
                  x={aisle.x + 8}
                  y={aisle.y + 28}
                  width={aisle.width - 16}
                  height={aisle.height - 36}
                  rx="6"
                  fill="url(#shelfTexture)"
                  opacity={isSelected ? "0.3" : "0.5"}
                />

                {/* Aisle Badge Label Container */}
                <rect
                  x={aisle.x + 10}
                  y={aisle.y + 8}
                  width="42"
                  height="22"
                  rx="6"
                  fill={isSelected ? "#78350f" : "#0284c7"}
                />

                {/* Aisle ID Text (A1, A2, etc.) */}
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

                {/* Category Name Summary Text */}
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

                {/* Interactive Selection Ring */}
                {isSelected && (
                  <circle
                    cx={aisle.x + aisle.width - 16}
                    cy={aisle.y + 18}
                    r="6"
                    fill="#15803d"
                  />
                )}
              </g>
            );
          })}

          {/* RENDER ENTRANCE ZONE (Bottom-Left) */}
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
                <text
                  x={zone.x + 30}
                  y={zone.y + 32}
                  textAnchor="middle"
                  fill="#ffffff"
                  fontSize="12"
                >
                  🛒
                </text>
                <text
                  x={zone.x + 52}
                  y={zone.y + 26}
                  fill="#f0f9ff"
                  fontSize="12"
                  fontWeight="900"
                  letterSpacing="1"
                >
                  ENTRANCE
                </text>
                <text
                  x={zone.x + 52}
                  y={zone.y + 40}
                  fill="#7dd3fc"
                  fontSize="9"
                  fontWeight="bold"
                >
                  Trolley Pickup Dock
                </text>
              </g>
            ))}

          {/* RENDER CHECKOUT ZONE (Bottom-Right) */}
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
                <text
                  x={zone.x + 30}
                  y={zone.y + 32}
                  textAnchor="middle"
                  fill="#ffffff"
                  fontSize="12"
                >
                  💳
                </text>
                <text
                  x={zone.x + 52}
                  y={zone.y + 26}
                  fill="#ecfdf5"
                  fontSize="12"
                  fontWeight="900"
                  letterSpacing="1"
                >
                  CHECKOUT
                </text>
                <text
                  x={zone.x + 52}
                  y={zone.y + 40}
                  fill="#6ee7b7"
                  fontSize="9"
                  fontWeight="bold"
                >
                  Express Self-Pay
                </text>
              </g>
            ))}
        </svg>
      </div>

      {/* SELECTED AISLE INFORMATION PANEL */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 bg-amber-50 text-amber-600 rounded-xl border border-amber-200">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] font-extrabold text-amber-800 uppercase tracking-widest block">
                Selected Location Information
              </span>
              <h3 className="font-extrabold text-slate-900 text-base">
                Aisle: <span className="font-mono text-amber-600">{selectedAisle.id}</span> — {selectedAisle.category}
              </h3>
            </div>
          </div>

          <span className="bg-amber-100 text-amber-900 font-bold text-xs px-3 py-1 rounded-full border border-amber-300 flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-amber-700" />
            Status: Selected
          </span>
        </div>

        {/* Selected Aisle Details Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
          <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-0.5">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
              Grid Position & Row
            </span>
            <span className="font-bold text-slate-800 font-mono text-sm">
              Row {selectedAisle.row} • Column {selectedAisle.col}
            </span>
          </div>

          <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-0.5">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
              Shelves Capacity
            </span>
            <span className="font-bold text-slate-800 font-mono text-sm">
              {selectedAisle.shelfCount} Multi-Tier Shelves
            </span>
          </div>

          <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-0.5">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
              Walking Distance from Entrance
            </span>
            <span className="font-bold text-sky-700 font-mono text-sm">
              ~{selectedAisle.col * 4.5 + (selectedAisle.row === "A" ? 15 : selectedAisle.row === "B" ? 10 : 5)} meters
            </span>
          </div>
        </div>

        {/* Category Description & Featured Inventory Preview */}
        <div className="p-3.5 bg-amber-50/70 border border-amber-200/80 rounded-xl flex items-start space-x-2.5 text-xs text-amber-900">
          <Info className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
          <div>
            <span className="font-extrabold uppercase tracking-wider block text-[11px] text-amber-950">
              Aisle Inventory Description
            </span>
            <p className="mt-0.5 text-slate-700">
              {selectedAisle.description}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SupermarketMap;
