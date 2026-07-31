import re
import logging
from typing import Dict, Any

logger = logging.getLogger(__name__)

# Define exact intents as requested for Phase 8
INTENTS = [
    "PRODUCT_LOCATION",
    "PRODUCT_AVAILABILITY",
    "PRODUCT_SEARCH",
    "CATEGORY_SEARCH",
    "PRODUCT_FILTER",
    "NAVIGATION_REQUEST",
    "ADD_TO_CART",
    "REMOVE_FROM_CART",
    "GENERAL_SUPERMARKET_QUERY",
    "UNKNOWN"
]

def extract_price_constraint(query: str) -> str:
    """Extracts price constraints like 'under 100', 'below 50'."""
    lower = query.lower()
    match = re.search(r'(under|below|less than|max|maximum)\s*(?:rs|inr|rupees|₹)?\s*(\d+)', lower)
    if match:
        return f"<= {match.group(2)}"
    
    match = re.search(r'(above|over|more than|min|minimum)\s*(?:rs|inr|rupees|₹)?\s*(\d+)', lower)
    if match:
        return f">= {match.group(2)}"
        
    match = re.search(r'(between)\s*(\d+)\s*and\s*(\d+)', lower)
    if match:
        return f"{match.group(2)}-{match.group(3)}"
        
    return ""

def process_nlp_query(query: str) -> Dict[str, Any]:
    """
    Deterministic NLP parser to classify intents and extract entities.
    Avoids hitting the LLM for simple queries.
    """
    lower = query.lower().strip()
    
    # Initialize default structure
    result = {
        "intent": "UNKNOWN",
        "entities": {
            "product_name": "",
            "product_id": "",
            "brand": "",
            "category": "",
            "price_constraint": extract_price_constraint(query),
            "location_request": "",
            "navigation_request": "",
            "cart_action": ""
        },
        "original_query": query
    }
    
    # Clean up punctuation for easier matching
    clean_query = re.sub(r'[^\w\s]', '', lower)
    words = set(clean_query.split())
    
    # 1. NAVIGATION
    nav_keywords = {"take me", "navigate", "route", "directions", "how to go", "guide me", "path to"}
    if any(k in lower for k in nav_keywords):
        result["intent"] = "NAVIGATION_REQUEST"
        dest = re.sub(r'.*(take me to|navigate to|route to|directions for|directions to|how to go to|path to)\s+', '', lower)
        result["entities"]["navigation_request"] = dest.strip('?.! ,')
        return result
        
    # 2. CART ACTIONS
    if lower.startswith("add ") or " add " in f" {lower} ":
        result["intent"] = "ADD_TO_CART"
        result["entities"]["cart_action"] = "add"
        result["entities"]["product_name"] = re.sub(r'.*add\s+', '', lower).replace('to cart', '').replace('to my cart', '').strip('?.! ,')
        return result
        
    if lower.startswith("remove ") or " remove " in f" {lower} " or "delete " in lower:
        result["intent"] = "REMOVE_FROM_CART"
        result["entities"]["cart_action"] = "remove"
        result["entities"]["product_name"] = re.sub(r'.*(remove|delete)\s+', '', lower).replace('from cart', '').replace('from my cart', '').strip('?.! ,')
        return result

    # 3. PRODUCT FILTER (Price/Constraints)
    price_keywords = {"price", "cost", "how much is", "how much does", "under", "below", "cheapest"}
    if any(k in lower for k in price_keywords):
        result["intent"] = "PRODUCT_FILTER"
        result["entities"]["product_name"] = re.sub(r'.*(price of|cost of|how much is|how much does|under|below|cheapest)\s+', '', lower).strip('?.! ,')
        return result

    # 4. PRODUCT LOCATION
    loc_keywords = {"where is", "where can i find", "where are", "location of", "aisle for", "shelf for"}
    if any(k in lower for k in loc_keywords):
        result["intent"] = "PRODUCT_LOCATION"
        result["entities"]["product_name"] = re.sub(r'.*(where is|where can i find|where are|location of|aisle for|shelf for)\s+', '', lower).strip('?.! ,')
        result["entities"]["location_request"] = "yes"
        return result

    # 5. PRODUCT AVAILABILITY
    avail_keywords = {"do you have", "in stock", "is there any", "availability", "available"}
    if any(k in lower for k in avail_keywords):
        result["intent"] = "PRODUCT_AVAILABILITY"
        result["entities"]["product_name"] = re.sub(r'.*(do you have|is there any|availability of|is)\s+', '', lower).replace('in stock', '').replace('available', '').strip('?.! ,')
        return result
        
    # 6. PRODUCT FILTER (Comparison)
    if "compare" in lower or (" vs " in lower and len(clean_query) < 50):
        result["intent"] = "PRODUCT_FILTER"
        result["entities"]["product_name"] = lower.replace("compare", "").strip('?.! ,')
        return result

    # 7. CATEGORY SEARCH
    if result["entities"]["price_constraint"] or any(k in lower for k in {"list", "show me", "what kind of", "types of", "brands of", "show"}):
        result["intent"] = "CATEGORY_SEARCH"
        cat = re.sub(r'.*(list|show me|show|what kind of|types of|brands of)\s+', '', lower)
        # Strip price constraint text from category if present
        cat = re.sub(r'(under|below|less than|max|maximum|above|over|more than|min|minimum)\s*(?:rs|inr|rupees|₹)?\s*(\d+)', '', cat)
        result["entities"]["category"] = cat.strip('?.! ,')
        return result
        
    # 8. GENERAL SUPERMARKET QUERY (Timing, parking, general info)
    general_keywords = {"open", "close", "timing", "hours", "parking", "toilet", "washroom", "restroom", "manager", "manager"}
    if any(k in words for k in general_keywords):
        result["intent"] = "GENERAL_SUPERMARKET_QUERY"
        return result
        
    # 9. PRODUCT SEARCH (Fallback for short queries like "Aashirvaad Atta")
    if len(words) <= 5:
        result["intent"] = "PRODUCT_SEARCH"
        result["entities"]["product_name"] = query.strip('?.! ,')
        return result
        
    # If all deterministic checks fail, it falls back to UNKNOWN
    # The caller (Orchestrator or RAG pipeline) can then defer to Gemma for intent classification
    return result
