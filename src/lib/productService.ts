/**
 * Product Service — Frontend abstraction for product data API calls.
 * Provides clean methods for product search, stock checks, and inventory refresh
 * that can later be extended to support WebSocket, SSE, or polling.
 */

import { Product } from "@/types";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export interface ProductSearchResult {
  success: boolean;
  query: string;
  count: number;
  products: ProductApiRecord[];
}

export interface ProductApiRecord {
  id: string;
  sku: string;
  product_name: string;
  brand: string;
  category: string;
  sub_category: string;
  price: number;
  sale_price: number;
  market_price: number;
  stock: number;
  aisle: string;
  shelf: string;
  availability: "In Stock" | "Low Stock" | "Out of Stock";
  zone_name?: string;
  x?: number;
  y?: number;
  rating?: number;
  description?: string;
}

export interface StockStatusResult {
  success: boolean;
  product_id: string;
  product_name: string;
  stock: number;
  availability: "In Stock" | "Low Stock" | "Out of Stock";
  price: number;
}

/**
 * Searches the product database via the backend API.
 */
export async function searchProducts(
  query: string,
  limit: number = 10
): Promise<ProductSearchResult> {
  try {
    const response = await fetch(
      `${BASE_URL}/api/v1/products/search?q=${encodeURIComponent(query)}&limit=${limit}`,
      { method: "GET", headers: { Accept: "application/json" } }
    );

    if (!response.ok) {
      throw new Error(`Product search failed (HTTP ${response.status})`);
    }

    return await response.json();
  } catch (error) {
    console.error("Product search error:", error);
    return { success: false, query, count: 0, products: [] };
  }
}

/**
 * Fetches a single product by ID from the backend.
 */
export async function getProductById(
  productId: string
): Promise<ProductApiRecord | null> {
  try {
    const response = await fetch(
      `${BASE_URL}/api/v1/products/${encodeURIComponent(productId)}`,
      { method: "GET", headers: { Accept: "application/json" } }
    );

    if (!response.ok) return null;
    const data = await response.json();
    return data.product || null;
  } catch (error) {
    console.error("Get product error:", error);
    return null;
  }
}

/**
 * Fetches current stock status for a product (lightweight endpoint).
 */
export async function getProductStock(
  productId: string
): Promise<StockStatusResult | null> {
  try {
    const response = await fetch(
      `${BASE_URL}/api/v1/products/${encodeURIComponent(productId)}/stock`,
      { method: "GET", headers: { Accept: "application/json" } }
    );

    if (!response.ok) return null;
    return await response.json();
  } catch (error) {
    console.error("Stock check error:", error);
    return null;
  }
}

/**
 * Converts a backend ProductApiRecord to a frontend Product type.
 */
export function apiRecordToProduct(record: ProductApiRecord): Product {
  return {
    id: record.sku || record.id,
    productId: record.sku || record.id,
    name: record.product_name,
    productName: record.product_name,
    brand: record.brand,
    price: record.price || record.sale_price || 0,
    weightGrams: 0,
    category: record.category,
    aisleId: record.aisle,
    shelfId: record.shelf,
    mapX: record.x || 510,
    mapY: record.y || 95,
    stock: record.stock,
    availability: record.availability,
  };
}

/**
 * Refreshes stock for a product and returns updated availability status.
 * This is designed as a building block for future real-time inventory systems
 * (WebSocket, SSE, polling).
 */
export async function refreshProductStock(
  product: Product
): Promise<Product> {
  const stockData = await getProductStock(product.id || product.productId || "");
  if (!stockData || !stockData.success) return product;

  return {
    ...product,
    stock: stockData.stock,
    price: stockData.price || product.price,
    availability: stockData.availability,
  };
}
