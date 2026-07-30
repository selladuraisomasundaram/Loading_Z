from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional, List, Dict, Any
from app.agent.orchestrator import orchestrate_message

router = APIRouter()

class ChatRequest(BaseModel):
    message: str
    user_id: Optional[str] = None

class ChatResponse(BaseModel):
    response: str
    tool_activity: List[Dict[str, Any]]
    target_aisle: Optional[str] = None
    route: Optional[Dict[str, Any]] = None
    
    # Frontend compatibility keys
    id: Optional[str] = None
    sender: Optional[str] = None
    text: Optional[str] = None
    timestamp: Optional[str] = None
    toolActivity: Optional[List[Dict[str, Any]]] = None
    targetAisle: Optional[str] = None

@router.post("/assistant/chat", response_model=ChatResponse)
async def assistant_chat(payload: ChatRequest):
    """
    Accepts user chat message payload, orchestrates tool executions,
    synthesizes a natural language response, and logs details.
    """
    if not payload.message.strip():
        raise HTTPException(status_code=400, detail="Message cannot be empty")
        
    try:
        result = await orchestrate_message(payload.message)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Assistant orchestration error: {str(e)}")
