"use client";

import React, { useState } from "react";
import DigitalSupermarketMap from "@/components/navigation/DigitalSupermarketMap";
import ProductSearchMap from "@/components/navigation/ProductSearchMap";
import { AisleData, catalogProducts } from "@/components/navigation/storeMapData";
import { Product } from "@/types";
import { useCart } from "@/hooks/useCart";
import dynamic from "next/dynamic";

// Dynamically import Leaflet map to avoid SSR issues
const LeafletStoreMap = dynamic(() => import("@/components/navigation/LeafletStoreMap"), {
  ssr: false,
});

export const StoreMapView: React.FC = () => {
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(
    catalogProducts[0] || null
  );
  const [targetLocation, setTargetLocation] = useState("A3");

  const handleProductSelect = (product: Product | null) => {
    setSelectedProduct(product);
    if (product?.location?.aisleId || product?.aisleId) {
      setTargetLocation(product.location?.aisleId || product.aisleId || "A3");
    }
  };

  const handleAisleSelect = (aisle: AisleData) => {
    setTargetLocation(aisle.id);
    const firstMatch = catalogProducts.find(
      (p) => p.location?.aisleId === aisle.id || p.aisleId === aisle.id
    );
    if (firstMatch) {
      setSelectedProduct(firstMatch);
    }
  };

  const [gemmaInsight, setGemmaInsight] = useState<string | null>(null);
  const [isOptimizing, setIsOptimizing] = useState(false);
  const { items } = useCart();

  const handleOptimizeRoute = async () => {
    if (items.length === 0) return;
    setIsOptimizing(true);
    try {
      const payload = {
        cart_items: items.map(i => i.product),
        user_location: [625, 125]
      };
      const res = await fetch("http://localhost:8000/api/v1/navigation/route", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        const data = await res.json();
        setGemmaInsight(data.gemma_route_insight);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsOptimizing(false);
    }
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* AUTHORITATIVE INTERACTIVE DIGITAL SUPERMARKET FLOOR MAP */}
      <div className="flex justify-between items-center bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
        <h2 className="text-lg font-bold">Store Map</h2>
        <button
          onClick={handleOptimizeRoute}
          disabled={isOptimizing || items.length === 0}
          className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white text-sm font-bold rounded-lg shadow transition"
        >
          {isOptimizing ? "Optimizing..." : "Optimize Cart Route"}
        </button>
      </div>

      {gemmaInsight && (
        <div className="p-4 bg-purple-50 border border-purple-200 rounded-xl shadow-sm flex items-start gap-3">
          <span className="text-2xl">✨</span>
          <div>
            <h4 className="font-bold text-purple-900 text-sm mb-1">Gemma Route Insight</h4>
            <p className="text-sm text-purple-800">{gemmaInsight}</p>
          </div>
        </div>
      )}

      {/* Show Leaflet Map when optimized, otherwise show standard search map */}
      {gemmaInsight ? (
        <LeafletStoreMap />
      ) : (
        <>
          <ProductSearchMap
            onSelectProduct={handleProductSelect}
            selectedProduct={selectedProduct}
            onClearSelection={() => setSelectedProduct(null)}
          />
          <DigitalSupermarketMap
            initialSelectedAisleId={targetLocation}
            selectedProduct={selectedProduct}
            onAisleSelect={handleAisleSelect}
            onProductSelect={handleProductSelect}
          />
        </>
      )}
    </div>
  );
};

export default StoreMapView;
