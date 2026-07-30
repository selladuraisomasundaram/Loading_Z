import os
import json
from typing import List, Dict, Any

# Adjust path based on project structure
from app.services.product_service import search_products
from app.core.database import SessionLocal

RECIPES_PATH = os.path.join(os.path.dirname(__file__), '..', 'database', 'recipe_ingredients.json')

def load_recipes() -> List[Dict[str, Any]]:
    if not os.path.exists(RECIPES_PATH):
        return []
    with open(RECIPES_PATH, 'r', encoding='utf-8') as f:
        return json.load(f)

def normalize_text(text: str) -> str:
    """Basic normalization for matching."""
    return text.lower().strip()

def get_recipe_recommendations(cart_items: List[str]) -> List[Dict[str, Any]]:
    """
    Finds recipes that overlap with the cart items and recommends missing ingredients
    by matching them against the local catalog.
    """
    if not cart_items:
        return []
        
    recipes = load_recipes()
    if not recipes:
        return []

    # Normalize cart items to a set of words/phrases
    cart_set = set(normalize_text(item) for item in cart_items)
    
    # Also break down cart items into individual words to increase overlap chances
    cart_words = set()
    for item in cart_set:
        for word in item.split():
            if len(word) > 2:
                cart_words.add(word)

    recommended_products = []
    missing_ingredients_pool = set()
    
    for recipe in recipes:
        ingredients = recipe.get("clean_ingredients", [])
        if not ingredients:
            continue
            
        # Create a normalized set for the recipe ingredients
        recipe_set = set(normalize_text(ing) for ing in ingredients)
        
        # Calculate overlap
        # We consider a recipe ingredient "matched" if any cart item or cart word is in it
        overlap_count = 0
        missing = set()
        
        for ing in recipe_set:
            matched = False
            for c_item in cart_set:
                if c_item in ing or ing in c_item:
                    matched = True
                    break
            
            if not matched:
                for c_word in cart_words:
                    if c_word in ing:
                        matched = True
                        break
                        
            if matched:
                overlap_count += 1
            else:
                missing.add(ing)
                
        overlap_ratio = overlap_count / len(recipe_set)
        
        # If overlap is > 30%, we consider it a match
        if overlap_ratio > 0.30 and missing:
            missing_ingredients_pool.update(missing)
            
    if not missing_ingredients_pool:
        return []

    # Verify missing ingredients against the catalog
    db = SessionLocal()
    try:
        found_products = []
        seen_skus = set()
        
        for missing_ing in list(missing_ingredients_pool):
            if len(found_products) >= 3:
                break
                
            # Search catalog for this ingredient
            matches = search_products(missing_ing, limit=1, db=db)
            if matches:
                # search_products returns a list of dictionaries in our mock or a list of SQLAlchemy objects
                # Let's handle both
                match = matches[0]
                is_dict = isinstance(match, dict)
                sku = match.get("sku") if is_dict else match.id
                
                if sku not in seen_skus:
                    seen_skus.add(sku)
                    
                    product_data = {
                        "sku": sku,
                        "product_name": match.get("product_name") if is_dict else match.product_name,
                        "brand": match.get("brand") if is_dict else match.brand,
                        "price": match.get("sale_price", match.get("price")) if is_dict else match.sale_price,
                        "category": match.get("category") if is_dict else match.category,
                        "aisle": match.get("aisle") if is_dict else match.aisle,
                        "reason": f"Completes a recipe (needs {missing_ing.title()})"
                    }
                    found_products.append(product_data)
                    
        return found_products[:3]
    finally:
        db.close()

