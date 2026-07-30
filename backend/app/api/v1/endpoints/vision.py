from fastapi import APIRouter, File, UploadFile, Depends
from app.gemma.vision import identify_product_from_image
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
    Accepts an uploaded image file, processes it via Gemma Vision, resolves the identified
    item against the product catalog database, and returns the verified product SKU details.
    """
    # 1. Read raw image frame bytes
    image_bytes = await image.read()

    # 2. Run through Gemma Vision Client
    vision_result = await identify_product_from_image(image_bytes)
    identified_name = vision_result.get("identified_name", "")
    confidence = vision_result.get("confidence", 0.0)

    # 3. Resolve the item in catalog database
    product = db.resolve_product(identified_name)

    # 4. Return response matching frontend contract
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
        verified=product.verified
    )
