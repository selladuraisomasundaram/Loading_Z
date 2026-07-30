import json
import logging
from app.gemma.engine import get_ollama_client, GEMMA_MODEL

logger = logging.getLogger(__name__)

async def predict_related_categories(cart_items: list) -> list:
    """
    Uses Gemma to dynamically generate 3 generic product categories related to the cart contents.
    Returns a list of strings.
    """
    if not cart_items:
        return []
    
    cart_str = ", ".join(cart_items)
    prompt = (
        f"The user has the following items in their shopping cart: {cart_str}. "
        "Suggest 3 generic product categories or keywords they might also want to buy. "
        "Output ONLY a comma-separated list of 3 items (e.g. Toothbrush, Mouthwash, Floss). "
        "Do not include any other text."
    )
    
    try:
        client = get_ollama_client()
        resp = await client.chat(model=GEMMA_MODEL, messages=[{"role": "user", "content": prompt}])
        content = resp.get("message", {}).get("content", "").strip()
        # Parse the comma-separated list
        categories = [cat.strip() for cat in content.split(",") if cat.strip()]
        return categories[:3]
    except Exception as e:
        logger.error(f"Error calling Gemma for category prediction: {e}")
        return []

async def synthesize_recommendation_pitch(cart_items: list, recommended_product: str, rule_source: str) -> str:
    """
    Uses Gemma 4 E4B to write a short, appetizing, 1-line shopping recommendation pitch (under 12 words).
    """
    cart_str = ", ".join(cart_items) if cart_items else "nothing yet"
    
    prompt = (
        f"The shopper currently has {cart_str} in their trolley. We are suggesting {recommended_product}. "
        "Write a short, appetizing, 1-line shopping recommendation pitch (under 12 words) for an Indian retail store display. "
        "Examples: 'Maggi tastes best with a dash of Tomato Ketchup!', 'Perfect pairing for your evening Tea time'. "
        "Do not mention prices or use quotes around the output."
    )
    
    try:
        client = get_ollama_client()
        resp = await client.chat(model=GEMMA_MODEL, messages=[{"role": "user", "content": prompt}])
        pitch = resp.get("message", {}).get("content", "").strip()
        # Remove quotes if Gemma added them
        if pitch.startswith('"') and pitch.endswith('"'):
            pitch = pitch[1:-1]
        if pitch.startswith("'") and pitch.endswith("'"):
            pitch = pitch[1:-1]
        return pitch
    except Exception as e:
        logger.error(f"Error calling Gemma for pitch synthesis: {e}")
        # Fallback pitches
        if rule_source == "CO_OCCURRENCE":
            return f"Perfect pairing for your cart items!"
        elif rule_source == "RECIPE_MATCH":
            return f"Complete your recipe with {recommended_product}!"
        else:
            return f"A highly rated staple for your pantry."
