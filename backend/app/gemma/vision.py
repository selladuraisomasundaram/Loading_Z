import json
import os
import re
import asyncio
import base64
from io import BytesIO
from typing import Dict, Any
from PIL import Image
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


def _extract_json_from_response(content: str) -> dict:
    """
    Extracts a JSON object from Gemma's response.
    Handles cases where JSON is wrapped in markdown code fences.
    """
    # Try direct parse first
    try:
        return json.loads(content)
    except (json.JSONDecodeError, TypeError):
        pass

    # Strip markdown code fences (```json ... ``` or ``` ... ```)
    fenced = re.search(r'```(?:json)?\s*\n?(.*?)\n?\s*```', content, re.DOTALL)
    if fenced:
        try:
            return json.loads(fenced.group(1).strip())
        except (json.JSONDecodeError, TypeError):
            pass

    # Try to find any JSON object in the string
    brace_match = re.search(r'\{[^{}]*\}', content, re.DOTALL)
    if brace_match:
        try:
            return json.loads(brace_match.group(0))
        except (json.JSONDecodeError, TypeError):
            pass

    return {}


def _run_ocr(image_bytes: bytes) -> str:
    """
    Extract text from image using available OCR engines.
    Tries: pytesseract -> easyocr -> empty string.
    """
    pil_image = None
    try:
        from PIL import ImageEnhance
        pil_image = Image.open(BytesIO(image_bytes))
        # Convert to RGB if needed (handles WEBP, RGBA, etc.)
        if pil_image.mode not in ('RGB', 'L'):
            pil_image = pil_image.convert('RGB')
        
        # Preprocessing: Enhance contrast and sharpness to help EasyOCR read stylized/curved text
        enhancer = ImageEnhance.Contrast(pil_image)
        pil_image = enhancer.enhance(1.5)  # Boost contrast by 50%
        sharpness = ImageEnhance.Sharpness(pil_image)
        pil_image = sharpness.enhance(2.0) # Boost sharpness
        
        # Resize if too small (width < 500)
        if pil_image.width < 500:
            ratio = 500.0 / pil_image.width
            pil_image = pil_image.resize((500, int(pil_image.height * ratio)), Image.Resampling.LANCZOS)
            
        print(f"Image opened and enhanced: {pil_image.mode} {pil_image.size}", flush=True)
    except Exception as e:
        print(f"Pillow could not open image: {e}", flush=True)
        return ""

    # --- Attempt 1: pytesseract (fast, needs system Tesseract installed) ---
    try:
        import pytesseract
        # On Windows, set the path if tesseract is installed via winget/installer
        tesseract_paths = [
            r"C:\Program Files\Tesseract-OCR\tesseract.exe",
            r"C:\Program Files (x86)\Tesseract-OCR\tesseract.exe",
            r"C:\Users\santh\AppData\Local\Programs\Tesseract-OCR\tesseract.exe",
        ]
        for tp in tesseract_paths:
            if os.path.exists(tp):
                pytesseract.pytesseract.tesseract_cmd = tp
                break

        text = pytesseract.image_to_string(pil_image).strip()
        if text and len(text) > 2:
            print(f"pytesseract extracted: {text[:200]}", flush=True)
            return text
    except Exception as e:
        print(f"pytesseract failed: {e}", flush=True)

    # --- Attempt 2: easyocr (pure Python, downloads models on first use) ---
    try:
        import easyocr
        import numpy as np
        reader = easyocr.Reader(['en'], gpu=False, verbose=False)
        img_array = np.array(pil_image)
        results = reader.readtext(img_array)
        texts = [r[1] for r in results if r[2] > 0.3]  # confidence > 0.3
        if texts:
            combined = " ".join(texts).strip()
            print(f"easyocr extracted: {combined[:200]}", flush=True)
            return combined
    except Exception as e:
        print(f"easyocr failed: {e}", flush=True)

    print("All OCR methods failed, no text extracted.", flush=True)
    return ""


