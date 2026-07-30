import os
import json
from typing import List, Dict, Any

from app.services.product_service import search_products
from app.core.database import SessionLocal
import sys

# Ensure services is discoverable
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))
from services.co_occurrence_service import get_co_occurrence_candidates

RECIPES_PATH = os.path.join(os.path.dirname(__file__), '..', 'database', 'recipe_ingredients.json')

def load_recipes() -> List[Dict[str, Any]]:
    if not os.path.exists(RECIPES_PATH):
        return []
    with open(RECIPES_PATH, 'r', encoding='utf-8') as f:
        return json.load(f)

def normalize_text(text: str) -> str:
    """Basic normalization for matching."""
    return text.lower().strip()

def get_recipe_candidate_keywords(cart_items: List[str]) -> List[str]:
    """
    Finds recipes that overlap with the cart items and returns missing ingredient keywords.
    """
    if not cart_items:
        return []
        
    recipes = load_recipes()
    if not recipes:
        return []

    cart_set = set(normalize_text(item) for item in cart_items)
    
    cart_words = set()
    for item in cart_set:
        for word in item.split():
            if len(word) > 2:
                cart_words.add(word)

    missing_ingredients_pool = set()
    
    for recipe in recipes:
        ingredients = recipe.get("clean_ingredients", [])
        if not ingredients:
            continue
            
        recipe_set = set(normalize_text(ing) for ing in ingredients)
        
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
        
        if overlap_ratio > 0.30 and missing:
            missing_ingredients_pool.update(missing)
            
    return list(missing_ingredients_pool)

def generate_hybrid_recommendations(cart_items: List[str], current_scanned_item: str = None) -> List[Dict[str, Any]]:
    """
    Unified hybrid recommendation pipeline.
    Combines Co-occurrence (Tier 1), Recipe Overlap (Tier 2), and Cold-Start (Tier 3).
    """
    # Step A: Combine cart_items and current_scanned_item
    combined_cart = list(cart_items)
    if current_scanned_item and current_scanned_item not in combined_cart:
        combined_cart.append(current_scanned_item)
        
    normalized_cart = set(normalize_text(item) for item in combined_cart)
    
    # Step B: Fetch candidate keywords
    co_occurrence_keywords = get_co_occurrence_candidates(combined_cart)
    recipe_keywords = get_recipe_candidate_keywords(combined_cart)
    
    # Step C: Deduplicate candidate keywords and exclude items already in cart
    candidates_with_rules = []
    seen_keywords = set()
    
    def is_in_cart(kw_str: str) -> bool:
        for c_item in normalized_cart:
            if kw_str in c_item or c_item in kw_str:
                return True
        return False
        
    # Process co-occurrence first (higher priority)
    for kw in co_occurrence_keywords:
        kw_norm = normalize_text(kw)
        if kw_norm not in seen_keywords and not is_in_cart(kw_norm):
            seen_keywords.add(kw_norm)
            # If cart is empty, it's cold start
            rule = "COLD_START" if not combined_cart else "CO_OCCURRENCE"
            candidates_with_rules.append({"keyword": kw, "rule": rule})
            
    # Process recipe matches
    for kw in recipe_keywords:
        kw_norm = normalize_text(kw)
        if kw_norm not in seen_keywords and not is_in_cart(kw_norm):
            seen_keywords.add(kw_norm)
            candidates_with_rules.append({"keyword": kw, "rule": "RECIPE_MATCH"})
            
    if not candidates_with_rules:
        return []
        
    # Step D & E: Pass candidate keywords to product_service and verify stock > 0
    db = SessionLocal()
    found_products = []
    seen_skus = set()
    
    try:
        from app.models.product import Product
        
        for candidate in candidates_with_rules:
            if len(found_products) >= 3:
                break
                
            keyword = candidate["keyword"]
            rule = candidate["rule"]
            
            # Query the database
            norm_query = f"%{keyword.strip()}%"
            # We enforce stock > 0
            matches = db.query(Product).filter(
                (Product.product_name.ilike(norm_query)) | (Product.brand.ilike(norm_query)) | (Product.category.ilike(norm_query)),
                Product.stock > 0
            ).limit(2).all()
            
            for match in matches:
                if match.id not in seen_skus:
                    seen_skus.add(match.id)
                    found_products.append({
                        "sku": match.id,
                        "product_name": match.product_name,
                        "brand": match.brand,
                        "price": match.sale_price,
                        "category": match.category,
                        "aisle": match.aisle,
                        "rule_source": rule
                    })
                    break # Take top match for this keyword
                    
        return found_products[:3]
    finally:
        db.close()

# For backward compatibility with endpoints that use get_recipe_recommendations
def get_recipe_recommendations(cart_items: List[str]) -> List[Dict[str, Any]]:
    return generate_hybrid_recommendations(cart_items)
