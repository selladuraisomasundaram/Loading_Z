import hashlib
from typing import List, Optional, Dict, Any
from sqlalchemy.orm import Session
from app.models.product import Product
from app.core.database import SessionLocal
from app.navigation.zone_mapper import resolve_coordinates_for_product

def get_db_session(db: Optional[Session] = None) -> Session:
    return db if db is not None else SessionLocal()

def resolve_product(query_name: str, db: Optional[Session] = None) -> Product:
    """
    Resolves a single product by query name, brand, or SKU using flexible SQLAlchemy query filters.
    """
    if not query_name or not query_name.strip():
        return _get_fallback_product(query_name or "Unknown")

    session = get_db_session(db)
    should_close = db is None

    try:
        clean_query = query_name.strip()
        norm_query = f"%{clean_query}%"

        # 0. Check SKU format match (e.g. SKU-001, SKU-005, P001, P003)
        sku_clean = clean_query.upper()
        if not sku_clean.startswith("SKU-") and not sku_clean.startswith("P0"):
            if len(sku_clean) == 6 and all(c in "0123456789ABCDEF" for c in sku_clean):
                sku_clean = f"SKU-{sku_clean}"

        match = session.query(Product).filter((Product.id == sku_clean) | (Product.id == clean_query)).first()
        if match:
            _inject_coords(match)
            return match

        # 1. Substring match on product_name or brand
        sub = session.query(Product).filter(
            (Product.product_name.ilike(norm_query)) | (Product.brand.ilike(norm_query))
        ).first()
        if sub:
            _inject_coords(sub)
            return sub

        # 2. Individual keyword matching (e.g., Colgate, Toothpaste, Maggi, Parle, Amul, Atta, Milk, Butter)
        words = [w for w in clean_query.split() if len(w) >= 3]
        for w in words:
            word_pattern = f"%{w}%"
            match = session.query(Product).filter(
                (Product.product_name.ilike(word_pattern)) | 
                (Product.brand.ilike(word_pattern)) |
                (Product.category.ilike(word_pattern))
            ).first()
            if match:
                _inject_coords(match)
                return match

        fb = _get_fallback_product(query_name)
        _inject_coords(fb)
        return fb
    except Exception as e:
        print(f"Error in resolve_product service: {e}")
        fb = _get_fallback_product(query_name)
        _inject_coords(fb)
        return fb
    finally:
        if should_close:
            session.close()

def _inject_coords(product: Product):
    from app.navigation.zone_mapper import resolve_coordinates_for_product
    coords = resolve_coordinates_for_product(product.category, product.sub_category, product.id)
    product.aisle = coords["aisle"]
    product.zone_name = coords["zone_name"]
    product.x = coords["x"]
    product.y = coords["y"]

def search_products(query: str, limit: int = 5, db: Optional[Session] = None) -> List[Dict[str, Any]]:
    """
    Executes SQLAlchemy Session.query(Product).filter(...) calls using ilike to return matching products.
    """
    if not query or not query.strip():
        return []

    session = get_db_session(db)
    should_close = db is None

    try:
        clean_query = query.strip()
        norm_query = f"%{clean_query}%"

        # 1. Substring query on product_name or brand
        matches = session.query(Product).filter(
            (Product.product_name.ilike(norm_query)) | (Product.brand.ilike(norm_query))
        ).limit(limit).all()

        if len(matches) < limit:
            existing_ids = {p.id for p in matches}
            more_matches = session.query(Product).filter(
                (Product.category.ilike(norm_query)) | (Product.sub_category.ilike(norm_query))
            ).limit(limit).all()

            for p in more_matches:
                if p.id not in existing_ids:
                    matches.append(p)
                    existing_ids.add(p.id)
                if len(matches) >= limit:
                    break

        results = []
        for p in matches[:limit]:
            p_dict = p.to_dict()
            coords = resolve_coordinates_for_product(p.category, p.sub_category, p.id)
            p_dict["aisle"] = coords["aisle"]
            p_dict["zone_name"] = coords["zone_name"]
            p_dict["x"] = coords["x"]
            p_dict["y"] = coords["y"]
            results.append(p_dict)

        return results
    except Exception as e:
        print(f"Error in search_products service: {e}")
        return []
    finally:
        if should_close:
            session.close()

def _get_fallback_product(query_name: str) -> Product:
    clean_name = query_name.strip().title() if query_name and query_name.strip() else "Generic Item"
    sku = f"SKU-MOCK-{hashlib.md5(clean_name.encode()).hexdigest()[:4].upper()}"
    return Product(
        id=sku,
        product_name=clean_name,
        brand="Generic Brand",
        category="General Grocery",
        sub_category="Miscellaneous",
        sale_price=99.0,
        market_price=99.0,
        stock=50,
        aisle="Aisle A1",
        shelf="Shelf 1",
        type="General",
        rating=4.0,
        description="Fallback mock product profile",
        verified=False
    )
