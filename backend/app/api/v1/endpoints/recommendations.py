from fastapi import APIRouter
from pydantic import BaseModel
from typing import List
from app.gemma.engine import get_ollama_client, GEMMA_MODEL
import sys
import os

# Ensure recommendations package is discoverable
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..', '..', '..')))
from recommendations.engine import get_recipe_recommendations

router = APIRouter()
client = get_ollama_client()

class CartPayload(BaseModel):
    cart_items: List[str]

@router.post("/recommend")
async def recommend_products(payload: CartPayload):
    candidates = get_recipe_recommendations(payload.cart_items)
    
    if not candidates:
        return []
        
    top_candidate = candidates[0]
    candidate_name = top_candidate.get("product_name", "Unknown Product")
    cart_str = ", ".join(payload.cart_items)
    
    prompt = (
        f"The user has {cart_str} in their cart. Our algorithm recommends adding {candidate_name}. "
        "Write a short, conversational, 1-sentence shopping pitch explaining how this completes their meal. "
        "Do not mention prices."
    )
    
    try:
        resp = await client.chat(model=GEMMA_MODEL, messages=[{"role": "user", "content": prompt}])
        pitch = resp.get("message", {}).get("content", "").strip()
    except Exception as e:
        print(f"Error calling Gemma for reasoning: {e}")
        pitch = f"Adding {candidate_name} perfectly completes your recipe based on what's in your cart!"
        
    return [
        {
            "sku": top_candidate.get("sku"),
            "product_name": candidate_name,
            "price": top_candidate.get("price", 0.0),
            "reason": pitch
        }
    ]
