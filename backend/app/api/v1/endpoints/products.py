from fastapi import APIRouter, Query, Depends, HTTPException
from typing import List, Dict, Any, Optional
from app.models.product import ProductSchema
from app.core.database import DatabaseEngine, SessionLocal
from app.api.deps import get_db
from services.product_service import resolve_product, search_products

router = APIRouter()

LOW_STOCK_THRESHOLD = 5

@router.get("/products/resolve", response_model=ProductSchema)
def resolve_product_endpoint(query: str = Query(..., min_length=1, description="Product query name"), db: DatabaseEngine = Depends(get_db)):
    return db.resolve_product(query)


@router.get("/products/search")
def search_products_endpoint(
    q: str = Query(..., min_length=1, description="Search query (product name, brand, or category)"),
    limit: int = Query(10, ge=1, le=50, description="Maximum number of results"),
) -> Dict[str, Any]:
    """
    Searches the product database for matching products by name, brand, or category.
    Returns product list with stock status, coordinates, and availability.
    """
    results = search_products(q, limit=limit)

    # Enrich each result with availability status
    for product in results:
        stock = product.get("stock", 0)
        if stock <= 0:
            product["availability"] = "Out of Stock"
        elif stock <= LOW_STOCK_THRESHOLD:
            product["availability"] = "Low Stock"
        else:
            product["availability"] = "In Stock"

    return {
        "success": True,
        "query": q,
        "count": len(results),
        "products": results,
    }


@router.get("/products/{product_id}")
def get_product_by_id(product_id: str) -> Dict[str, Any]:
    """
    Returns a single product record by its SKU/ID.
    """
    product = resolve_product(product_id, allow_fallback=False)
    if not product:
        raise HTTPException(status_code=404, detail=f"Product '{product_id}' not found.")

    p_dict = product.to_dict()
    from app.navigation.zone_mapper import resolve_coordinates_for_product
    coords = resolve_coordinates_for_product(product.category, product.sub_category, product.id)
    p_dict.update(coords)

    stock = p_dict.get("stock", 0)
    if stock <= 0:
        p_dict["availability"] = "Out of Stock"
    elif stock <= LOW_STOCK_THRESHOLD:
        p_dict["availability"] = "Low Stock"
    else:
        p_dict["availability"] = "In Stock"

    return {"success": True, "product": p_dict}


@router.get("/products/{product_id}/stock")
def get_product_stock(product_id: str) -> Dict[str, Any]:
    """
    Returns current stock status for a specific product.
    Designed for lightweight inventory polling without fetching the full product record.
    """
    product = resolve_product(product_id, allow_fallback=False)
    if not product:
        raise HTTPException(status_code=404, detail=f"Product '{product_id}' not found.")

    stock = product.stock or 0
    if stock <= 0:
        availability = "Out of Stock"
    elif stock <= LOW_STOCK_THRESHOLD:
        availability = "Low Stock"
    else:
        availability = "In Stock"

    return {
        "success": True,
        "product_id": product.id,
        "product_name": product.product_name,
        "stock": stock,
        "availability": availability,
        "price": product.price,
    }