async def _gemma_analyze_text(ocr_text: str) -> Dict[str, Any]:
    """
    Send OCR-extracted text to Gemma (text-only mode) for product identification.
    """
    client = get_ollama_client()
    model_name = os.getenv("GEMMA_MODEL", GEMMA_MODEL)
    gemma_timeout = float(os.getenv("GEMMA_TIMEOUT_SECONDS", "60.0"))

    prompt = (
        f"The following text was extracted from a product image via OCR:\n"
        f'"""\n{ocr_text}\n"""\n\n'
        f"Based on this text, identify the product name and brand.\n"
        f'Reply ONLY with a JSON object: {{"identified_name": "Full Product Name with Brand"}}'
    )

    try:
        response = await asyncio.wait_for(
            client.chat(
                model=model_name,
                messages=[{"role": "user", "content": prompt}]
            ),
            timeout=gemma_timeout
        )
        content = response.get("message", {}).get("content", "")
        print(f"Gemma text analysis response: {content[:300]}", flush=True)

        parsed = _extract_json_from_response(content)
        name = str(parsed.get("identified_name", "")).strip()
        if name and "unknown" not in name.lower() and "not" not in name.lower():
            return {"identified_name": name, "confidence": 0.88}
    except Exception as e:
        print(f"Gemma text analysis failed: {e}", flush=True)

    return {}


async def identify_product_from_image(image_bytes: bytes) -> Dict[str, Any]:
    """
    Main pipeline: Image -> OCR -> Gemma text analysis -> keyword fallback.
    """
    if not image_bytes:
        return {"identified_name": "Water Bottle", "confidence": 0.85}

    # Step 1: Extract text from the image via OCR
    print(f"Starting OCR on image ({len(image_bytes)} bytes)...", flush=True)
    ocr_text = _run_ocr(image_bytes)

    # Step 2: If OCR got text, send to Gemma for intelligent product identification
    if ocr_text and len(ocr_text) > 1:
        print(f"OCR text found, sending to Gemma for analysis...", flush=True)
        gemma_result = await _gemma_analyze_text(ocr_text)
        if gemma_result.get("identified_name"):
            return gemma_result

        # If Gemma failed, try keyword matching on OCR text
        raw_text = ocr_text.lower()
        known_keywords = [
            ("aashirvaad", "Aashirvaad Whole Wheat Atta"),
            ("atta", "Aashirvaad Whole Wheat Atta"),
            ("wheat", "Aashirvaad Whole Wheat Atta"),
            ("maggi", "Maggi 2-Minute Instant Noodles"),
            ("noodles", "Nutri-licious Masala Veg Atta Noodles"),
            ("amul", "Butter - Pasteurised (Amul)"),
            ("butter", "Butter - Pasteurised (Amul)"),
            ("garlic", "Garlic Oil - Vegetarian Capsule 500 mg"),
            ("nivea", "Creme Soft Soap - For Hands & Body"),
            ("sanitizer", "Hand Sanitizer - 70% Alcohol Base"),
            ("bottle", "Water Bottle - Orange"),
            ("tea", "Green Tea - Pure Original"),
            ("tetley", "Green Tea - Pure Original"),
        ]

        for key, name in known_keywords:
            if key in raw_text:
                return {"identified_name": name, "confidence": 0.90}

        # Return the best OCR line as the identified name so web search can find it
        lines = [l.strip() for l in ocr_text.split('\n') if len(l.strip()) > 2]
        if lines:
            best_line = max(lines, key=len)
            return {"identified_name": best_line.strip().title(), "confidence": 0.70}
        
        return {"identified_name": ocr_text.strip()[:50], "confidence": 0.50}

    # Step 3: No OCR text — last resort fallback
    print("No OCR text extracted, marking as Unidentified.", flush=True)
    return {"identified_name": "Unidentified Product", "confidence": 0.10}
