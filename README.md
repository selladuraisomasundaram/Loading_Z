# Loading_Z - Smart Trolley Frontend Application

Gemma AI enabled Smart OS System for Smart Trolley System — **Frontend Application Layer**.

Independent, client-side Next.js + TypeScript + Tailwind CSS application for a hackathon Smart Shopping Trolley ecosystem.

---

## 1. Frontend Responsibility

This repository represents the **standalone user interface** layer for the Smart Trolley system.

### Scope & Role
- **Client State Management**: Manages real-time cart state, item quantities, total calculation, and local weight delta verification using **Zustand**.
- **Interactive UI Cards**: Renders interactive placeholders for live object detection feeds, scale readings, billing summaries, and product recommendations.
- **Strict Decoupling**: Completely isolated from direct hardware logic, AWS/Firebase services, microcontrollers, and inference engines.

### Explicit Non-Responsibilities
As per project requirements, the following modules are **excluded** from this repository and handled independently by backend/hardware engineers:
- Hardware controllers (ESP32, Raspberry Pi, Arduino, HX711 amplifer wiring)
- Microcontroller & MQTT communication drivers
- Backend databases & authentication (AWS, Firebase)
- Edge AI model inference (Gemma / PyTorch / OpenCV pipelines)
- FastAPI / Flask web server services

---

## 2. Local Development

### Prerequisites
- Node.js (v18.x or v20.x recommended)
- npm (v9.x or higher)

### Setup & Run Commands

1. **Install Dependencies**:
   ```bash
   npm install
   ```

2. **Start Development Server**:
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000) in your browser to view the application.

3. **Strict Type Checking**:
   ```bash
   npm run type-check
   ```

4. **Production Build**:
   ```bash
   npm run build
   ```

---

## 3. Project Structure

```text
smart-trolley-frontend/
├── src/
│   ├── app/
│   │   ├── globals.css         # Global Tailwind styles & dark theme baseline
│   │   ├── layout.tsx          # Root Next.js layout configuration
│   │   └── page.tsx            # Main dashboard container referencing placeholder components
│   ├── components/
│   │   ├── dashboard/          # Feature dashboard panel components
│   │   │   ├── BillingSummary.tsx       # Calculated financial breakdown
│   │   │   ├── CartPanel.tsx            # Active item cart container
│   │   │   ├── LoadCellCard.tsx         # HX711 scale weight status card
│   │   │   ├── ProductDetection.tsx     # Camera vision object detection placeholder
│   │   │   ├── RecommendationPanel.tsx  # Smart product recommendations
│   │   │   └── StatusIndicator.tsx      # System & telemetry connection badges
│   │   └── ui/                 # Reusable atomic UI components
│   │       ├── CartItem.tsx             # Individual cart item row with quantity controls
│   │       ├── Header.tsx               # Main top navigation & status header
│   │       └── ImageDropzone.tsx        # Drag & drop image capture mock
│   ├── hooks/
│   │   └── useCart.ts          # Custom hook wrapping Zustand cart state & helpers
│   ├── lib/
│   │   └── utils.ts            # Formatting (currency, weight) & CSS helper utilities
│   ├── store/
│   │   └── cartStore.ts        # Zustand client-side store for cart & load cell state
│   └── types/
│       └── index.ts            # Domain TypeScript interfaces & data contracts
├── .gitignore
├── next.config.mjs
├── package.json
├── postcss.config.mjs
├── tailwind.config.ts
├── tsconfig.json
└── README.md
```

---

## 4. Future Backend Integration

When the backend and hardware teams complete their modules, this frontend will integrate via clean HTTP/REST or WebSocket/MQTT contracts:

1. **Camera AI Product Stream (FastAPI / Gemma Inference)**:
   - Connect `ProductDetection.tsx` to a WebSocket endpoint (e.g. `ws://backend-ip/ws/detections`) or POST image files to `/api/v1/detect`.

2. **Load Cell Scale Data (ESP32 / Raspberry Pi / MQTT)**:
   - Subscribe `cartStore.ts` to real-time weight sensor updates (e.g., via WebSockets or MQTT-over-WebSockets at `wss://backend-ip/mqtt`) to update `loadCell.currentWeightGrams`.

3. **Cloud Database & Express Checkout (AWS / Firebase / FastAPI)**:
   - Connect `BillingSummary.tsx` to `/api/v1/checkout` for payment processing, receipt generation, and inventory synchronization.
