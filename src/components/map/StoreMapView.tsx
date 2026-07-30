"use client";

import React, { useState } from "react";
import DigitalSupermarketMap from "@/components/navigation/DigitalSupermarketMap";
import ProductSearchMap from "@/components/navigation/ProductSearchMap";
import { AisleData, catalogProducts } from "@/components/navigation/storeMapData";
import { Product } from "@/types";

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

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* PRODUCT LOCATION SEARCH BAR */}
      <ProductSearchMap
        onSelectProduct={handleProductSelect}
        selectedProduct={selectedProduct}
        onClearSelection={() => setSelectedProduct(null)}
      />

      {/* AUTHORITATIVE INTERACTIVE DIGITAL SUPERMARKET FLOOR MAP */}
      <DigitalSupermarketMap
        initialSelectedAisleId={targetLocation}
        selectedProduct={selectedProduct}
        onAisleSelect={handleAisleSelect}
        onProductSelect={handleProductSelect}
      />
    </div>
  );
};

export default StoreMapView;
