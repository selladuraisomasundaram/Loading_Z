import os
import sys
import time
import json
import socket
import urllib.request
import urllib.parse
import urllib.error

os.environ["GEMMA_TIMEOUT_SECONDS"] = "5.0"

if hasattr(sys.stdout, 'reconfigure'):
    try:
        sys.stdout.reconfigure(encoding='utf-8', errors='replace')
    except Exception:
        pass

BASE_URL = "http://127.0.0.1:8000"

def is_server_running() -> bool:
    try:
        url = f"{BASE_URL}/health"
        req = urllib.request.Request(url, method="GET")
        with urllib.request.urlopen(req, timeout=1.0) as resp:
            return resp.status == 200
    except Exception:
        return False

def safe_print(text: str):
    try:
        print(text, flush=True)
    except UnicodeEncodeError:
        print(text.encode('ascii', errors='backslashreplace').decode('ascii'), flush=True)
    sys.stdout.flush()

def run_tests():
    live_mode = is_server_running()
    client = None
    
    if live_mode:
        safe_print("=== SMART TROLLEY BACKEND INTEGRATION TEST (Live HTTP via urllib) ===")
        safe_print(f"Target URL: {BASE_URL}\n")
    else:
        safe_print("=== SMART TROLLEY BACKEND INTEGRATION TEST (FastAPI TestClient In-Memory) ===")
        safe_print("Note: Live server not detected on port 8000. Running tests via FastAPI TestClient.\n")
        try:
            from fastapi.testclient import TestClient
            from main import app
            client = TestClient(app)
        except Exception as e:
            safe_print(f"Error initializing TestClient: {e}")
            sys.exit(1)

    passed_count = 0
    total_count = 5

    def make_request(method: str, path: str, data=None, headers=None):
        nonlocal client, live_mode
        if live_mode:
            try:
                url = f"{BASE_URL}{path}"
                req = urllib.request.Request(url, data=data, method=method)
                if headers:
                    for k, v in headers.items():
                        req.add_header(k, v)
                with urllib.request.urlopen(req, timeout=5) as resp:
                    return resp.status, json.loads(resp.read().decode('utf-8'))
            except Exception as live_err:
                # Live server request failed, fallback to in-memory TestClient
                live_mode = False

        if client is None:
            from fastapi.testclient import TestClient
            from main import app
            client = TestClient(app)

        kw = {}
        if headers:
            kw["headers"] = headers
        if data:
            if headers and "multipart/form-data" in headers.get("Content-Type", ""):
                kw["content"] = data
            elif isinstance(data, bytes):
                kw["content"] = data
            else:
                kw["data"] = data
        
        if method == "GET":
            r = client.get(path, **kw)
        elif method == "POST":
            r = client.post(path, **kw)
        else:
            r = client.request(method, path, **kw)
        return r.status_code, r.json()

    # 0. GET / (Root Gateway)
    safe_print("[Test 1/6] GET / (Root Gateway)")
    try:
        t0 = time.time()
        status, data = make_request("GET", "/")
        dt = time.time() - t0
        safe_print(f"  Status Code: {status} (in {dt:.3f}s)")
        safe_print(f"  Response Body: {json.dumps(data)}")
        assert status == 200
        assert data.get("system") == "Loading_Z Smart Trolley OS API Gateway"
        assert data.get("status") == "operational"
        assert data.get("version") == "1.0.0"
        safe_print("  => SUCCESS\n")
        passed_count += 1
    except Exception as e:
        safe_print(f"  => FAILED: {e}\n")

    # 1. GET /health
    safe_print("[Test 2/6] GET /health")
    try:
        t0 = time.time()
        status, data = make_request("GET", "/health")
        dt = time.time() - t0
        safe_print(f"  Status Code: {status} (in {dt:.3f}s)")
        safe_print(f"  Response Body: {json.dumps(data)}")
        assert status == 200
        assert "status" in data
        safe_print("  => SUCCESS\n")
        passed_count += 1
    except Exception as e:
        safe_print(f"  => FAILED: {e}\n")

    # 2. POST /api/v1/vision/analyze
    safe_print("[Test 3/6] POST /api/v1/vision/analyze")
    png_bytes = (
        b'\x89PNG\r\n\x1a\n\x00\x00\x00\rIHDR\x00\x00\x00\x01\x00\x00\x00\x01\x08\x06'
        b'\x00\x00\x00\x1f\x15c4\x00\x00\x00\nIDATx\x9cc\x00\x01\x00\x00\x05\x00\x01'
        b'\r\n-\xb4\x00\x00\x00\x00IEND\xaeB`\x82'
    )
    
    try:
        t0 = time.time()
        if live_mode:
            boundary = "----WebKitFormBoundaryAntigravityTest"
            multipart_body = (
                f"--{boundary}\r\n"
                f"Content-Disposition: form-data; name=\"image\"; filename=\"test_image.png\"\r\n"
                f"Content-Type: image/png\r\n\r\n"
            ).encode('utf-8') + png_bytes + f"\r\n--{boundary}--\r\n".encode('utf-8')
            headers = {'Content-Type': f'multipart/form-data; boundary={boundary}'}
            status, data = make_request("POST", "/api/v1/vision/analyze", data=multipart_body, headers=headers)
        else:
            files = {"image": ("test_image.png", png_bytes, "image/png")}
            r = client.post("/api/v1/vision/analyze", files=files)
            status, data = r.status_code, r.json()

        dt = time.time() - t0
        safe_print(f"  Status Code: {status} (in {dt:.3f}s)")
        safe_print(f"  Response Body: {json.dumps(data)}")
        assert status == 200
        assert "sku" in data
        assert "product_name" in data
        assert "price" in data
        safe_print("  => SUCCESS\n")
        passed_count += 1
    except Exception as e:
        safe_print(f"  => FAILED: {e}\n")

    # 3. POST /api/v1/assistant/chat (Catalog Search)
    safe_print("[Test 4/8] POST /api/v1/assistant/chat (Catalog Search)")
    payload = {"message": "Where is Amul Butter?"}
    try:
        t0 = time.time()
        if live_mode:
            json_data = json.dumps(payload).encode('utf-8')
            headers = {'Content-Type': 'application/json'}
            status, data = make_request("POST", "/api/v1/assistant/chat", data=json_data, headers=headers)
        else:
            r = client.post("/api/v1/assistant/chat", json=payload)
            status, data = r.status_code, r.json()

        dt = time.time() - t0
        safe_print(f"  Status Code: {status} (in {dt:.3f}s)")
        body_str = json.dumps(data)
        body_snippet = body_str[:250] + "..." if len(body_str) > 250 else body_str
        safe_print(f"  Response Body: {body_snippet}")
        assert status == 200
        assert "response" in data
        assert "tool_activity" in data
        safe_print("  => SUCCESS\n")
        passed_count += 1
    except Exception as e:
        safe_print(f"  => FAILED: {e}\n")

    # 3b. POST /api/v1/assistant/chat (DuckDuckGo Web Search)
    safe_print("[Test 5/8] POST /api/v1/assistant/chat (DuckDuckGo Web Search)")
    payload_web = {"message": "What are the health benefits of garlic oil?"}
    try:
        t0 = time.time()
        if live_mode:
            json_data = json.dumps(payload_web).encode('utf-8')
            headers = {'Content-Type': 'application/json'}
            status, data = make_request("POST", "/api/v1/assistant/chat", data=json_data, headers=headers)
        else:
            r = client.post("/api/v1/assistant/chat", json=payload_web)
            status, data = r.status_code, r.json()

        dt = time.time() - t0
        safe_print(f"  Status Code: {status} (in {dt:.3f}s)")
        body_str = json.dumps(data)
        body_snippet = body_str[:250] + "..." if len(body_str) > 250 else body_str
        safe_print(f"  Response Body: {body_snippet}")
        assert status == 200
        assert "response" in data
        assert "tool_activity" in data
        safe_print("  => SUCCESS\n")
        passed_count += 1
    except Exception as e:
        safe_print(f"  => FAILED: {e}\n")

    # 4. GET /api/v1/navigation/route?start=ENTRANCE&destination=AISLE_2
    safe_print("[Test 6/8] GET /api/v1/navigation/route?start=ENTRANCE&destination=AISLE_2")
    try:
        t0 = time.time()
        path = "/api/v1/navigation/route?start=ENTRANCE&destination=AISLE_2"
        status, data = make_request("GET", path)
        dt = time.time() - t0
        safe_print(f"  Status Code: {status} (in {dt:.3f}s)")
        safe_print(f"  Response Body: {json.dumps(data)}")
        assert status == 200
        assert data["current_location"] == "ENTRANCE"
        assert data["target_location"] == "AISLE_2"
        assert "waypoints" in data
        safe_print("  => SUCCESS\n")
        passed_count += 1
    except Exception as e:
        safe_print(f"  => FAILED: {e}\n")

    # 5. GET /api/v1/telemetry/weight
    safe_print("[Test 7/8] GET /api/v1/telemetry/weight")
    try:
        t0 = time.time()
        status, data = make_request("GET", "/api/v1/telemetry/weight")
        dt = time.time() - t0
        safe_print(f"  Status Code: {status} (in {dt:.3f}s)")
        safe_print(f"  Response Body: {json.dumps(data)}")
        assert status == 200
        assert "weightKg" in data
        assert data["stable"] is True
        assert data["connected"] is True
        assert "timestamp" in data
        safe_print("  => SUCCESS\n")
        passed_count += 1
    except Exception as e:
        safe_print(f"  => FAILED: {e}\n")

    # 6. Database Engine search_products Direct Check
    safe_print("[Test 8/8] Database Engine search_products & Dataset Metadata")
    try:
        t0 = time.time()
        from app.core.database import search_products
        results = search_products("maggi", limit=3)
        dt = time.time() - t0
        safe_print(f"  Returned {len(results)} items (in {dt:.3f}s)")
        assert len(results) > 0
        first = results[0]
        safe_print(f"  Sample Item: {first.get('product_name')} | Price: {first.get('price')} | Type: {first.get('type')}")
        assert "market_price" in first
        assert "sale_price" in first
        assert "type" in first
        assert "rating" in first
        assert "description" in first
        safe_print("  => SUCCESS\n")
        passed_count += 1
    except Exception as e:
        safe_print(f"  => FAILED: {e}\n")

    total_count = 8
    safe_print(f"=== TEST COMPLETE: {passed_count}/{total_count} PASSED ===")
    if passed_count == total_count:
        safe_print("Integration verification successful!")
        sys.exit(0)
    else:
        safe_print("Integration verification encountered issues.")
        sys.exit(1)

if __name__ == "__main__":
    run_tests()


