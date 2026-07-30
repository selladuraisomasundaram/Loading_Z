"use client";

import { useCartStore } from "@/store/cartStore";
import { LoadCellData } from "@/types/sensor";

/**
 * Custom Hook for Load Cell Sensor Data Telemetry.
 * 
 * BACKEND INTEGRATION NOTE FOR TEAM:
 * This mock implementation currently reads the active cart weight and calculates weight in Kg.
 * To integrate live hardware telemetry from ESP32 / Raspberry Pi:
 * 1. Connect a WebSocket inside useEffect:
 *    const ws = new WebSocket("ws://localhost:8000/ws/loadcell");
 *    ws.onmessage = (event) => setSensorData(JSON.parse(event.data));
 * 2. Return the live `sensorData` object.
 * 
 * @returns { sensorData: LoadCellData, tareScale: () => void }
 */
export function useSensorData(): {
  sensorData: LoadCellData;
  tareScale: () => void;
} {
  const loadCell = useCartStore((state) => state.loadCell);
  const updateLoadCellWeight = useCartStore(
    (state) => state.updateLoadCellWeight
  );

  // Compute weight in Kg rounded to 3 decimal places (e.g., 205g -> 0.205 kg)
  const weightKg = Number((loadCell.currentWeightGrams / 1000).toFixed(3));

  const sensorData: LoadCellData = {
    weightKg: isNaN(weightKg) ? 0.205 : weightKg,
    stable: loadCell.isStable,
    connected: true,
    timestamp: "Updated 2 seconds ago",
  };

  const tareScale = () => {
    updateLoadCellWeight(0, true);
  };

  return {
    sensorData,
    tareScale,
  };
}
