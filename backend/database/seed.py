import os
import sys
import hashlib
import pandas as pd

# Allow relative imports when run directly as a script
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from app.core.database import engine, SessionLocal
from app.models.product import Base, Product

def find_csv_path() -> str:
    possible_paths = [
        os.path.join(os.getcwd(), "data", "Cleaned_data.csv"),
        os.path.join(os.getcwd(), "backend", "data", "Cleaned_data.csv"),
        os.path.join(os.path.dirname(__file__), "..", "data", "Cleaned_data.csv"),
        os.path.join(os.path.dirname(__file__), "..", "..", "data", "Cleaned_data.csv"),
    ]
    for p in possible_paths:
        abs_p = os.path.abspath(p)
        if os.path.exists(abs_p) and os.path.getsize(abs_p) > 0:
            return abs_p
    return None

def generate_sku(product_name: str, brand: str, index: int, seen_skus: set) -> str:
    hash_src = f"{brand}_{product_name}_{index}"
    base_sku = f"SKU-{hashlib.md5(hash_src.encode('utf-8')).hexdigest()[:6].upper()}"
    if base_sku not in seen_skus:
        seen_skus.add(base_sku)
        return base_sku
    unique_sku = f"SKU-{(index + 1):06X}"
    seen_skus.add(unique_sku)
    return unique_sku

def generate_location(category: str, index: int):
    cat_str = str(category)
    cat_hash = sum(ord(c) for c in cat_str)
    aisle_num = (cat_hash % 12) + 1
    aisle_letter = chr(65 + (cat_hash % 6))
    aisle = f"Aisle {aisle_letter}{aisle_num}"
    shelf = f"Shelf {(index % 4) + 1}"
    return aisle, shelf

def seed_database():
    csv_path = find_csv_path()
    if not csv_path:
        print("Warning: Cleaned_data.csv not found for database seeding.")
        return

    print(f"Loading CSV dataset from {csv_path}...")
    df = pd.read_csv(csv_path)
    if df.empty or 'product' not in df.columns:
        print("Warning: CSV dataset is empty or missing 'product' column.")
        return

    # Ensure database schema is created
    Base.metadata.create_all(bind=engine)

    session = SessionLocal()
    try:
        existing_count = session.query(Product).count()
        if existing_count >= 27000:
            print(f"SQLite database already seeded with {existing_count} products.")
            return

        if existing_count > 0:
            print(f"Cleaning partial seed ({existing_count} items)...")
            session.query(Product).delete()
            session.commit()

        products = []
        seen_skus = set()
        print(f"Seeding {len(df)} products into SQLite database via SQLAlchemy...")
        for idx, row in df.iterrows():
            prod_name = str(row['product']).strip() if pd.notna(row.get('product')) else "Unknown Product"
            brand_name = str(row['brand']).strip() if pd.notna(row.get('brand')) else "Generic"
            cat = str(row['category']).strip() if pd.notna(row.get('category')) else "General"
            sub_cat = str(row['sub_category']).strip() if pd.notna(row.get('sub_category')) else "General"

            try:
                sale_p = float(row.get('sale_price', 0.0))
                if pd.isna(sale_p):
                    sale_p = 0.0
            except Exception:
                sale_p = 0.0

            try:
                market_p = float(row.get('market_price', 0.0))
                if pd.isna(market_p):
                    market_p = 0.0
            except Exception:
                market_p = 0.0

            try:
                rat = float(row.get('rating', 0.0))
                if pd.isna(rat):
                    rat = 0.0
            except Exception:
                rat = 0.0

            prod_type = str(row['type']).strip() if pd.notna(row.get('type')) else ""
            desc = str(row['description']).strip() if pd.notna(row.get('description')) else ""

            sku = generate_sku(prod_name, brand_name, idx, seen_skus)
            aisle, shelf = generate_location(cat, idx)
            stock = 10 + ((idx * 7) % 90)

            product = Product(
                id=sku,
                product_name=prod_name,
                brand=brand_name,
                category=cat,
                sub_category=sub_cat,
                sale_price=sale_p,
                market_price=market_p,
                stock=stock,
                aisle=aisle,
                shelf=shelf,
                type=prod_type,
                rating=rat,
                description=desc,
                verified=True
            )
            products.append(product)

        session.bulk_save_objects(products)
        session.commit()
        print(f"Successfully seeded SQLite database with {len(products)} products!")
    except Exception as e:
        session.rollback()
        print(f"Error during SQLite database seeding: {e}")
    finally:
        session.close()


if __name__ == "__main__":
    seed_database()
