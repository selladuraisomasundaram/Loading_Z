import urllib.request
import urllib.parse
import json
import base64

def test_api():
    url = "http://localhost:8000/api/v1/vision/analyze"
    try:
        with open(r'C:\Users\santh\.gemini\antigravity\brain\d9aaa648-7c56-450f-9909-63dbc8cfd5d0\.user_uploaded\media__1785414876948.png', 'rb') as f:
            img_data = f.read()
    except Exception:
        img_data = b"fake_image_content"

    boundary = "----WebKitFormBoundary7MA4YWxkTrZu0gW"
    
    body = (
        f"--{boundary}\r\n"
        f"Content-Disposition: form-data; name=\"image\"; filename=\"test.png\"\r\n"
        f"Content-Type: image/png\r\n\r\n"
    ).encode('utf-8') + img_data + f"\r\n--{boundary}--\r\n".encode('utf-8')
    
    headers = {
        "Content-Type": f"multipart/form-data; boundary={boundary}"
    }
    
    req = urllib.request.Request(url, data=body, headers=headers, method="POST")
    try:
        with urllib.request.urlopen(req) as response:
            result = response.read().decode('utf-8')
            print(json.dumps(json.loads(result), indent=2))
    except Exception as e:
        print(f"Error: {e}")
        if hasattr(e, 'read'):
            print(e.read().decode('utf-8'))

test_api()
