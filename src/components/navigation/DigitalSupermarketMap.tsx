"use client";

import React, { useState, useRef, useEffect } from "react";
import {
  Layers,
  Footprints,
  Tag,
  Grid,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  X,
  Package,
  User,
  Radio,
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
  SupermarketZone,
} from "./storeMapData";
import { Product, PersonPosition, MovementHistoryPoint } from "@/types";

export interface MapPosition {
  x: number;
  y: number;
  label: string;
}

export interface MapState {
  currentMapPosition: MapPosition;
  selectedProduct: Product | null;
  selectedAisle: AisleData | null;
  selectedZone: SupermarketZone | null;
  mapZoom: number;
  mapOffset: { x: number; y: number };
}

export interface DigitalSupermarketMapProps {
  initialSelectedAisleId?: string;
  selectedProduct?: Product | null;
  userPosition?: MapPosition;
  personPosition?: PersonPosition;
  onAisleSelect?: (aisle: AisleData) => void;
  onProductSelect?: (product: Product | null) => void;
  onZoneSelect?: (zone: SupermarketZone | null) => void;
}

// Mock waypoint trajectory to test real-time positioning stream
const mockWaypoints: PersonPosition[] = [
  { x: 120, y: 525, zoneId: "ZONE_CHECKOUT", aisleId: "Entrance Concourse", timestamp: "12:00:00 PM" },
  { x: 130, y: 395, zoneId: "ZONE_DAIRY", aisleId: "Aisle C1 - Dairy", timestamp: "12:00:15 PM" },
  { x: 320, y: 245, zoneId: "ZONE_PREPARED_FOOD", aisleId: "Aisle B2 - Food", timestamp: "12:00:30 PM" },
  { x: 510, y: 95, zoneId: "ZONE_SNACKS", aisleId: "Aisle A3 - Biscuits", timestamp: "12:00:45 PM" },
  { x: 710, y: 95, zoneId: "ZONE_BEVERAGES", aisleId: "Aisle A4 - Beverages", timestamp: "12:01:00 PM" },
];

