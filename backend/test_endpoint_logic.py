import asyncio
from fastapi import UploadFile
from app.api.v1.endpoints.vision import analyze_vision_frame
from app.core.database import SessionLocal
import io

async def test():
    db = SessionLocal()
    # Create a dummy UploadFile
    file_content = b'fakeimagebytes'
    upload_file = UploadFile(filename="test.jpg", file=io.BytesIO(file_content))
    
    try:
        response = await analyze_vision_frame(image=upload_file, db=db)
        print(response)
    except Exception as e:
        import traceback
        traceback.print_exc()
        
if __name__ == "__main__":
    asyncio.run(test())
