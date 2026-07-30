from fastapi import FastAPI, File, UploadFile, Depends
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from app.core.config import settings
from app.api.v1.router import api_router
from app.api.v1.endpoints.vision import analyze_vision_frame
from app.api.v1.endpoints.recommendations import generate_recommendations, GeneratePayload
from app.api.deps import get_db

app = FastAPI(
    title=settings.PROJECT_NAME,
    openapi_url=f"{settings.API_V1_STR}/openapi.json"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def root_gateway():
    return {
        "system": "Loading_Z Smart Trolley OS API Gateway",
        "status": "operational",
        "version": "1.0.0"
    }

@app.get("/health")
def root_health():
    return {"status": "ok", "service": settings.PROJECT_NAME}

# Include API v1 router under /api/v1
app.include_router(api_router, prefix=settings.API_V1_STR)

# Legacy alias routes for frontend compatibility
@app.post("/api/products/identify")
async def legacy_identify_product(image: UploadFile = File(...), db: Session = Depends(get_db)):
    return await analyze_vision_frame(image=image, db=db)

@app.post("/api/recommendations/generate")
async def legacy_recommendations(payload: GeneratePayload):
    return await generate_recommendations(payload)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="127.0.0.1", port=8000, reload=True)
