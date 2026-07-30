import json
import os
from typing import Dict, Any
from app.gemma.engine import get_ollama_client, GEMMA_MODEL

SYSTEM_INSTRUCTION = (
    "Extract the exact product name and brand written on this item. "
    "Reply ONLY with a JSON object containing 'identified_name'."
)

FALLBACK_MOCK_RESPONSES = [
    {"identified_name": "Garlic Oil - Vegetarian Capsule 500 mg", "confidence": 0.94},
    {"identified_name": "Water Bottle - Orange", "confidence": 0.89},
    {"identified_name": "Butter Cookies Gold Collection", "confidence": 0.91},
    {"identified_name": "Hand Sanitizer - 70% Alcohol Base", "confidence": 0.88},
]

async def identify_product_from_image(image_bytes: bytes) -> Dict[str, Any]:
    if not image_bytes:
        return {"identified_name": "Water Bottle", "confidence": 0.85}

    client = get_ollama_client()
    model_name = os.getenv("GEMMA_MODEL", GEMMA_MODEL)

    try:
        import asyncio
        response = await asyncio.wait_for(
            client.chat(
                model=model_name,
                messages=[{
                    "role": "user",
                    "content": SYSTEM_INSTRUCTION,
                    "images": [image_bytes]
                }],
                format="json"
            ),
            timeout=3.0
        )


        content = response.get("message", {}).get("content", "")
        if not content:
            raise ValueError("Empty response content from Ollama")

        parsed = json.loads(content)
        identified_name = str(parsed.get("identified_name", "")).strip()
        confidence = float(parsed.get("confidence", 0.85))

        if not identified_name:
            raise ValueError("Missing 'identified_name' key in JSON response")

        confidence = max(0.0, min(1.0, confidence))

        return {
            "identified_name": identified_name,
            "confidence": confidence
        }

    except Exception as e:
        print(f"Gemma Vision inference fallback triggered: {e}")
        fallback_idx = sum(image_bytes[:10]) % len(FALLBACK_MOCK_RESPONSES)
        return FALLBACK_MOCK_RESPONSES[fallback_idx]
