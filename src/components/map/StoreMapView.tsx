"use client";

import React, { useState } from "react";
import SupermarketMap from "@/components/navigation/SupermarketMap";
import DigitalSupermarketMap from "@/components/navigation/DigitalSupermarketMap";
import ProductSearchMap from "@/components/navigation/ProductSearchMap";
import { AisleData, catalogProducts } from "@/components/navigation/storeMapData";
import { Product, ProductLocation } from "@/types";
import { useCart } from "@/hooks/useCart";

export const StoreMapView: React.FC = () => {
  const { items } = useCart();
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(
    catalogProducts[0] || null
  );
  const [targetLocation, setTargetLocation] = useState("A3");

  // Extract products in active cart for TSP optimization
  const cartProducts: Product[] = items.map((i) => i.product);

  const cartLocations: ProductLocation[] = items
    .map((item) => {
      const match = catalogProducts.find((p) => p.id === item.product.id);
      return match?.location;
    })
    .filter((loc): loc is ProductLocation => Boolean(loc));

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

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* PRODUCT LOCATION SEARCH CARD */}
      <ProductSearchMap
        onSelectProduct={handleProductSelect}
        selectedProduct={selectedProduct}
        onClearSelection={() => setSelectedProduct(null)}
      />

      {/* PHASE 4 INTERACTIVE SUPERMARKET MAP WITH TSP ROUTE OPTIMIZATION */}
      <SupermarketMap
        initialSelectedAisleId={targetLocation}
        selectedProduct={selectedProduct}
        multiSelectedLocations={cartLocations}
        cartProducts={cartProducts}
        onAisleSelect={handleAisleSelect}
        onProductSelect={handleProductSelect}
      />

      {/* 2D ARCHITECTURAL DIGITAL SUPERMARKET MAP */}
      <DigitalSupermarketMap
        selectedAisleId={targetLocation}
        selectedProduct={selectedProduct}
        onAisleSelect={handleAisleSelect}
        onProductSelect={handleProductSelect}
      />
    </div>
  );
};

export default StoreMapView;
