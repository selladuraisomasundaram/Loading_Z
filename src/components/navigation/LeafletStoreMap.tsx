"use client";

import React, { useEffect, useState } from "react";
import {
  MapContainer,
  Rectangle,
  Marker,
  Popup,
  Tooltip,
  Polyline,
} from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

import {
  MAP_BOUNDS,
  STORE_ZONES,
  STORE_AISLES,
  AISLE_UNKNOWN,
  STORE_ENTRANCE,
  STORE_CHECKOUT,
} from "@/lib/navigation/leafletMapData";

interface LeafletStoreMapProps {
  selectedProduct?: any;
  userLocation?: [number, number];
  routeWaypoints?: [number, number][];
  stops?: any[];
}

const createIcon = (emoji: string, bgColor: string) =>
  L.divIcon({
    className: "custom-leaflet-icon",
    html: `<div style="background:${bgColor}; border: 2px solid white; border-radius: 50%; width: 32px; height: 32px; display: flex; align-items: center; justify-content: center; font-size: 18px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">${emoji}</div>`,
    iconSize: [32, 32],
    iconAnchor: [16, 32],
    popupAnchor: [0, -32],
  });

const icons = {
  user: createIcon("🛒", "#3b82f6"),
  product: createIcon("🟢", "#10b981"),
  unknown: createIcon("🟣", "#8b5cf6"),
  destination: createIcon("🎯", "#ef4444"),
};

