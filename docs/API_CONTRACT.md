# Smart Trolley API Contract Specification

This document defines the strict API contract between the **Frontend UI Application** and the **FastAPI Backend Server**.

---

## 1. Ownership & Responsibility Matrix

| Area | Frontend Responsibility | Backend Responsibility |
| :--- | :--- | :--- |
| **User Interface** | Next.js layout, Tailwind design system, drag-and-drop dropzone, component views. | *N/A* |
| **State & Navigation** | Client-side Zustand cart state, UI loading spinners, error alerts. | Database persistence, inventory catalog, order storage. |
| **Product Vision AI** | File input capture, preview rendering, dispatching image payload. | Gemma vision inference, feature extraction, object identification. |
| **Catalog & Pricing** | Displaying prices returned by API, subtotal feedback calculations. | **Authoritative pricing source**, barcode/SKU database, verification check. |
| **Recommendations** | Vertical recommendation card display, Add button triggers. | Gemma recommendation model, collaborative filtering, product ranking. |
| **Hardware Telemetry** | Rendering weight (kg), stability badge, timestamp. | ESP32/Raspberry Pi communication, HX711 load cell calibration, WebSocket/API feed. |
| **Checkout** | Triggering checkout request payload, rendering receipt modal. | Final order validation, authoritative tax/discount calculation, order ID creation. |

---

## 2. API Endpoints Specification

---

### Endpoint 1: Product Identification
- **Purpose**: Upload product camera image frame for Gemma AI identification and catalog price verification.
- **HTTP Method**: `POST`
- **URL**: `/api/products/identify`
- **Content-Type**: `multipart/form-data`

#### Request Body
- `image` (file): Binary image file (`image/jpeg`, `image/png`, `image/webp`).

#### Request Example
```http
POST /api/products/identify HTTP/1.1
Host: localhost:8000
Content-Type: multipart/form-data; boundary=----WebKitFormBoundary7MA4YWxkTrZu0gW

------WebKitFormBoundary7MA4YWxkTrZu0gW
Content-Disposition: form-data; name="image"; filename="maggi.jpg"
Content-Type: image/jpeg

[Binary Image Data]
------WebKitFormBoundary7MA4YWxkTrZu0gW--
```

#### Success Response (`200 OK`)
```json
{
  "success": true,
  "product": {
    "product_id": "SKU-001",
    "product_name": "Maggi Noodles",
    "brand": "Nestle",
    "category": "Instant Foods",
    "sub_category": "Noodles",
    "price": 12.0,
    "image_url": null,
    "confidence": 0.96,
    "verified": true,
    "estimatedWeightGrams": 70
  }
}
```

#### Error Responses
- `400 Bad Request`: `{"success": false, "error": "Invalid image format. Supported formats: JPG, PNG, WEBP."}`
- `404 Not Found`: `{"success": false, "error": "Product not found in catalog database."}`
- `500 Internal Error`: `{"success": false, "error": "Gemma vision model inference failed."}`

---

### Endpoint 2: Product Recommendations
- **Purpose**: Fetch AI-recommended product pairings based on active trolley cart items.
- **HTTP Method**: `POST`
- **URL**: `/api/recommendations`
- **Content-Type**: `application/json`

#### Request Body Example
```json
{
  "cart_items": [
    {
      "product_id": "SKU-001",
      "quantity": 2
    }
  ]
}
```

#### Success Response (`200 OK`)
```json
{
  "success": true,
  "recommendations": [
    {
      "product_id": "SKU-100",
      "product_name": "Ketchup",
      "price": 99.0,
      "image_url": null,
      "reason": "Pairs well with items in your cart"
    },
    {
      "product_id": "SKU-101",
      "product_name": "Unsalted Creamery Butter 200g",
      "price": 58.0,
      "image_url": null,
      "reason": "Frequently bought with Sourdough Bread"
    }
  ]
}
```

#### Error Responses
- `500 Internal Error`: `{"success": false, "error": "Recommendations engine unavailable."}`

---

### Endpoint 3: Load Cell Sensor Telemetry
- **Purpose**: Retrieve real-time scale weight readings and stability status.
- **HTTP Method**: `GET`
- **URL**: `/api/sensors/load-cell`
- **Accept**: `application/json`

#### Success Response (`200 OK`)
```json
{
  "success": true,
  "sensor": {
    "weightKg": 0.205,
    "stable": true,
    "connected": true,
    "timestamp": "2026-07-30T10:30:00Z"
  }
}
```

#### Error Responses
- `503 Service Unavailable`: `{"success": false, "error": "Unable to read cart weight sensor."}`

---

### Endpoint 4: Cart Express Checkout
- **Purpose**: Process final checkout order and return authoritative backend financial order receipt.
- **HTTP Method**: `POST`
- **URL**: `/api/cart/checkout`
- **Content-Type**: `application/json`

#### Request Body Example
```json
{
  "items": [
    {
      "product_id": "SKU-001",
      "quantity": 2
    }
  ]
}
```

#### Success Response (`200 OK`)
```json
{
  "success": true,
  "order": {
    "order_id": "ORDER-001",
    "subtotal": 24.0,
    "discount": 0.0,
    "tax": 1.2,
    "total": 25.2
  }
}
```

#### Error Responses
- `400 Bad Request`: `{"success": false, "error": "Cart items list cannot be empty."}`
- `500 Internal Error`: `{"success": false, "error": "Order processing system error."}`

---

## 3. Environment Variable Configuration

The frontend consumes environment variables configured in `.env.local`:

```env
# Backend Base URL
NEXT_PUBLIC_API_URL=http://localhost:8000

# Set to "true" for offline frontend mock development
NEXT_PUBLIC_USE_MOCK_API=true
```
