export interface RecommendationProduct {
  id: string;
  name: string;
  price: number;
  brand?: string;
  category?: string;
  weightGrams?: number;
  imageUrl?: string;
}

export interface Recommendation {
  id: string;
  title?: string;
  product: RecommendationProduct;
  reason: string;
}
