import asyncio
import websockets
import json
import time
import math

async def run_mock_robot():
    uri = "ws://localhost:8000/api/v1/slam/ws/robot"
    print(f"Connecting to SLAM API at {uri}...")
    
    try:
        async with websockets.connect(uri) as websocket:
            print("Connected! Starting mock pose stream (10 Hz).")
            
            # Start at a simulated position corresponding roughly to the entrance (150px, 950px in frontend space)
            # Map scale: 20 pixels/meter, so 7.5m, 47.5m
            x = 7.5
            y = 47.5
            theta = -math.pi / 2 # facing "up" (negative y)
            
            # Simulate a square walk
            phase = 0
            speed = 0.5 # meters per second
            dt = 0.1 # 10 Hz
            
            while True:
                timestamp = time.time()
                
                # Move forward in current direction
                x += math.cos(theta) * speed * dt
                y += math.sin(theta) * speed * dt
                
                # Change direction every 10 seconds
                if int(timestamp) % 10 == 0 and timestamp - int(timestamp) < dt:
                    theta += math.pi / 2
                    print(f"Turning! New theta: {theta}")

                pose = {
                    "x": x,
                    "y": y,
                    "theta": theta,
                    "timestamp": timestamp
                }
                
                await websocket.send(json.dumps(pose))
                await asyncio.sleep(dt)
                
    except ConnectionRefusedError:
        print("Connection refused. Is the FastAPI backend running on port 8000?")
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    asyncio.run(run_mock_robot())
