import os
import re
import hashlib
import difflib
import pandas as pd
from typing import Optional
from app.models.product import Product

class DatabaseEngine:
    def __init__(self):
        self.df: Optional[pd.DataFrame] = None
        self.load_data()

    def _find_csv_path(self) -> Optional[str]:
        possible_paths = [
            os.path.join(os.getcwd(), "data", "Cleaned_data.csv"),
            os.path.join(os.path.dirname(__file__), "..", "..", "data", "Cleaned_data.csv"),
            os.path.join(os.path.dirname(__file__), "..", "..", "..", "data", "products", "Cleaned_data.csv"),
            os.path.join(os.getcwd(), "..", "data", "products", "Cleaned_data.csv"),
        ]
        for path in possible_paths:
            abs_path = os.path.abspath(path)
            if os.path.exists(abs_path) and os.path.getsize(abs_path) > 0:
                return abs_path
        return None

    def load_data(self):
        csv_path = self._find_csv_path()
        if not csv_path:
            print("Warning: Cleaned_data.csv not found or empty. Database running in fallback mock mode.")
            self.df = None
            return

        try:
            df = pd.read_csv(csv_path)
            if df.empty or 'product' not in df.columns:
                print("Warning: CSV loaded but is empty or missing 'product' column.")
                self.df = None
                return

            df['normalized_name'] = df['product'].fillna('').astype(str).apply(self._normalize_str)
            df['normalized_brand'] = df['brand'].fillna('').astype(str).apply(self._normalize_str)
            df['search_text'] = df['normalized_brand'] + ' ' + df['normalized_name']

            # Precompute SKUs for all products
            skus = []
            for idx, row in df.iterrows():
                prod_name = str(row['product']) if pd.notna(row.get('product')) else "Unknown Product"
                brand_name = str(row['brand']).strip() if pd.notna(row.get('brand')) else "Generic"
                skus.append(self._generate_sku(prod_name, brand_name, idx))
            df['sku'] = skus

            self.df = df
            print(f"Database loaded successfully with {len(self.df)} products from {csv_path}.")
        except Exception as e:
            print(f"Error loading CSV dataset: {e}")
            self.df = None

    @staticmethod
    def _normalize_str(text: str) -> str:
        text = text.lower().strip()
        text = re.sub(r'[^a-z0-9\s]', '', text)
        text = re.sub(r'\s+', ' ', text)
        return text

    def _generate_sku(self, product_name: str, brand: str, index: int) -> str:
        hash_src = f"{brand}_{product_name}_{index}"
        hash_val = hashlib.md5(hash_src.encode('utf-8')).hexdigest()[:6].upper()
        return f"SKU-{hash_val}"

    def _generate_location(self, category: str, index: int) -> tuple[str, str]:
        cat_str = str(category)
        cat_hash = sum(ord(c) for c in cat_str)
        aisle_num = (cat_hash % 12) + 1
        aisle_letter = chr(65 + (cat_hash % 6))
        aisle = f"Aisle {aisle_letter}{aisle_num}"
        shelf = f"Shelf {(index % 4) + 1}"
        return aisle, shelf

    def _row_to_product(self, row: pd.Series, index: int) -> Product:
        prod_name = str(row['product']) if pd.notna(row.get('product')) else "Unknown Product"
        brand_name = str(row['brand']).strip() if pd.notna(row.get('brand')) else "Generic"
        cat = str(row['category']) if pd.notna(row.get('category')) else "General"
        sub_cat = str(row['sub_category']) if pd.notna(row.get('sub_category')) else "General"

        try:
            sale_price = float(row.get('sale_price', 0.0))
            if pd.isna(sale_price):
                sale_price = 0.0
        except (ValueError, TypeError):
            sale_price = 0.0

        try:
            market_price = float(row.get('market_price', 0.0))
            if pd.isna(market_price):
                market_price = 0.0
        except (ValueError, TypeError):
            market_price = 0.0

        try:
            rating = float(row.get('rating', 0.0))
            if pd.isna(rating):
                rating = 0.0
        except (ValueError, TypeError):
            rating = 0.0

        prod_type = str(row['type']).strip() if pd.notna(row.get('type')) else ""
        desc = str(row['description']).strip() if pd.notna(row.get('description')) else ""

        # Map active price: preference sale_price > market_price > 9.99 default
        price = sale_price if sale_price > 0 else (market_price if market_price > 0 else 9.99)

        sku = self._generate_sku(prod_name, brand_name, index)
        aisle, shelf = self._generate_location(cat, index)
        stock = 10 + ((index * 7) % 90)

        return Product(
            sku=sku,
            product_name=prod_name,
            brand=brand_name,
            category=cat,
            sub_category=sub_cat,
            price=round(price, 2),
            stock=stock,
            aisle=aisle,
            shelf=shelf,
            verified=True,
            market_price=round(market_price, 2),
            sale_price=round(sale_price, 2),
            type=prod_type,
            rating=round(rating, 2),
            description=desc
        )

    def search_products(self, query: str, limit: int = 5) -> list[dict]:
        """
        Returns a list of product dictionaries matching the query (using substring or fuzzy matching),
        rather than just a single resolved product.
        """
        if not query or not query.strip() or self.df is None or self.df.empty:
            return []

        norm_query = self._normalize_str(query)
        if not norm_query:
            return []

        matched_indices = []

        # 1. Substring match on normalized product name or search text
        sub_matches = self.df[
            self.df['normalized_name'].str.contains(re.escape(norm_query), case=False, na=False) |
            self.df['search_text'].str.contains(re.escape(norm_query), case=False, na=False)
        ]
        if not sub_matches.empty:
            matched_indices.extend(sub_matches.index.tolist())

        # 2. Substring match with query words if limit not reached
        if len(matched_indices) < limit:
            query_words = [w for w in norm_query.split() if len(w) > 2]
            if query_words:
                word_match_mask = pd.Series(True, index=self.df.index)
                for w in query_words:
                    word_match_mask = word_match_mask & self.df['search_text'].str.contains(re.escape(w), case=False, na=False)

                word_matches = self.df[word_match_mask]
                for idx in word_matches.index:
                    if idx not in matched_indices:
                        matched_indices.append(idx)

        # 3. Fuzzy match using difflib if still not enough
        if len(matched_indices) < limit:
            all_names = self.df['normalized_name'].tolist()
            fuzzy_matches = difflib.get_close_matches(norm_query, all_names, n=limit, cutoff=0.4)
            for m_name in fuzzy_matches:
                m_rows = self.df[self.df['normalized_name'] == m_name]
                for idx in m_rows.index:
                    if idx not in matched_indices:
                        matched_indices.append(idx)

        results = []
        for idx in matched_indices[:limit]:
            row = self.df.iloc[idx]
            prod = self._row_to_product(row, idx)
            results.append(prod.model_dump() if hasattr(prod, 'model_dump') else prod.dict())

        return results

    def resolve_product(self, query_name: str) -> Product:
        if not query_name or not query_name.strip():
            return self._get_fallback_product(query_name or "Unknown")

        if self.df is None or self.df.empty:
            return self._get_fallback_product(query_name)

        norm_query = self._normalize_str(query_name)
        if not norm_query:
            return self._get_fallback_product(query_name)

        # 0. Check if query matches SKU format and resolve
        query_cleaned = query_name.strip().upper()
        if not query_cleaned.startswith("SKU-"):
            if len(query_cleaned) == 6 and all(c in "0123456789ABCDEF" for c in query_cleaned):
                query_cleaned = f"SKU-{query_cleaned}"
            elif query_cleaned.startswith("SKU") and len(query_cleaned) == 9:
                query_cleaned = f"SKU-{query_cleaned[3:]}"

        if query_cleaned.startswith("SKU-") and 'sku' in self.df.columns:
            sku_matches = self.df[self.df['sku'] == query_cleaned]
            if not sku_matches.empty:
                idx = sku_matches.index[0]
                return self._row_to_product(sku_matches.iloc[0], idx)

        # 1. Exact normalized name match
        exact_matches = self.df[self.df['normalized_name'] == norm_query]
        if not exact_matches.empty:
            idx = exact_matches.index[0]
            return self._row_to_product(exact_matches.iloc[0], idx)

        # 2. Direct substring match
        sub_matches = self.df[
            self.df['normalized_name'].str.contains(re.escape(norm_query), case=False, na=False) |
            self.df['search_text'].str.contains(re.escape(norm_query), case=False, na=False)
        ]
        if not sub_matches.empty:
            idx = sub_matches.index[0]
            return self._row_to_product(sub_matches.iloc[0], idx)

        # 3. Substring match with query words
        query_words = [w for w in norm_query.split() if len(w) > 2]
        if query_words:
            word_match_mask = pd.Series(True, index=self.df.index)
            for w in query_words:
                word_match_mask = word_match_mask & self.df['search_text'].str.contains(re.escape(w), case=False, na=False)

            word_matches = self.df[word_match_mask]
            if not word_matches.empty:
                idx = word_matches.index[0]
                return self._row_to_product(word_matches.iloc[0], idx)

        # 4. Fuzzy close matches using difflib
        all_names = self.df['normalized_name'].tolist()
        matches = difflib.get_close_matches(norm_query, all_names, n=1, cutoff=0.5)
        if matches:
            matched_name = matches[0]
            matched_row = self.df[self.df['normalized_name'] == matched_name]
            if not matched_row.empty:
                idx = matched_row.index[0]
                return self._row_to_product(matched_row.iloc[0], idx)

        # 5. Fallback response
        return self._get_fallback_product(query_name)

    def _get_fallback_product(self, query_name: str) -> Product:
        clean_name = query_name.strip().title() if query_name and query_name.strip() else "Generic Item"
        return Product(
            sku=f"SKU-MOCK-{hashlib.md5(clean_name.encode()).hexdigest()[:4].upper()}",
            product_name=clean_name,
            brand="Generic Brand",
            category="General Grocery",
            sub_category="Miscellaneous",
            price=99.0,
            stock=50,
            aisle="Aisle A1",
            shelf="Shelf 1",
            verified=False,
            market_price=99.0,
            sale_price=99.0,
            type="General",
            rating=4.0,
            description="Fallback mock product profile"
        )

db_engine = DatabaseEngine()

def get_db_engine() -> DatabaseEngine:
    return db_engine

def resolve_product(query_name: str) -> Product:
    return db_engine.resolve_product(query_name)

def search_products(query: str, limit: int = 5) -> list[dict]:
    return db_engine.search_products(query, limit)

