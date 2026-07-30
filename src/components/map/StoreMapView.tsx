"use client";

import React, { useEffect, useState } from "react";
import { Navigation, Compass, MapPin, Play, Square, Loader2 } from "lucide-react";
import SupermarketMap from "@/components/navigation/SupermarketMap";
import ProductSearchMap from "@/components/navigation/ProductSearchMap";
import { AisleData, catalogProducts } from "@/components/navigation/storeMapData";
import { RouteData, Product, ProductLocation } from "@/types";
import { getStoreRoute } from "@/lib/api";
import { useCart } from "@/hooks/useCart";

export const StoreMapView: React.FC = () => {
  const { items } = useCart();
  const [currentLocation] = useState("ENTRANCE");
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(
    catalogProducts[0] || null
  );
  const [targetLocation, setTargetLocation] = useState("A3");
  const [isNavigating, setIsNavigating] = useState(false);
  const [routeData, setRouteData] = useState<RouteData | null>(null);
  const [isLoadingRoute, setIsLoadingRoute] = useState(false);

  // Extract locations of items currently in cart for multi-pin map display
  const cartLocations: ProductLocation[] = items
    .map((item) => {
      const match = catalogProducts.find((p) => p.id === item.product.id);
      return match?.location;
    })
    .filter((loc): loc is ProductLocation => Boolean(loc));

  useEffect(() => {
    let isMounted = true;

    async function fetchRoute() {
      setIsLoadingRoute(true);
      try {
        const data = await getStoreRoute(currentLocation, targetLocation);
        if (isMounted) {
          setRouteData(data);
        }
      } catch (err: unknown) {
        console.warn("Route fetch error:", err);
      } finally {
        if (isMounted) setIsLoadingRoute(false);
      }
    }

    fetchRoute();

    return () => {
      isMounted = false;
    };
  }, [currentLocation, targetLocation]);

  const handleProductSelect = (product: Product) => {
    setSelectedProduct(product);
    if (product.location?.aisleId) {
      setTargetLocation(product.location.aisleId);
    }
  };

  const handleAisleSelect = (aisle: AisleData) => {
    setTargetLocation(aisle.id);
    const firstMatch = catalogProducts.find(
      (p) => p.location?.aisleId === aisle.id
    );
    if (firstMatch) {
      setSelectedProduct(firstMatch);
    }
  };

  const toggleNavigation = () => {
    setIsNavigating(!isNavigating);
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* PRODUCT LOCATION SEARCH CARD (PRODUCT -> MAP FLOW) */}
      <ProductSearchMap
        onSelectProduct={handleProductSelect}
        selectedProduct={selectedProduct}
        onClearSelection={() => setSelectedProduct(null)}
      />

      {/* PHASE 2 INTERACTIVE SUPERMARKET MAP WITH SHELF PINS */}
      <SupermarketMap
        initialSelectedAisleId={targetLocation}
        selectedProduct={selectedProduct}
        multiSelectedLocations={cartLocations}
        onAisleSelect={handleAisleSelect}
        onProductSelect={handleProductSelect}
      />

      {/* ROUTE INFO CARD & NAVIGATION CONTROLS */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 bg-emerald-50 text-emerald-600 rounded-xl border border-emerald-100">
              <Navigation className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-slate-900 text-base">
                Pathfinder Navigation Guidance
              </h3>
              <p className="text-xs text-slate-500">
                {selectedProduct
                  ? `Navigating to: ${selectedProduct.name} (Aisle ${selectedProduct.location?.aisleId || targetLocation} / Shelf ${selectedProduct.location?.shelfId || "S1"})`
                  : `Target Location: Aisle ${targetLocation}`}
              </p>
            </div>
          </div>

          <span className="bg-emerald-100 text-emerald-900 font-bold text-xs px-3 py-1 rounded-full border border-emerald-300 flex items-center gap-1.5">
            <Compass className="w-3.5 h-3.5 text-emerald-700" />
            {isNavigating ? "Active Guidance" : "Route Ready"}
          </span>
        </div>

        {/* Route Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs">
          <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
              Start Location
            </span>
            <span className="font-black text-slate-900 font-mono text-sm block mt-0.5">
              {currentLocation}
            </span>
          </div>

          <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl">
            <span className="text-[10px] font-bold text-amber-800 uppercase tracking-wider block">
              Target Location
            </span>
            <span className="font-black text-amber-600 font-mono text-sm block mt-0.5">
              Aisle {targetLocation} ({selectedProduct?.location?.shelfId || "S1"})
            </span>
          </div>

          <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
              Total Distance
            </span>
            <span className="font-black text-slate-900 font-mono text-sm block mt-0.5">
              {isLoadingRoute ? (
                <Loader2 className="w-4 h-4 animate-spin text-sky-600" />
              ) : (
                `${routeData?.distanceMeters || 14.5} m`
              )}
            </span>
          </div>

          <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
              Est. Walking Time
            </span>
            <span className="font-black text-slate-900 font-mono text-sm block mt-0.5">
              {isLoadingRoute ? (
                <Loader2 className="w-4 h-4 animate-spin text-sky-600" />
              ) : (
                `${routeData?.estimatedTimeSeconds || 20} sec`
              )}
            </span>
          </div>
        </div>

        {/* Action Toggle Button */}
        <div className="pt-2 flex items-center justify-between gap-4">
          <button
            type="button"
            onClick={toggleNavigation}
            className={`flex-1 py-3.5 font-extrabold text-sm rounded-xl transition-all shadow-sm flex items-center justify-center gap-2 ${
              isNavigating
                ? "bg-rose-600 hover:bg-rose-500 text-white"
                : "bg-emerald-600 hover:bg-emerald-500 text-white"
            }`}
          >
            {isNavigating ? (
              <>
                <Square className="w-4 h-4 fill-white" />
                <span>STOP GUIDANCE</span>
              </>
            ) : (
              <>
                <Play className="w-4 h-4 fill-white" />
                <span>START NAVIGATION</span>
              </>
            )}
          </button>

          <div className="hidden sm:flex items-center gap-1.5 text-xs text-slate-500">
            <MapPin className="w-4 h-4 text-emerald-600" />
            <span>Optimal shortest path calculated</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StoreMapView;
