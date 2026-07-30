from fastapi import APIRouter
from pydantic import BaseModel
from typing import List, Optional
import sys
import os
import asyncio

# Ensure recommendations package is discoverable
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..', '..', '..')))
from recommendations.engine import generate_hybrid_recommendations
from app.gemma.reasoning import synthesize_recommendation_pitch

router = APIRouter()

class GeneratePayload(BaseModel):
    cart_items: List[str]
    scanned_item: Optional[str] = None

@router.post("/generate")
async def generate_recommendations(payload: GeneratePayload):
    # Get exact candidate SKUs
    candidates = generate_hybrid_recommendations(payload.cart_items, payload.scanned_item)
    
    if not candidates:
        return []
        
    results = []
    # Create pitch generation tasks for all candidates concurrently
    tasks = []
    
    for candidate in candidates:
        product_name = candidate.get("product_name", "Unknown Product")
        rule_source = candidate.get("rule_source", "UNKNOWN")
        # Ensure we pass strings properly
        cart_strings = [str(item) for item in payload.cart_items]
        tasks.append(synthesize_recommendation_pitch(cart_strings, product_name, rule_source))
        
    # Wait for all pitches
    pitches = await asyncio.gather(*tasks, return_exceptions=True)
    
    for i, candidate in enumerate(candidates):
        pitch = pitches[i]
        if isinstance(pitch, Exception):
            pitch = f"A great addition to your cart! ({candidate.get('rule_source')})"
            
        results.append({
            "product_id": candidate.get("sku"),
            "product_name": candidate.get("product_name"),
            "brand": candidate.get("brand"),
            "price": candidate.get("price", 0.0),
            "reason": pitch,
            "category": candidate.get("category"),
            "image_url": None
        })
        
    return {"success": True, "recommendations": results}
