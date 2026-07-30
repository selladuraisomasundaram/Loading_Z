from fastapi import APIRouter, Query, Depends
from typing import List
from pydantic import BaseModel
from app.navigation.pathfinder import calculate_route
from app.core.database import DatabaseEngine
from app.api.deps import get_db

router = APIRouter()

class NavigationRouteResponse(BaseModel):
    current_location: str
    target_location: str
    waypoints: List[str]
    distance_meters: float

@router.get("/navigation/route", response_model=NavigationRouteResponse)
def get_navigation_route(
    destination: str = Query(..., min_length=1, description="Destination node, product name, or SKU"),
    start: str = Query("ENTRANCE", description="Start node location"),
    db: DatabaseEngine = Depends(get_db)
):
    """
    Calculates a navigation route from start to destination. If destination is a product
    name or SKU, queries the database first to resolve the product's aisle location.
    """
    target_dest = destination.strip()

    # Determine if destination is already a direct/canonical node
    clean_dest = target_dest.upper().replace(" ", "_").replace("-", "_")
    is_direct_node = (
        clean_dest in {"ENTRANCE", "CHECKOUT"} or
        clean_dest.startswith("AISLE")
    )

    if not is_direct_node:
        # Resolve destination as a product/SKU in catalog database
        product = db.resolve_product(target_dest)
        # Use the resolved product's aisle location as destination
        target_dest = product.aisle

    # Calculate route using pathfinder
    route = calculate_route(start, target_dest)

    return NavigationRouteResponse(
        current_location=route["current_location"],
        target_location=route["target_location"],
        waypoints=route["waypoints"],
        distance_meters=route["distance_meters"]
    )
