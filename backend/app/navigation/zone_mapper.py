from typing import Dict, Any

CATEGORY_TO_ZONE_MAP = {
    "Snacks": {"aisle": "Aisle 1", "zone_name": "Snacks", "x": 200, "y": 350},
    "Instant Foods": {"aisle": "Aisle 1", "zone_name": "Snacks", "x": 200, "y": 350},
    "Dairy": {"aisle": "Aisle 3", "zone_name": "Dairy", "x": 450, "y": 200},
    "Beverages": {"aisle": "Aisle 3", "zone_name": "Beverages", "x": 450, "y": 200},
    "Bakery": {"aisle": "Aisle 2", "zone_name": "Bakery", "x": 300, "y": 200},
    "Pantry Staples": {"aisle": "Aisle 7", "zone_name": "Pantry Staples", "x": 350, "y": 500},
    "Atta": {"aisle": "Aisle 7", "zone_name": "Pantry Staples", "x": 350, "y": 500},
    "Rice": {"aisle": "Aisle 7", "zone_name": "Pantry Staples", "x": 350, "y": 500},
}

def resolve_coordinates_for_product(category: str, sub_category: str, sku: str) -> Dict[str, Any]:
    """
    Resolves the physical store coordinates (x, y) and aisle name based on the product category.
    Includes a fallback for web-scraped (WEB-*) items.
    """
    # 1. Check strict fallback for WEB items or Unknown SKUs
    if (sku and sku.startswith("WEB-")) or not sku:
        return {
            "aisle": "Aisle 99 - Uncataloged Section",
            "zone_name": "Zone 99",
            "x": 850,
            "y": 150
        }
        
    # 2. Check if sub-category matches precisely
    if sub_category and sub_category in CATEGORY_TO_ZONE_MAP:
        return CATEGORY_TO_ZONE_MAP[sub_category]
        
    # 3. Check if main category matches
    if category and category in CATEGORY_TO_ZONE_MAP:
        return CATEGORY_TO_ZONE_MAP[category]
        
    # 4. General fallback for database items without a mapped category
    # We can place them dynamically, but the prompt says:
    # "If an item's aisle is unknown, map it strictly to AISLE_UNKNOWN"
    return {
        "aisle": "Aisle 99 - Uncataloged Section",
        "zone_name": "Zone 99",
        "x": 850,
        "y": 150
    }
