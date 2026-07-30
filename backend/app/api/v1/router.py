from fastapi import APIRouter
from app.api.v1.endpoints import health, products, vision, navigation, assistant, telemetry

api_router = APIRouter()
api_router.include_router(health.router, tags=["health"])
api_router.include_router(products.router, tags=["products"])
api_router.include_router(vision.router, tags=["vision"])
api_router.include_router(navigation.router, tags=["navigation"])
api_router.include_router(assistant.router, tags=["assistant"])
api_router.include_router(telemetry.router, tags=["telemetry"])
