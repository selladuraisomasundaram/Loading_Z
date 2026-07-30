"""Quick test: easyocr on the user's uploaded image."""
from io import BytesIO
from PIL import Image
import numpy as np

raw = open(r'C:\Users\santh\.gemini\antigravity\brain\d9aaa648-7c56-450f-9909-63dbc8cfd5d0\.user_uploaded\media__1785414876948.png', 'rb').read()
img = Image.open(BytesIO(raw)).convert('RGB')
print(f"Image: {img.size}", flush=True)

import easyocr
reader = easyocr.Reader(['en'], gpu=False, verbose=False)
results = reader.readtext(np.array(img))
print(f"\nExtracted {len(results)} text regions:", flush=True)
for bbox, text, conf in results:
    if conf > 0.3:
        print(f"  [{conf:.2f}] {text}")
