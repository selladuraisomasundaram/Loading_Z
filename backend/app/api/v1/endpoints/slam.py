from fastapi import APIRouter, WebSocket, WebSocketDisconnect
from typing import List, Dict, Any
import asyncio
import json

router = APIRouter()

# Store active UI connections
class ConnectionManager:
    def __init__(self):
        self.active_connections: List[WebSocket] = []
        self.latest_pose: Dict[str, Any] = {
            "x": 0.0,
            "y": 0.0,
            "theta": 0.0,
            "timestamp": 0.0,
            "status": "waiting" # waiting, active, lost
        }
        self.occupancy_grid: Dict[str, Any] = {
            "resolution": 0.05,
            "origin_x": 0.0,
            "origin_y": 0.0,
            "width": 0,
            "height": 0,
            "data": []
        }

    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.append(websocket)
        # Send latest pose immediately on connect
        await websocket.send_json({"type": "pose", "data": self.latest_pose})

    def disconnect(self, websocket: WebSocket):
        if websocket in self.active_connections:
            self.active_connections.remove(websocket)

    async def broadcast(self, message: dict):
        for connection in self.active_connections:
            try:
                await connection.send_json(message)
            except Exception:
                pass

manager = ConnectionManager()


@router.websocket("/ws/robot")
async def robot_endpoint(websocket: WebSocket):
    """
    WebSocket for the physical robot/SLAM system to push high-frequency poses.
    Expected JSON: {"x": float, "y": float, "theta": float, "timestamp": float}
    """
    await websocket.accept()
    manager.latest_pose["status"] = "active"
    await manager.broadcast({"type": "status", "data": "active"})
    try:
        while True:
            data = await websocket.receive_text()
            try:
                pose_data = json.loads(data)
                # Update latest pose
                manager.latest_pose.update({
                    "x": pose_data.get("x", manager.latest_pose["x"]),
                    "y": pose_data.get("y", manager.latest_pose["y"]),
                    "theta": pose_data.get("theta", manager.latest_pose["theta"]),
                    "timestamp": pose_data.get("timestamp", manager.latest_pose["timestamp"])
                })
                # Broadcast to UI clients
                await manager.broadcast({"type": "pose", "data": manager.latest_pose})
            except json.JSONDecodeError:
                pass
    except WebSocketDisconnect:
        manager.latest_pose["status"] = "lost"
        await manager.broadcast({"type": "status", "data": "lost"})


@router.websocket("/ws/ui")
async def ui_endpoint(websocket: WebSocket):
    """
    WebSocket for the React frontend to receive live poses.
    """
    await manager.connect(websocket)
    try:
        while True:
            # Keep connection alive, UI generally just receives
            await websocket.receive_text()
    except WebSocketDisconnect:
        manager.disconnect(websocket)


@router.post("/map")
async def upload_map(grid_data: dict):
    """
    Upload a 2D Occupancy Grid map from the SLAM system.
    """
    manager.occupancy_grid.update({
        "resolution": grid_data.get("resolution", 0.05),
        "origin_x": grid_data.get("origin_x", 0.0),
        "origin_y": grid_data.get("origin_y", 0.0),
        "width": grid_data.get("width", 0),
        "height": grid_data.get("height", 0),
        "data": grid_data.get("data", [])
    })
    return {"status": "success", "message": "Map updated successfully"}


@router.get("/map")
async def get_map():
    """
    Serve the latest SLAM occupancy grid.
    """
    return manager.occupancy_grid
