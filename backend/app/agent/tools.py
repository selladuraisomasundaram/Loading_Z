from typing import Dict, Any, Optional
from app.core.database import resolve_product
from app.navigation.pathfinder import calculate_route

def search_catalog(query: str) -> Dict[str, Any]:
    """
    Queries the product database to find a matching product by name or substring.
    """
    if not query or not query.strip():
        return {
            "success": False,
            "error": "Query cannot be empty"
        }
    
    product = resolve_product(query)
    return {
        "success": True,
        "sku": product.sku,
        "product_name": product.product_name,
        "brand": product.brand,
        "category": product.category,
        "sub_category": product.sub_category,
        "price": product.price,
        "stock": product.stock,
        "aisle": product.aisle,
        "shelf": product.shelf,
        "verified": product.verified
    }

def get_route(destination: str) -> Dict[str, Any]:
    """
    Invokes the NetworkX pathfinder to calculate a route to the destination.
    """
    if not destination or not destination.strip():
        return {
            "success": False,
            "error": "Destination cannot be empty"
        }
    
    # Calculate route from the default "ENTRANCE" location
    route = calculate_route(start_node="ENTRANCE", destination_node=destination)
    return {
        "success": True,
        **route
    }

def check_inventory(sku: str) -> Dict[str, Any]:
    """
    Checks the database stock level and pricing for a specific SKU.
    """
    if not sku or not sku.strip():
        return {
            "success": False,
            "error": "SKU cannot be empty"
        }
    
    product = resolve_product(sku)
    return {
        "success": True,
        "sku": product.sku,
        "product_name": product.product_name,
        "brand": product.brand,
        "price": product.price,
        "stock": product.stock,
        "aisle": product.aisle,
        "shelf": product.shelf,
        "verified": product.verified
    }
