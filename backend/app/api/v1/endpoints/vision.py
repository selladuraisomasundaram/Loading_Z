import os
import json
import re
import asyncio
from fastapi import APIRouter, File, UploadFile, Depends
from sqlalchemy.orm import Session
from app.gemma.vision import identify_product_from_image
from app.gemma.engine import get_ollama_client, GEMMA_MODEL
from app.agent.tools import search_web
from app.api.deps import get_db
from app.models.product import VisionAnalysisResponse
from services.product_service import resolve_product

router = APIRouter()

@router.post("/vision/analyze", response_model=VisionAnalysisResponse)
async def analyze_vision_frame(
    image: UploadFile = File(...),
    db: Session = Depends(get_db)
):
    """
    Accepts an uploaded image file, processes it via Gemma Vision, resolves the identified
    item against the product catalog database, and returns the verified product SKU details.
    """
    # 1. Read raw image frame bytes
    image_bytes = await image.read()

    # 2. Run through Gemma Vision Client
    vision_result = await identify_product_from_image(image_bytes)
    identified_name = vision_result.get("identified_name", "").strip()
    confidence = float(vision_result.get("confidence", 0.85))

    # 3. Resolve item against local SQLite database catalog
    product = resolve_product(identified_name, db=db)

    # 4. IF database match is verified -> return database product details
    if product and getattr(product, "verified", True):
        return VisionAnalysisResponse(
            sku=product.sku,
            product_name=product.product_name,
            brand=product.brand or "Generic Brand",
            category=product.category or "General Grocery",
            sub_category=product.sub_category or "Miscellaneous",
            price=product.price,
            stock=product.stock or 50,
            aisle=product.aisle or "Aisle A1",
            shelf=product.shelf or "Shelf 1",
            gemma_confidence=confidence,
            verified=True
        )

    # 5. IF NO database match found (foreign/uncataloged item) -> DuckDuckGo Web Search Fallback
    refined_name = identified_name if identified_name else "Uncataloged Item"
    approx_price = 150.0

    try:
        search_query = f"{refined_name} price retail"
        snippets = search_web(search_query)

        # Parse price from web snippets using Gemma or regex fallback
        client = get_ollama_client()
        model_name = os.getenv("GEMMA_MODEL", GEMMA_MODEL)

        prompt = (
            f"Analyze these web snippets for the product '{refined_name}':\n"
            f"{snippets}\n\n"
            f"Extract an estimated retail price in INR/USD as a numeric float and a clean product title.\n"
            f"Reply ONLY with a JSON object: {{\"refined_name\": string, \"approx_price\": float}}"
        )

        try:
            resp = await asyncio.wait_for(
                client.chat(
                    model=model_name,
                    messages=[{"role": "user", "content": prompt}],
                    format="json"
                ),
                timeout=3.0
            )
            content = resp.get("message", {}).get("content", "")
            parsed = json.loads(content)
            if parsed.get("refined_name"):
                refined_name = str(parsed["refined_name"]).strip()
            if parsed.get("approx_price"):
                approx_price = float(parsed["approx_price"])
        except Exception:
            # Regex extraction fallback if LLM synthesis times out
            match = re.search(r'₹?\s*(\d+(?:\.\d{1,2})?)', str(snippets))
            if match:
                val = float(match.group(1))
                if val > 0:
                    approx_price = val
    except Exception as err:
        print(f"Vision web fallback search notice: {err}")

    # Create a deterministic SKU based on the name so identical unknown items stack
    safe_name = re.sub(r'[^A-Z0-9]', '', refined_name.upper())
    fallback_sku = f"WEB-{safe_name[:12]}" if safe_name else "WEB-ITEM"

    return VisionAnalysisResponse(
        sku=fallback_sku,
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
