from fastapi import APIRouter, Query, Depends
from app.models.product import ProductSchema
from app.core.database import DatabaseEngine
from app.api.deps import get_db

router = APIRouter()

@router.get("/products/resolve", response_model=ProductSchema)
def resolve_product_endpoint(query: str = Query(..., min_length=1, description="Product query name"), db: DatabaseEngine = Depends(get_db)):
    return db.resolve_product(query)

