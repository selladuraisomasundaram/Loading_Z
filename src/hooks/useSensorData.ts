"use client";

import { useEffect, useState } from "react";
import { useCartStore } from "@/store/cartStore";
import { LoadCellData } from "@/types/sensor";
import { getSensorData } from "@/lib/api";

/**
 * Custom Hook for Load Cell Sensor Data Telemetry.
 * 
 * Invokes `getSensorData()` from `src/lib/api.ts`.
 * Supports switching seamlessly between mock sensor telemetry and real backend REST/WebSocket endpoints.
 */
export function useSensorData(): {
  sensorData: LoadCellData;
  tareScale: () => void;
  isLoading: boolean;
} {
  const loadCell = useCartStore((state) => state.loadCell);
  const updateLoadCellWeight = useCartStore(
    (state) => state.updateLoadCellWeight
  );

  const [isLoading, setIsLoading] = useState(false);

  const weightKg = Number((loadCell.currentWeightGrams / 1000).toFixed(3));

  const [sensorData, setSensorData] = useState<LoadCellData>({
    weightKg: isNaN(weightKg) ? 0.205 : weightKg,
    stable: loadCell.isStable,
    connected: true,
    timestamp: "Updated 2 seconds ago",
  });

  useEffect(() => {
    let isMounted = true;

    async function fetchSensor() {
      setIsLoading(true);
      try {
        const response = await getSensorData();
        if (isMounted && response.success && response.sensor) {
          setSensorData(response.sensor);
        }
      } catch (err: unknown) {
        console.warn("Sensor fetch fallback:", err);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }

    fetchSensor();

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    setSensorData((prev) => ({
      ...prev,
      weightKg: isNaN(weightKg) ? 0 : weightKg,
      stable: loadCell.isStable,
      timestamp: loadCell.statusText,
    }));
  }, [weightKg, loadCell.isStable, loadCell.statusText]);

  const tareScale = () => {
    updateLoadCellWeight(0, true);
    setSensorData((prev) => ({
      ...prev,
      weightKg: 0,
      stable: true,
      timestamp: "Just now (Tared)",
    }));
  };

  return {
    sensorData,
    tareScale,
    isLoading,
  };
}
