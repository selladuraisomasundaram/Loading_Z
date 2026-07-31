"use client";

import React, { useState, useEffect } from "react";
import ProductSearchMap from "@/components/navigation/ProductSearchMap";
import { Product } from "@/types";
import { useCart } from "@/hooks/useCart";
import { MapPin, Navigation, Sparkles, Navigation2, ShoppingBag } from "lucide-react";

import DigitalSupermarketMap from "@/components/navigation/DigitalSupermarketMap";

export const StoreMapView: React.FC = () => {
  const { items, assistantTargetProduct, setAssistantTargetProduct } = useCart();
  const selectedProduct = assistantTargetProduct;
  const setSelectedProduct = setAssistantTargetProduct;
  
  const [gemmaInsight, setGemmaInsight] = useState<string | null>(null);
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [routeData, setRouteData] = useState<any>(null);

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
        setRouteData(data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsOptimizing(false);
    }
  };

  // Auto-update route when cart items change
  useEffect(() => {
    if (items.length > 0) {
      handleOptimizeRoute();
    } else {
      setRouteData(null);
      setGemmaInsight(null);
    }
  }, [items]);

  const handleProductSelect = (product: Product | null) => {
    setSelectedProduct(product);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start max-w-7xl mx-auto h-[calc(100vh-140px)]">
      
      {/* LEFT PANEL: Search and Items List (3 cols) */}
      <div className="lg:col-span-3 flex flex-col h-full bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-200 bg-slate-50">
          <ProductSearchMap
            onSelectProduct={handleProductSelect}
            selectedProduct={selectedProduct}
            onClearSelection={() => setSelectedProduct(null)}
          />
        </div>
        
        <div className="flex-1 overflow-y-auto p-4 custom-scrollbar bg-slate-50">
          <h3 className="text-xs font-extrabold text-slate-400 uppercase tracking-wider mb-3">
            {items.length > 0 ? "Cart Items" : "Popular Items"}
          </h3>
          
          <div className="space-y-2">
            {items.length > 0 ? (
              items.map((item, idx) => (
                <div key={idx} className="bg-white p-3 rounded-xl border border-slate-200 shadow-xs hover:border-blue-300 transition-colors flex items-start gap-3 cursor-pointer">
                  <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center shrink-0">
                    <span className="text-xl">{(item.product.id && item.product.id.startsWith("WEB-")) ? '📦' : '🛒'}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-bold text-slate-900 truncate">{item.product.name}</h4>
                    <p className="text-xs text-slate-500 truncate">{item.product.category || "Uncategorized"}</p>
                    <div className="mt-1 flex items-center gap-2">
                      <span className="inline-flex items-center text-[10px] font-bold px-1.5 py-0.5 rounded text-emerald-700 bg-emerald-100">
                        In Stock
                      </span>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-10">
                <ShoppingBag className="w-10 h-10 text-slate-300 mx-auto mb-3" />
                <p className="text-sm text-slate-500 font-medium">Your cart is empty.</p>
                <p className="text-xs text-slate-400 mt-1">Add items to generate a smart route!</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* CENTER PANEL: Interactive 2D Supermarket Map (6 cols) */}
      <div className="lg:col-span-6 flex flex-col h-full bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="flex-1 relative overflow-y-auto p-2">
          <DigitalSupermarketMap 
            selectedProduct={selectedProduct}
            onProductSelect={handleProductSelect}
          />
        </div>
      </div>

      {/* RIGHT PANEL: Insights and Controls (3 cols) */}
      <div className="lg:col-span-3 flex flex-col h-full space-y-4">
        
        {/* Location Card */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
              <MapPin className="w-4 h-4 text-blue-600" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Your Location</p>
              <p className="text-sm font-bold text-slate-900">Near Entrance</p>
            </div>
          </div>
        </div>

        {/* Destination / Route Stats Card */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center">
              <Navigation className="w-4 h-4 text-red-600" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Destination</p>
              <p className="text-sm font-bold text-slate-900">
                {items.length > 0 ? "Checkout via Multi-Stops" : (selectedProduct ? (selectedProduct.name) : "Select a product")}
              </p>
            </div>
          </div>
          
          {routeData && (
            <div className="grid grid-cols-2 gap-3 pt-3 border-t border-slate-100">
              <div className="bg-slate-50 p-2 rounded-lg text-center">
                <p className="text-xs text-slate-500 font-medium">Distance</p>
                <p className="text-sm font-bold text-slate-900">{routeData.total_distance_meters}m</p>
              </div>
              <div className="bg-slate-50 p-2 rounded-lg text-center">
                <p className="text-xs text-slate-500 font-medium">Est. Time</p>
                <p className="text-sm font-bold text-slate-900">{routeData.estimated_time_minutes} min</p>
              </div>
            </div>
          )}
        </div>

        {/* Gemma Insight Card */}
        <div className="bg-gradient-to-br from-purple-600 to-indigo-700 p-5 rounded-2xl shadow-md text-white relative overflow-hidden flex-1">
          <div className="absolute top-0 right-0 p-4 opacity-20">
            <Sparkles className="w-16 h-16" />
          </div>
          
          <div className="flex items-center gap-2 mb-3 relative z-10">
            <Sparkles className="w-5 h-5 text-purple-200" />
            <h3 className="font-bold text-sm tracking-wide text-purple-100 uppercase">Gemma AI Insight</h3>
          </div>
          
          <div className="relative z-10 flex-1">
            {isOptimizing ? (
              <div className="animate-pulse space-y-2">
                <div className="h-3 bg-purple-400/50 rounded w-3/4"></div>
                <div className="h-3 bg-purple-400/50 rounded w-full"></div>
                <div className="h-3 bg-purple-400/50 rounded w-5/6"></div>
              </div>
            ) : gemmaInsight ? (
              <p className="text-sm font-medium leading-relaxed text-purple-50">
                "{gemmaInsight}"
              </p>
            ) : items.length > 0 ? (
              <p className="text-sm font-medium leading-relaxed text-purple-200 italic">
                Optimizing route...
              </p>
            ) : (
              <p className="text-sm font-medium leading-relaxed text-purple-200 italic">
                Add items to your cart to let Gemma analyze the most efficient route and provide personalized shopping tips!
              </p>
            )}
          </div>
        </div>

        {/* Action Button */}
        <button 
          disabled={items.length === 0}
          className="w-full py-4 bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-300 disabled:cursor-not-allowed text-white font-extrabold text-sm rounded-2xl shadow-lg transition-all flex items-center justify-center gap-2"
        >
          {items.length > 0 ? (
            <>
              <Navigation2 className="w-5 h-5" />
              <span>Start Navigation</span>
            </>
          ) : (
            <span>Cart Empty</span>
          )}
        </button>
      </div>

    </div>
  );
};

export default StoreMapView;
