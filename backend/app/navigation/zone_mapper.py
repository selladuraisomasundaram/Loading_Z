from typing import Dict, Any

# Comprehensive category-to-aisle mapping for the supermarket 2D map.
# Coordinates are calibrated to the 900x600 SVG canvas used in DigitalSupermarketMap.
# Layout: 3 columns x 4 rows of shelf racks with corridors between them.

CATEGORY_TO_ZONE_MAP: Dict[str, Dict[str, Any]] = {
    # === AISLE 1 — Snacks, Biscuits, Chocolates (Top-Left rack area) ===
    "Snacks & Branded Foods":   {"aisle": "Aisle 1", "zone_name": "Snacks & Branded Foods", "x": 150, "y": 130},
    "Snacks":                   {"aisle": "Aisle 1", "zone_name": "Snacks", "x": 150, "y": 130},
    "Chocolates & Biscuits":    {"aisle": "Aisle 1", "zone_name": "Snacks", "x": 150, "y": 130},
    "Chocolates & Candies":     {"aisle": "Aisle 1", "zone_name": "Snacks", "x": 150, "y": 160},
    "Biscuits & Cookies":       {"aisle": "Aisle 1", "zone_name": "Snacks", "x": 150, "y": 160},
    "Cookies, Rusk & Khari":    {"aisle": "Aisle 1", "zone_name": "Snacks", "x": 150, "y": 190},
    "Snacks & Namkeen":         {"aisle": "Aisle 1", "zone_name": "Snacks", "x": 150, "y": 190},
    "Snacks, Dry Fruits, Nuts": {"aisle": "Aisle 1", "zone_name": "Snacks", "x": 170, "y": 130},
    "Dry Fruits":               {"aisle": "Aisle 1", "zone_name": "Snacks", "x": 170, "y": 160},
    "Indian Mithai":            {"aisle": "Aisle 1", "zone_name": "Snacks", "x": 170, "y": 190},

    # === AISLE 2 — Instant Foods, Noodles, Pasta, Ready-to-Eat (Top-Center) ===
    "Instant Foods":               {"aisle": "Aisle 2", "zone_name": "Instant Foods", "x": 400, "y": 130},
    "Pasta, Soup & Noodles":       {"aisle": "Aisle 2", "zone_name": "Instant Foods", "x": 400, "y": 130},
    "Noodle, Pasta, Vermicelli":   {"aisle": "Aisle 2", "zone_name": "Instant Foods", "x": 400, "y": 160},
    "Ready To Cook & Eat":         {"aisle": "Aisle 2", "zone_name": "Instant Foods", "x": 400, "y": 160},
    "Tinned & Processed Food":     {"aisle": "Aisle 2", "zone_name": "Instant Foods", "x": 420, "y": 130},
    "Sauces, Spreads & Dips":      {"aisle": "Aisle 2", "zone_name": "Condiments", "x": 420, "y": 160},
    "Spreads, Sauces, Ketchup":    {"aisle": "Aisle 2", "zone_name": "Condiments", "x": 420, "y": 190},
    "Pickles & Chutney":           {"aisle": "Aisle 2", "zone_name": "Condiments", "x": 420, "y": 190},
    "Marinades":                   {"aisle": "Aisle 2", "zone_name": "Condiments", "x": 440, "y": 130},

    # === AISLE 3 — Beverages, Tea, Coffee, Juices (Top-Right) ===
    "Beverages":               {"aisle": "Aisle 3", "zone_name": "Beverages", "x": 680, "y": 130},
    "Drinks & Beverages":      {"aisle": "Aisle 3", "zone_name": "Beverages", "x": 680, "y": 130},
    "Tea":                     {"aisle": "Aisle 3", "zone_name": "Beverages", "x": 680, "y": 160},
    "Coffee":                  {"aisle": "Aisle 3", "zone_name": "Beverages", "x": 680, "y": 160},
    "Fruit Juices & Drinks":   {"aisle": "Aisle 3", "zone_name": "Beverages", "x": 700, "y": 130},
    "Energy & Soft Drinks":    {"aisle": "Aisle 3", "zone_name": "Beverages", "x": 700, "y": 160},
    "Water":                   {"aisle": "Aisle 3", "zone_name": "Beverages", "x": 700, "y": 190},
    "Health Drink, Supplement": {"aisle": "Aisle 3", "zone_name": "Beverages", "x": 700, "y": 190},

    # === AISLE 4 — Dairy, Bakery, Eggs (Middle-Left) ===
    "Bakery, Cakes & Dairy":   {"aisle": "Aisle 4", "zone_name": "Dairy & Bakery", "x": 150, "y": 290},
    "Dairy":                   {"aisle": "Aisle 4", "zone_name": "Dairy", "x": 150, "y": 290},
    "Dairy & Cheese":          {"aisle": "Aisle 4", "zone_name": "Dairy", "x": 150, "y": 290},
    "Non Dairy":               {"aisle": "Aisle 4", "zone_name": "Dairy", "x": 150, "y": 320},
    "Bakery":                  {"aisle": "Aisle 4", "zone_name": "Bakery", "x": 170, "y": 290},
    "Breads & Buns":           {"aisle": "Aisle 4", "zone_name": "Bakery", "x": 170, "y": 290},
    "Gourmet Breads":          {"aisle": "Aisle 4", "zone_name": "Bakery", "x": 170, "y": 320},
    "Cakes & Pastries":        {"aisle": "Aisle 4", "zone_name": "Bakery", "x": 170, "y": 320},
    "Bakery Snacks":           {"aisle": "Aisle 4", "zone_name": "Bakery", "x": 170, "y": 350},
    "Ice Creams & Desserts":   {"aisle": "Aisle 4", "zone_name": "Frozen", "x": 150, "y": 350},
    "Frozen Veggies & Snacks": {"aisle": "Aisle 4", "zone_name": "Frozen", "x": 150, "y": 350},
    "Eggs":                    {"aisle": "Aisle 4", "zone_name": "Dairy", "x": 170, "y": 350},
    "Eggs, Meat & Fish":       {"aisle": "Aisle 4", "zone_name": "Dairy & Meat", "x": 150, "y": 350},

    # === AISLE 5 — Foodgrains, Oils, Masalas (Middle-Center) ===
    "Foodgrains, Oil & Masala":  {"aisle": "Aisle 5", "zone_name": "Pantry Staples", "x": 400, "y": 290},
    "Pantry Staples":            {"aisle": "Aisle 5", "zone_name": "Pantry Staples", "x": 400, "y": 290},
    "Atta":                      {"aisle": "Aisle 5", "zone_name": "Pantry Staples", "x": 400, "y": 290},
    "Atta, Flours & Sooji":      {"aisle": "Aisle 5", "zone_name": "Pantry Staples", "x": 400, "y": 290},
    "Rice":                      {"aisle": "Aisle 5", "zone_name": "Pantry Staples", "x": 400, "y": 320},
    "Rice & Rice Products":      {"aisle": "Aisle 5", "zone_name": "Pantry Staples", "x": 400, "y": 320},
    "Dals & Pulses":             {"aisle": "Aisle 5", "zone_name": "Pantry Staples", "x": 420, "y": 290},
    "Edible Oils & Ghee":        {"aisle": "Aisle 5", "zone_name": "Oils & Ghee", "x": 420, "y": 320},
    "Oils & Vinegar":            {"aisle": "Aisle 5", "zone_name": "Oils & Ghee", "x": 420, "y": 350},
    "Masalas & Spices":          {"aisle": "Aisle 5", "zone_name": "Spices", "x": 440, "y": 290},
    "Herbs & Seasonings":        {"aisle": "Aisle 5", "zone_name": "Spices", "x": 440, "y": 320},
    "Salt, Sugar & Jaggery":     {"aisle": "Aisle 5", "zone_name": "Pantry Staples", "x": 440, "y": 350},
    "Organic Staples":           {"aisle": "Aisle 5", "zone_name": "Pantry Staples", "x": 400, "y": 350},
    "Cooking & Baking Needs":    {"aisle": "Aisle 5", "zone_name": "Pantry Staples", "x": 420, "y": 350},
    "Cereals & Breakfast":       {"aisle": "Aisle 5", "zone_name": "Breakfast", "x": 440, "y": 290},
    "Breakfast Cereals":         {"aisle": "Aisle 5", "zone_name": "Breakfast", "x": 440, "y": 290},

    # === AISLE 6 — Meat, Seafood, Fresh Produce (Middle-Right) ===
    "Fish & Seafood":                {"aisle": "Aisle 6", "zone_name": "Meat & Seafood", "x": 680, "y": 290},
    "Mutton & Lamb":                 {"aisle": "Aisle 6", "zone_name": "Meat & Seafood", "x": 680, "y": 320},
    "Pork & Other Meats":            {"aisle": "Aisle 6", "zone_name": "Meat & Seafood", "x": 680, "y": 350},
    "Sausages, Bacon & Salami":      {"aisle": "Aisle 6", "zone_name": "Meat & Seafood", "x": 700, "y": 290},
    "Fruits & Vegetables":           {"aisle": "Aisle 6", "zone_name": "Fresh Produce", "x": 700, "y": 320},
    "Fresh Fruits":                  {"aisle": "Aisle 6", "zone_name": "Fresh Produce", "x": 700, "y": 320},
    "Fresh Vegetables":              {"aisle": "Aisle 6", "zone_name": "Fresh Produce", "x": 700, "y": 350},
    "Cuts & Sprouts":                {"aisle": "Aisle 6", "zone_name": "Fresh Produce", "x": 680, "y": 350},
    "Organic Fruits & Vegetables":   {"aisle": "Aisle 6", "zone_name": "Fresh Produce", "x": 700, "y": 350},
    "Exotic Fruits & Veggies":       {"aisle": "Aisle 6", "zone_name": "Fresh Produce", "x": 680, "y": 320},
    "Flower Bouquets, Bunches":      {"aisle": "Aisle 6", "zone_name": "Fresh Produce", "x": 700, "y": 290},

    # === AISLE 7 — Beauty, Personal Care, Hygiene (Bottom-Left) ===
    "Beauty & Hygiene":      {"aisle": "Aisle 7", "zone_name": "Personal Care", "x": 150, "y": 450},
    "Hair Care":             {"aisle": "Aisle 7", "zone_name": "Personal Care", "x": 150, "y": 450},
    "Skin Care":             {"aisle": "Aisle 7", "zone_name": "Personal Care", "x": 150, "y": 480},
    "Oral Care":             {"aisle": "Aisle 7", "zone_name": "Personal Care", "x": 170, "y": 450},
    "Bath & Hand Wash":      {"aisle": "Aisle 7", "zone_name": "Personal Care", "x": 170, "y": 480},
    "Fragrances & Deos":     {"aisle": "Aisle 7", "zone_name": "Personal Care", "x": 150, "y": 510},
    "Men's Grooming":        {"aisle": "Aisle 7", "zone_name": "Personal Care", "x": 170, "y": 510},
    "Feminine Hygiene":      {"aisle": "Aisle 7", "zone_name": "Personal Care", "x": 150, "y": 510},
    "Makeup":                {"aisle": "Aisle 7", "zone_name": "Personal Care", "x": 170, "y": 450},
    "Health & Medicine":     {"aisle": "Aisle 7", "zone_name": "Health", "x": 170, "y": 510},

    # === AISLE 8 — Cleaning, Household, Disposables (Bottom-Center) ===
    "Cleaning & Household":         {"aisle": "Aisle 8", "zone_name": "Household", "x": 400, "y": 450},
    "Detergents & Dishwash":        {"aisle": "Aisle 8", "zone_name": "Household", "x": 400, "y": 450},
    "All Purpose Cleaners":         {"aisle": "Aisle 8", "zone_name": "Household", "x": 400, "y": 480},
    "Mops, Brushes & Scrubs":       {"aisle": "Aisle 8", "zone_name": "Household", "x": 420, "y": 450},
    "Fresheners & Repellents":      {"aisle": "Aisle 8", "zone_name": "Household", "x": 420, "y": 480},
    "Disposables, Garbage Bag":     {"aisle": "Aisle 8", "zone_name": "Household", "x": 440, "y": 450},
    "Bins & Bathroom Ware":         {"aisle": "Aisle 8", "zone_name": "Household", "x": 440, "y": 480},
    "Car & Shoe Care":              {"aisle": "Aisle 8", "zone_name": "Household", "x": 400, "y": 510},

    # === AISLE 9 — Baby Care, Kitchen, Garden, Pets (Bottom-Right) ===
    "Baby Care":                {"aisle": "Aisle 9", "zone_name": "Baby & Home", "x": 680, "y": 450},
    "Baby Food & Formula":      {"aisle": "Aisle 9", "zone_name": "Baby Care", "x": 680, "y": 450},
    "Baby Bath & Hygiene":      {"aisle": "Aisle 9", "zone_name": "Baby Care", "x": 680, "y": 480},
    "Diapers & Wipes":          {"aisle": "Aisle 9", "zone_name": "Baby Care", "x": 700, "y": 450},
    "Feeding & Nursing":        {"aisle": "Aisle 9", "zone_name": "Baby Care", "x": 700, "y": 480},
    "Baby Accessories":         {"aisle": "Aisle 9", "zone_name": "Baby Care", "x": 680, "y": 510},
    "Mothers & Maternity":      {"aisle": "Aisle 9", "zone_name": "Baby Care", "x": 700, "y": 510},
    "Kitchen, Garden & Pets":   {"aisle": "Aisle 9", "zone_name": "Home & Kitchen", "x": 700, "y": 450},
    "Kitchen Accessories":      {"aisle": "Aisle 9", "zone_name": "Home & Kitchen", "x": 700, "y": 450},
    "Steel Utensils":           {"aisle": "Aisle 9", "zone_name": "Home & Kitchen", "x": 700, "y": 480},
    "Crockery & Cutlery":       {"aisle": "Aisle 9", "zone_name": "Home & Kitchen", "x": 700, "y": 480},
    "Cookware & Non Stick":     {"aisle": "Aisle 9", "zone_name": "Home & Kitchen", "x": 680, "y": 480},
    "Flask & Casserole":        {"aisle": "Aisle 9", "zone_name": "Home & Kitchen", "x": 680, "y": 510},
    "Bakeware":                 {"aisle": "Aisle 9", "zone_name": "Home & Kitchen", "x": 700, "y": 510},
    "Storage & Accessories":    {"aisle": "Aisle 9", "zone_name": "Home & Kitchen", "x": 680, "y": 450},
    "Appliances & Electricals": {"aisle": "Aisle 9", "zone_name": "Home & Kitchen", "x": 700, "y": 510},
    "Pet Food & Accessories":   {"aisle": "Aisle 9", "zone_name": "Pets", "x": 680, "y": 510},
    "Gardening":                {"aisle": "Aisle 9", "zone_name": "Garden", "x": 700, "y": 510},

    # === AISLE 10 — Gourmet, Stationery, Party (Miscellaneous) ===
    "Gourmet & World Food":     {"aisle": "Aisle 10", "zone_name": "Gourmet", "x": 400, "y": 510},
    "Stationery":               {"aisle": "Aisle 10", "zone_name": "Stationery", "x": 420, "y": 510},
    "Party & Festive Needs":    {"aisle": "Aisle 10", "zone_name": "Party Supplies", "x": 440, "y": 510},
    "Pooja Needs":              {"aisle": "Aisle 10", "zone_name": "Pooja & Festival", "x": 440, "y": 510},
}

def resolve_coordinates_for_product(category: str, sub_category: str, sku: str) -> Dict[str, Any]:
    """
    Resolves the physical store coordinates (x, y) and aisle name based on the product category.
    Uses a comprehensive mapping covering all BigBasket/Indian supermarket FMCG categories.
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

    # 4. Fuzzy match: check bidirectional substring matching
    lower_cat = (category or "").lower()
    lower_sub = (sub_category or "").lower()
    for key, coords in CATEGORY_TO_ZONE_MAP.items():
        key_lower = key.lower()
        # Check both directions: key substring of input, or input substring of key
        if (lower_cat and (key_lower in lower_cat or lower_cat in key_lower)):
            return coords
        if (lower_sub and (key_lower in lower_sub or lower_sub in key_lower)):
            return coords
        
    # 5. General fallback for database items without a mapped category
    return {
        "aisle": "Aisle 99 - Uncataloged Section",
        "zone_name": "Zone 99",
        "x": 850,
        "y": 150
    }
