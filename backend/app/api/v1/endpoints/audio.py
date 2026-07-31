import os
import tempfile
import asyncio
import json
from fastapi import APIRouter, HTTPException, UploadFile, File
from fastapi.responses import FileResponse
from pydantic import BaseModel
import logging

from app.agent.orchestrator import orchestrate_message

try:
    import whisper
except ImportError:
    whisper = None

try:
    from gtts import gTTS
except ImportError:
    gTTS = None

router = APIRouter()
logger = logging.getLogger(__name__)

# Lazy load whisper model
_whisper_model = None

def get_whisper_model():
    global _whisper_model
    if whisper is None:
        raise HTTPException(status_code=501, detail="Whisper is not installed. Run: pip install openai-whisper")
    if _whisper_model is None:
        logger.info("Loading Whisper Medium model (this may take a while)...")
        _whisper_model = whisper.load_model("medium")
    return _whisper_model

@router.post("/assistant/audio-chat")
async def audio_chat(audio: UploadFile = File(...)):
    """
    Receives raw audio from the frontend, transcribes it using Whisper,
    passes the text through the RAG orchestrator, and returns a synthesized TTS audio response.
    """
    if whisper is None or gTTS is None:
        raise HTTPException(status_code=501, detail="Required packages (openai-whisper, gTTS, python-multipart) are not installed.")

    # 1. Save uploaded audio to a temporary file
    try:
        suffix = os.path.splitext(audio.filename)[1] if audio.filename else ".webm"
        with tempfile.NamedTemporaryFile(delete=False, suffix=suffix) as tmp_in:
            content = await audio.read()
            tmp_in.write(content)
            tmp_in_path = tmp_in.name
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to save audio file: {str(e)}")

    try:
        # 2. Transcribe audio using Whisper
        model = get_whisper_model()
        logger.info(f"Transcribing audio file: {tmp_in_path}")
        # Whisper requires FFmpeg installed on the system
        result = model.transcribe(tmp_in_path, fp16=False)
        transcribed_text = result.get("text", "").strip()
        
        logger.info(f"Whisper Transcription: '{transcribed_text}'")
        if not transcribed_text:
            raise HTTPException(status_code=400, detail="Voice cannot be read. Please speak clearly into your microphone.")

        # 3. Process text via RAG / Orchestrator
        bot_response = await orchestrate_message(transcribed_text)
        response_text = bot_response.get("response", "I could not understand.")

        # 4. Generate TTS audio response using gTTS
        with tempfile.NamedTemporaryFile(delete=False, suffix=".mp3") as tmp_out:
            tmp_out_path = tmp_out.name
            
        tts = gTTS(text=response_text, lang='en', slow=False)
        tts.save(tmp_out_path)

        # 5. Return the audio file along with custom headers containing the text response data
        # We URL encode the JSON header to avoid invalid HTTP header characters
        import urllib.parse
        headers = {
            "Access-Control-Expose-Headers": "X-Transcribed-Text, X-Bot-Response",
            "X-Transcribed-Text": urllib.parse.quote(transcribed_text),
            "X-Bot-Response": urllib.parse.quote(json.dumps({
                "text": response_text,
                "targetAisle": bot_response.get("target_aisle"),
                "toolActivity": bot_response.get("tool_activity", [])
            }))
        }
        
        return FileResponse(
            path=tmp_out_path, 
            media_type="audio/mpeg", 
            filename="response.mp3",
            headers=headers
        )

    except Exception as e:
        logger.error(f"Audio processing error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Audio processing error: {str(e)}")
        
    finally:
        # Cleanup temporary input file
        if os.path.exists(tmp_in_path):
            try:
                os.remove(tmp_in_path)
            except:
                pass