export default function LeafletStoreMap({
  selectedProduct,
  userLocation = [625, 125], // Default near entrance
  routeWaypoints = [],
  stops = [],
}: LeafletStoreMapProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="w-full h-full min-h-[500px] bg-slate-50 border border-slate-200 rounded-2xl flex items-center justify-center">
        <p className="text-slate-400 font-medium">Loading Interactive Map...</p>
      </div>
    );
  }

  // Handle single product fallback if `stops` is not provided
  let displayStops = stops;
  if (stops.length === 0 && selectedProduct) {
    const isUnknownProduct = !selectedProduct.aisleId || selectedProduct.aisleId === "A99" || selectedProduct.id?.startsWith("WEB-");
    const targetAisleId = isUnknownProduct ? "A99" : selectedProduct?.aisleId || selectedProduct?.location?.aisleId;
    const targetAisle = STORE_AISLES.find((a) => a.id === targetAisleId) || (isUnknownProduct ? AISLE_UNKNOWN : null);
    
    if (targetAisle) {
      displayStops = [{
        product_name: selectedProduct.name || selectedProduct.productName,
        category: selectedProduct.category,
        price: selectedProduct.price,
        x: targetAisle.bounds[0][0] + (targetAisle.bounds[1][0] - targetAisle.bounds[0][0]) / 2,
        y: targetAisle.bounds[0][1] + (targetAisle.bounds[1][1] - targetAisle.bounds[0][1]) / 2,
        is_web_item: isUnknownProduct
      }];
    }
  }

  return (
    <div className="w-full h-full min-h-[500px] border border-slate-200 rounded-2xl overflow-hidden relative shadow-sm flex flex-col">
      <MapContainer
        crs={L.CRS.Simple}
        bounds={MAP_BOUNDS}
        maxBounds={MAP_BOUNDS}
        style={{ flex: 1, width: "100%", background: "#f8fafc" }}
        zoomControl={true}
        attributionControl={false}
        scrollWheelZoom={true}
        minZoom={-1}
        maxZoom={2}
      >
        {/* Render Zones */}
        {STORE_ZONES.map((zone) => (
          <Rectangle
            key={zone.id}
            bounds={zone.bounds}
            pathOptions={{ color: zone.color, weight: 1, fillOpacity: 0.2 }}
          >
            <Tooltip direction="center" permanent className="bg-transparent border-0 shadow-none text-slate-500 font-bold opacity-50">
              {zone.name}
            </Tooltip>
          </Rectangle>
        ))}

        {/* Render Aisles */}
        {STORE_AISLES.map((aisle) => (
          <Rectangle
            key={aisle.id}
            bounds={aisle.bounds}
            pathOptions={{ color: "#64748b", weight: 2, fillColor: "#cbd5e1", fillOpacity: 0.5 }}
          >
            <Tooltip direction="center" permanent className="bg-transparent border-0 shadow-none text-slate-800 font-bold">
              {aisle.name}
            </Tooltip>
          </Rectangle>
        ))}

        {/* Render Unknown Item Zone (Aisle 99) */}
        <Rectangle
          bounds={AISLE_UNKNOWN.bounds}
          pathOptions={{ color: "#c084fc", weight: 2, fillColor: AISLE_UNKNOWN.color, fillOpacity: 0.5, dashArray: "5, 5" }}
        >
          <Tooltip direction="center" permanent className="bg-transparent border-0 shadow-none text-purple-700 font-bold">
            Zone 99 (Uncataloged)
          </Tooltip>
        </Rectangle>

        {/* Entrance & Checkout */}
        <Rectangle bounds={STORE_ENTRANCE.bounds} pathOptions={{ color: "#22c55e", weight: 2, fillOpacity: 0.1 }}>
          <Tooltip direction="center" permanent className="bg-transparent border-0 shadow-none text-green-700 font-bold">Entrance</Tooltip>
        </Rectangle>
        <Rectangle bounds={STORE_CHECKOUT.bounds} pathOptions={{ color: "#3b82f6", weight: 2, fillOpacity: 0.1 }}>
          <Tooltip direction="center" permanent className="bg-transparent border-0 shadow-none text-blue-700 font-bold">Checkout</Tooltip>
        </Rectangle>

        {/* User Location */}
        <Marker position={userLocation} icon={icons.user}>
          <Popup>You are here</Popup>
        </Marker>

        {/* Render TSP Route Polyline */}
        {routeWaypoints.length > 0 && (
          <Polyline 
            positions={routeWaypoints} 
            pathOptions={{ color: "#3b82f6", weight: 4, dashArray: "10, 10", opacity: 0.8 }} 
          />
        )}

        {/* Target Product Locations (Stops) */}
        {displayStops.map((stop, idx) => (
          <Marker 
            key={idx} 
            position={[stop.x, stop.y]} 
            icon={stop.is_web_item ? icons.unknown : icons.product}
          >
            <Popup className="rounded-xl overflow-hidden font-sans">
              <div className="p-1 min-w-[200px]">
                <h4 className="font-bold text-slate-900 mb-1">{stop.product_name}</h4>
                {stop.category && <p className="text-sm text-slate-500 mb-2">{stop.category}</p>}
                <div className="flex items-center justify-between text-sm">
                  {stop.price && <span className="font-bold text-sky-600">${stop.price?.toFixed(2) || "0.00"}</span>}
                  <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${stop.is_web_item ? 'bg-purple-100 text-purple-700' : 'bg-emerald-100 text-emerald-700'}`}>
                    {stop.is_web_item ? 'Uncataloged Item' : 'In Stock'}
                  </span>
                </div>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
      
      {/* Map Legend */}
      <div className="bg-white border-t border-slate-200 p-3 flex flex-wrap items-center justify-center gap-4 text-xs font-medium text-slate-600">
        <div className="flex items-center gap-1.5"><span className="text-lg">🛒</span> You are here</div>
        <div className="flex items-center gap-1.5"><span className="text-lg">🟢</span> In Stock Item</div>
        <div className="flex items-center gap-1.5"><span className="text-lg">🟣</span> Uncataloged (Zone 99)</div>
        <div className="flex items-center gap-1.5">
          <div className="w-6 h-1 border-b-4 border-blue-500 border-dashed opacity-80"></div>
          Optimized TSP Route
        </div>
      </div>
    </div>
  );
}
