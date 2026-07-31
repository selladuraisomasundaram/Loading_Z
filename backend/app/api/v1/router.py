from fastapi import APIRouter
from app.api.v1.endpoints import health, products, vision, navigation, assistant, telemetry, recommendations, audio, slam

api_router = APIRouter()
api_router.include_router(health.router, tags=["health"])
api_router.include_router(products.router, tags=["products"])
api_router.include_router(vision.router, tags=["vision"])
api_router.include_router(navigation.router, tags=["navigation"])
api_router.include_router(assistant.router, tags=["assistant"])
api_router.include_router(audio.router, tags=["assistant-audio"])
api_router.include_router(telemetry.router, tags=["telemetry"])
api_router.include_router(recommendations.router, prefix="/recommendations", tags=["recommendations"])
api_router.include_router(slam.router, prefix="/slam", tags=["slam"])
