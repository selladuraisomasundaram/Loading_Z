import json
import re
import os
import asyncio
from fastapi import APIRouter, File, UploadFile, Depends
from app.gemma.vision import identify_product_from_image, _extract_json_from_response
from app.gemma.engine import get_ollama_client, GEMMA_MODEL
from app.agent.tools import search_web
from app.core.database import DatabaseEngine
from app.api.deps import get_db
from app.models.product import VisionAnalysisResponse

router = APIRouter()

@router.post("/vision/analyze", response_model=VisionAnalysisResponse)
async def analyze_vision_frame(
    image: UploadFile = File(...),
    db: DatabaseEngine = Depends(get_db)
):
    """
    Accepts an uploaded image frame, processes it via Gemma Vision OCR to identify product name,
    resolves against the SQLite database catalog, and triggers DuckDuckGo web search fallback
    if the item is not found in the local catalog.
    """
    # 1. Read raw image frame bytes
    image_bytes = await image.read()

    # 2. Run through Gemma Vision OCR Client
    vision_result = await identify_product_from_image(image_bytes)
    identified_name = vision_result.get("identified_name", "").strip()
    confidence = float(vision_result.get("confidence", 0.85))
    print(f"Vision identified: '{identified_name}' (confidence: {confidence})", flush=True)

    # 3. Resolve item against local SQLite database catalog
    product = db.resolve_product(identified_name)

    # 4. IF database match is verified (not a mock/fallback) -> return database product details
    is_real_match = (
        product
        and getattr(product, "verified", False)
        and not getattr(product, "id", "").startswith("SKU-MOCK")
    )

    if is_real_match:
        print(f"DB match found: {product.product_name} (SKU: {product.sku})", flush=True)
        return VisionAnalysisResponse(
            sku=product.sku,
            product_name=product.product_name,
            brand=product.brand,
            category=product.category,
            sub_category=product.sub_category,
            price=product.price,
            stock=product.stock,
            aisle=product.aisle,
            shelf=product.shelf,
            gemma_confidence=confidence,
            verified=True
        )

    # 5. IF NO database match found (foreign/uncataloged item) -> DuckDuckGo Web Search Fallback
    refined_name = identified_name if identified_name else "Uncataloged Item"
    approx_price = 150.0
    print(f"No DB match for '{identified_name}', searching web...", flush=True)

    try:
        search_query = f"{refined_name} price retail India"
        snippets = search_web(search_query)
        print(f"Web search returned: {snippets[:200]}", flush=True)

        # Parse price from web snippets using regex directly to save LLM inference time and prevent 60s timeout
        price_patterns = [
            r'₹\s*([\d,]+(?:\.\d{1,2})?)',
            r'Rs\.?\s*([\d,]+(?:\.\d{1,2})?)',
            r'INR\s*([\d,]+(?:\.\d{1,2})?)',
            r'(?:price|cost|mrp)[:\s]*₹?\s*([\d,]+(?:\.\d{1,2})?)',
        ]
        for pattern in price_patterns:
            match = re.search(pattern, snippets, re.IGNORECASE)
            if match:
                val = float(match.group(1).replace(',', ''))
                if 1 < val < 50000:
                    approx_price = val
                    break
    except Exception as err:
        print(f"Vision web fallback search notice: {err}", flush=True)

    return VisionAnalysisResponse(
        sku="WEB-ITEM",
        product_name=refined_name,
        brand=getattr(product, "brand", None) or "External Item",
        category="Web Fallback",
        sub_category="Uncataloged Item",
        price=round(float(approx_price), 2),
        stock=0,
        aisle="Unknown",
        shelf="Unknown",
        gemma_confidence=confidence,
        verified=False
    )