export const DigitalSupermarketMap: React.FC<DigitalSupermarketMapProps> = ({
  initialSelectedAisleId = "A3",
  selectedProduct: propSelectedProduct = null,
  personPosition: externalPersonPosition,
  onAisleSelect,
  onProductSelect,
  onZoneSelect,
}) => {
  // Map State Architecture (Supports dynamic ESP32-CAM / backend position updates)
  const [mapZoom, setMapZoom] = useState<number>(1.0);
  const [mapOffset, setMapOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [selectedAisleId, setSelectedAisleId] = useState<string>(initialSelectedAisleId);
  const [selectedZoneId, setSelectedZoneId] = useState<string | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(propSelectedProduct);
  const [showCorridors, setShowCorridors] = useState<boolean>(true);
  const [showZones, setShowZones] = useState<boolean>(true);
  const [showShelves, setShowShelves] = useState<boolean>(true);
  const [showTrail, setShowTrail] = useState<boolean>(true);

  // Real-Time Person Positioning Layer State
  const [currentPersonPosition, setCurrentPersonPosition] = useState<PersonPosition>(
    externalPersonPosition || mockWaypoints[0]!
  );
  const [movementHistory, setMovementHistory] = useState<MovementHistoryPoint[]>([
    { x: 120, y: 525, timestamp: "12:00:00 PM" },
  ]);
  const [isSimulatingStream, setIsSimulatingStream] = useState<boolean>(false);
  const waypointIndexRef = useRef<number>(0);

  // Synchronize external backend/ESP32 position updates automatically when sent
  useEffect(() => {
    if (externalPersonPosition) {
      setCurrentPersonPosition(externalPersonPosition);
      setMovementHistory((prev) => [
        ...prev.slice(-15),
        { x: externalPersonPosition.x, y: externalPersonPosition.y, timestamp: externalPersonPosition.timestamp },
      ]);
    }
  }, [externalPersonPosition]);

  // Simulate Real-Time ESP32-CAM Coordinate Stream
  useEffect(() => {
    if (!isSimulatingStream) return;

    const interval = setInterval(() => {
      waypointIndexRef.current = (waypointIndexRef.current + 1) % mockWaypoints.length;
      const nextPos = {
        ...mockWaypoints[waypointIndexRef.current]!,
        timestamp: new Date().toLocaleTimeString(),
      };
      setCurrentPersonPosition(nextPos);
      setMovementHistory((prev) => [
        ...prev.slice(-12),
        { x: nextPos.x, y: nextPos.y, timestamp: nextPos.timestamp },
      ]);
    }, 3000);

    return () => clearInterval(interval);
  }, [isSimulatingStream]);

  // Pan / Dragging Ref State
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const dragStartRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });

  const activeAisle =
    selectedProduct?.aisleId ||
    selectedProduct?.location?.aisleId ||
    selectedAisleId;



  // Zoom Controls
  const handleZoomIn = () => setMapZoom((prev) => Math.min(prev + 0.25, 3.0));
  const handleZoomOut = () => setMapZoom((prev) => Math.max(prev - 0.25, 0.75));
  const handleResetView = () => {
    setMapZoom(1.0);
    setMapOffset({ x: 0, y: 0 });
    setSelectedZoneId(null);
  };

  // Drag Pan Events
  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    dragStartRef.current = { x: e.clientX - mapOffset.x, y: e.clientY - mapOffset.y };
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    setMapOffset({
      x: e.clientX - dragStartRef.current.x,
      y: e.clientY - dragStartRef.current.y,
    });
  };

  const handleMouseUp = () => setIsDragging(false);

  // Click Triggers
  const handleAisleClick = (aisle: AisleData, e?: React.MouseEvent) => {
    e?.stopPropagation();
    setSelectedAisleId(aisle.id);
    setSelectedProduct(null);
    onAisleSelect?.(aisle);
    onProductSelect?.(null);
  };

  const handleZoneClick = (zone: SupermarketZone, e?: React.MouseEvent) => {
    e?.stopPropagation();
    setSelectedZoneId(zone.id === selectedZoneId ? null : zone.id);
    onZoneSelect?.(zone.id === selectedZoneId ? null : zone);
  };

  const handleProductClick = (p: Product, e?: React.MouseEvent) => {
    e?.stopPropagation();
    setSelectedProduct(p);
    if (p.location?.aisleId || p.aisleId) {
      setSelectedAisleId(p.location?.aisleId || p.aisleId || "A3");
    }
    onProductSelect?.(p);
  };

  const { viewWidth, viewHeight, boundaries } = storeMapConfig;

  return (
    <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-6">
      {/* HEADER BAR & MAP CONTROLS */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-100">
        <div className="flex items-center space-x-3">
          <div className="p-3 bg-sky-50 text-sky-600 rounded-2xl border border-sky-100">
            <Layers className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-base font-extrabold text-slate-900 tracking-tight">
              Interactive 2D Supermarket Person Positioning Map
            </h3>
            <p className="text-xs text-slate-500 font-medium">
              Real-Time Person Marker (👤) • Smooth Motion Animation • Movement History Trail
            </p>
          </div>
        </div>

        {/* MAP TOOLBAR & CONTROLS */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Real-Time Stream Simulator Toggle */}
          <button
            onClick={() => setIsSimulatingStream(!isSimulatingStream)}
            className={`px-3 py-1.5 rounded-xl text-xs font-extrabold transition-all border flex items-center gap-1.5 shadow-2xs ${
              isSimulatingStream
                ? "bg-emerald-600 border-emerald-700 text-white animate-pulse"
                : "bg-emerald-50 border-emerald-200 text-emerald-800 hover:bg-emerald-100"
            }`}
          >
            <Radio className="w-3.5 h-3.5" />
            <span>{isSimulatingStream ? "📡 Live Stream Active" : "Simulate Stream"}</span>
          </button>

          {/* Zoom & Reset Toolbar */}
          <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200">
            <button
              onClick={handleZoomIn}
              title="Zoom In"
              className="p-1.5 hover:bg-white text-slate-700 rounded-lg transition-colors font-bold text-xs flex items-center gap-1"
            >
              <ZoomIn className="w-4 h-4 text-sky-600" />
            </button>
            <span className="text-[11px] font-mono font-extrabold px-2 text-slate-600">
              {Math.round(mapZoom * 100)}%
            </span>
            <button
              onClick={handleZoomOut}
              title="Zoom Out"
              className="p-1.5 hover:bg-white text-slate-700 rounded-lg transition-colors font-bold text-xs"
            >
              <ZoomOut className="w-4 h-4 text-sky-600" />
            </button>
            <div className="h-4 w-px bg-slate-300 mx-1" />
            <button
              onClick={handleResetView}
              title="Reset View"
              className="px-2 py-1 hover:bg-white text-slate-700 rounded-lg transition-colors font-bold text-[11px] flex items-center gap-1"
            >
              <RotateCcw className="w-3.5 h-3.5 text-slate-500" />
              <span>Reset</span>
            </button>
          </div>

          {/* Layer Visibility Toggles */}
          <button
            onClick={() => setShowZones(!showZones)}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all border ${
              showZones
                ? "bg-sky-50 border-sky-200 text-sky-700 shadow-2xs"
                : "bg-slate-50 border-slate-200 text-slate-500 hover:bg-slate-100"
            }`}
          >
            <Tag className="w-3.5 h-3.5 inline mr-1" />
            {showZones ? "✓ Zones" : "Show Zones"}
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
            {showShelves ? "✓ Racks" : "Show Racks"}
          </button>
          <button
            onClick={() => setShowCorridors(!showCorridors)}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all border ${
              showCorridors
                ? "bg-indigo-50 border-indigo-200 text-indigo-700 shadow-2xs"
                : "bg-slate-50 border-slate-200 text-slate-500 hover:bg-slate-100"
            }`}
          >
            <Footprints className="w-3.5 h-3.5 inline mr-1" />
            {showCorridors ? "✓ Corridors" : "Show Corridors"}
          </button>
          <button
            onClick={() => setShowTrail(!showTrail)}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all border ${
              showTrail
                ? "bg-purple-50 border-purple-200 text-purple-700 shadow-2xs"
                : "bg-slate-50 border-slate-200 text-slate-500 hover:bg-slate-100"
            }`}
          >
            <Footprints className="w-3.5 h-3.5 inline mr-1" />
            {showTrail ? "✓ Trail" : "Show Trail"}
          </button>
        </div>
      </div>

      {/* SVG INTERACTIVE DIGITAL SUPERMARKET CANVAS */}
      <div
        className={`relative bg-slate-950 rounded-2xl overflow-hidden shadow-inner border border-slate-800 cursor-${
          isDragging ? "grabbing" : "grab"
        }`}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        <svg
          viewBox={`0 0 ${viewWidth} ${viewHeight}`}
          className="w-full h-auto select-none transition-transform duration-75"
          style={{ maxHeight: "580px" }}
        >
          <g
            transform={`translate(${mapOffset.x}, ${mapOffset.y}) scale(${mapZoom})`}
            style={{ transformOrigin: "center center" }}
          >
            <defs>
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
                {detailedSupermarketZones.map((zone) => {
                  const isZoneSelected = zone.id === selectedZoneId;
                  return (
                    <g
                      key={zone.id}
                      onClick={(e) => handleZoneClick(zone, e)}
                      className="cursor-pointer"
                    >
                      <rect
                        x={zone.x}
                        y={zone.y}
                        width={zone.width}
                        height={zone.height}
                        fill={zone.color}
                        fillOpacity={isZoneSelected ? 0.22 : 0.07}
                        stroke={isZoneSelected ? "#38bdf8" : zone.borderColor}
                        strokeWidth={isZoneSelected ? 2.5 : 1.5}
                        strokeDasharray={isZoneSelected ? "none" : "4,4"}
                        rx={12}
                      />
                      <rect
                        x={zone.x + 6}
                        y={zone.y + 6}
                        width={Math.min(zone.width - 12, 140)}
                        height={18}
                        fill={isZoneSelected ? "#0284c7" : zone.badgeBg}
                        fillOpacity={0.9}
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
                  );
                })}
              </g>
            )}

            {/* 4. SUPERMARKET BOUNDARIES & WALLS */}
            <g id="store-boundaries">
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
                    onClick={(e) => handleAisleClick(aisle, e)}
                    className="cursor-pointer transition-transform duration-200 hover:scale-[1.01]"
                  >
                    <rect
                      x={aisle.x}
                      y={aisle.y}
                      width={aisle.width}
                      height={aisle.height}
                      fill={isSelected ? "#0284c7" : "#1e293b"}
                      fillOpacity={isSelected ? 0.45 : 0.9}
                      stroke={isSelected ? "#38bdf8" : "#475569"}
                      strokeWidth={isSelected ? 2.8 : 1.2}
                      rx={10}
                    />

                    <rect
                      x={aisle.x + 6}
                      y={aisle.y + 6}
                      width={aisle.width - 12}
                      height={aisle.height - 12}
                      fill="url(#shelfPattern)"
                      opacity="0.3"
                      rx={6}
                    />

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
                const posX = p.mapX || p.location?.x || 100;
                const posY = p.mapY || p.location?.y || 100;
                const isSelectedProd =
                  selectedProduct &&
                  (selectedProduct.id === p.id || selectedProduct.productId === p.id);

                return (
                  <g
                    key={p.id}
                    onClick={(e) => handleProductClick(p, e)}
                    className="cursor-pointer"
                  >
                    {isSelectedProd && (
                      <>
                        <circle
                          cx={posX}
                          cy={posY}
                          r={16}
                          fill="#f59e0b"
                          fillOpacity={0.25}
                          className="animate-ping"
                        />
                        <circle
                          cx={posX}
                          cy={posY}
                          r={12}
                          fill="none"
                          stroke="#f59e0b"
                          strokeWidth={2}
                        />
                      </>
                    )}
                    <circle
                      cx={posX}
                      cy={posY}
                      r={isSelectedProd ? 7 : 5}
                      fill={isSelectedProd ? "#f59e0b" : "#64748b"}
                      stroke="#ffffff"
                      strokeWidth={1.5}
                    />
                  </g>
                );
              })}
            </g>

            {/* 7. CHECKOUT COUNTERS & LANES */}
            <g id="checkout-area">
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

            {/* 9. MOVEMENT HISTORY TRAIL LAYER */}
            {showTrail && movementHistory.length > 1 && (
              <g id="movement-history-trail">
                <polyline
                  points={movementHistory.map((p) => `${p.x},${p.y}`).join(" ")}
                  fill="none"
                  stroke="#10b981"
                  strokeWidth="2.5"
                  strokeDasharray="4,4"
                  strokeLinecap="round"
                  opacity="0.65"
                />
                {movementHistory.map((pt, idx) => (
                  <circle
                    key={idx}
                    cx={pt.x}
                    cy={pt.y}
                    r={3}
                    fill="#10b981"
                    opacity={0.4 + (idx / movementHistory.length) * 0.5}
                  />
                ))}
              </g>
            )}

            {/* 10. REAL-TIME PERSON POSITIONING MARKER (👤) */}
            <g
              id="person-position-marker"
              className="transition-all duration-700 ease-in-out cursor-pointer"
            >
              {/* Pulsating outer sonar ring */}
              <circle
                cx={currentPersonPosition.x}
                cy={currentPersonPosition.y}
                r={18}
                fill="#10b981"
                fillOpacity={0.25}
                className="animate-ping"
              />
              <circle
                cx={currentPersonPosition.x}
                cy={currentPersonPosition.y}
                r={10}
                fill="#10b981"
                stroke="#ffffff"
                strokeWidth={2}
              />
              {/* Human icon badge */}
              <g transform={`translate(${currentPersonPosition.x - 5}, ${currentPersonPosition.y - 5})`}>
                <User className="w-2.5 h-2.5 text-white" />
              </g>

              {/* Dynamic Label Badge */}
              <rect
                x={currentPersonPosition.x - 60}
                y={currentPersonPosition.y - 32}
                width={120}
                height={20}
                fill="#064e3b"
                stroke="#10b981"
                strokeWidth={1}
                rx={5}
              />
              <text
                x={currentPersonPosition.x}
                y={currentPersonPosition.y - 19}
                fill="#ffffff"
                fontSize="8.5"
                fontWeight="900"
                textAnchor="middle"
                fontFamily="sans-serif"
              >
                👤 PERSON ({currentPersonPosition.aisleId})
              </text>
            </g>
          </g>
        </svg>
      </div>

      {/* LIVE PERSON POSITIONING TELEMETRY PANEL */}
      <div className="bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200 rounded-2xl p-4 flex flex-wrap items-center justify-between gap-4 shadow-2xs">
        <div className="flex items-center space-x-3.5">
          <div className="p-2.5 bg-emerald-600 text-white rounded-2xl shadow-xs">
            <User className="w-6 h-6" />
          </div>
          <div>
            <h4 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
              <span>👤 Current Location</span>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-100 text-emerald-800 animate-pulse">
                LIVE POSITION
              </span>
            </h4>
            <p className="text-xs text-slate-600 mt-0.5">
              Zone: <strong className="text-emerald-900">{currentPersonPosition.zoneId}</strong> • Aisle: <strong className="text-emerald-900">{currentPersonPosition.aisleId}</strong>
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3 text-xs bg-white border border-emerald-200 px-4 py-2 rounded-xl">
          <div className="text-slate-600">
            Coordinates: <strong className="text-emerald-700 font-mono font-extrabold">({currentPersonPosition.x}, {currentPersonPosition.y})</strong>
          </div>
          <div className="h-4 w-px bg-slate-200" />
          <div className="text-slate-600">
            Last Updated: <strong className="text-slate-800 font-mono">{currentPersonPosition.timestamp}</strong>
          </div>
        </div>
      </div>

      {/* SELECTED PRODUCT INFORMATION MODAL / CARD */}
      {selectedProduct && (
        <div className="bg-gradient-to-r from-sky-50 to-indigo-50 border border-sky-200 rounded-2xl p-5 shadow-sm space-y-3 relative">
          <button
            onClick={() => {
              setSelectedProduct(null);
              onProductSelect?.(null);
            }}
            className="absolute top-4 right-4 text-slate-400 hover:text-slate-700 p-1 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex flex-wrap items-center justify-between gap-4 pr-8">
            <div className="flex items-center space-x-3.5">
              <div className="p-3 bg-sky-600 text-white rounded-2xl shadow-xs">
                <Package className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="text-base font-extrabold text-slate-900">
                    {selectedProduct.name || selectedProduct.productName}
                  </h4>
                  <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800">
                    {selectedProduct.availability || "In Stock"} ({selectedProduct.stock ?? 30} units)
                  </span>
                </div>
                <p className="text-xs text-slate-600 mt-0.5">
                  Category: <strong className="text-slate-800">{selectedProduct.category}</strong> • Price: <strong className="text-slate-800">₹{selectedProduct.price.toFixed(2)}</strong>
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3 text-xs bg-white border border-sky-200 px-4 py-2.5 rounded-xl shadow-2xs">
              <div className="text-slate-600">
                Aisle: <strong className="text-sky-700 font-extrabold">{selectedProduct.aisleId || selectedProduct.location?.aisleId || "A3"}</strong>
              </div>
              <div className="h-4 w-px bg-slate-200" />
              <div className="text-slate-600">
                Shelf: <strong className="text-sky-700 font-extrabold">{selectedProduct.shelfId || selectedProduct.location?.shelfId || "S02"}</strong>
              </div>
              <div className="h-4 w-px bg-slate-200" />
              <div className="text-slate-600">
                Map Position: <strong className="text-emerald-700 font-mono font-extrabold">({selectedProduct.mapX || selectedProduct.location?.x || 510}, {selectedProduct.mapY || selectedProduct.location?.y || 95})</strong>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DigitalSupermarketMap;
