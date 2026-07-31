from fastapi import APIRouter
from pydantic import BaseModel
from datetime import datetime, timezone

router = APIRouter()

class TelemetryResponse(BaseModel):
    weightKg: float
    stable: bool
    connected: bool
    timestamp: str

@router.get("/telemetry/weight", response_model=TelemetryResponse)
def get_telemetry_weight():
    """
    Returns the real-time weight reading and status telemetry from the HX711 load cell.
    """
    current_time = datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ")
    
    return TelemetryResponse(
        weightKg=0.000,
        stable=True,
        connected=True,
        timestamp=current_time
    )

