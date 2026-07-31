"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { TrackedPerson, PositionConnectionStatus, PersonPosition } from "@/types";

const NOISE_THRESHOLD_PX = 5.0; // Ignore tiny coordinate fluctuations < 5px

const defaultInitialPerson: TrackedPerson = {
  personId: "PERSON-01",
  name: "Customer #01 (Smart Trolley #01)",
  x: 120,
  y: 525,
  zoneId: "ZONE_CHECKOUT",
  aisleId: "Entrance Concourse",
  timestamp: new Date().toLocaleTimeString(),
  status: "Connected",
  history: [{ x: 120, y: 525, timestamp: new Date().toLocaleTimeString() }],
};

const simulatedRouteWaypoints: PersonPosition[] = [
  { personId: "PERSON-01", x: 120, y: 525, zoneId: "ZONE_CHECKOUT", aisleId: "Entrance Concourse", timestamp: "" },
  { personId: "PERSON-01", x: 130, y: 395, zoneId: "ZONE_DAIRY", aisleId: "Aisle C1 - Dairy", timestamp: "" },
  { personId: "PERSON-01", x: 140, y: 395, zoneId: "ZONE_DAIRY", aisleId: "Aisle C1 - Dairy (Micro-jitter)", timestamp: "" }, // Noise test < 5px
  { personId: "PERSON-01", x: 320, y: 245, zoneId: "ZONE_PREPARED_FOOD", aisleId: "Aisle B2 - Food", timestamp: "" },
  { personId: "PERSON-01", x: 510, y: 95, zoneId: "ZONE_SNACKS", aisleId: "Aisle A3 - Biscuits", timestamp: "" },
  { personId: "PERSON-01", x: 710, y: 95, zoneId: "ZONE_BEVERAGES", aisleId: "Aisle A4 - Beverages", timestamp: "" },
  { personId: "PERSON-01", x: 420, y: 280, zoneId: "ZONE_PERSONAL_CARE", aisleId: "Aisle B3 - Personal Care", timestamp: "" },
];

export interface UsePersonPositionStreamOptions {
  autoSimulate?: boolean;
  noiseThreshold?: number;
}

export function usePersonPositionStream(options: UsePersonPositionStreamOptions = {}) {
  const { autoSimulate = false, noiseThreshold = NOISE_THRESHOLD_PX } = options;

  const [trackedPersons, setTrackedPersons] = useState<Record<string, TrackedPerson>>({
    "PERSON-01": defaultInitialPerson,
  });
  const [connectionStatus, setConnectionStatus] = useState<PositionConnectionStatus>("Connected");
  const [isSimulating, setIsSimulating] = useState<boolean>(autoSimulate);
  const waypointIdxRef = useRef<number>(0);

  // Ingestion handler for live backend position stream payloads (Supports multi-person tracking via personId)
  const processIncomingPosition = useCallback(
    (payload: PersonPosition) => {
      const pId = payload.personId || "PERSON-01";
      const nowTs = payload.timestamp || new Date().toLocaleTimeString();

      setTrackedPersons((prev) => {
        const currentPerson = prev[pId] || {
          personId: pId,
          name: `Customer (${pId})`,
          x: payload.x,
          y: payload.y,
          zoneId: payload.zoneId,
          aisleId: payload.aisleId,
          timestamp: nowTs,
          status: "Tracking",
          history: [],
        };

        // Euclidean noise filter: ignore tiny coordinate fluctuations < noiseThreshold px
        const dist = Math.hypot(payload.x - currentPerson.x, payload.y - currentPerson.y);
        if (currentPerson.history.length > 0 && dist < noiseThreshold) {
          // Micro fluctuation filtered out
          return prev;
        }

        const updatedHistory = [
          ...currentPerson.history.slice(-15),
          { x: payload.x, y: payload.y, timestamp: nowTs },
        ];

        return {
          ...prev,
          [pId]: {
            ...currentPerson,
            x: payload.x,
            y: payload.y,
            zoneId: payload.zoneId,
            aisleId: payload.aisleId,
            timestamp: nowTs,
            status: "Tracking",
            history: updatedHistory,
          },
        };
      });

      setConnectionStatus("Tracking");
    },
    [noiseThreshold]
  );

  // Simulated Real-Time Stream Timer
  useEffect(() => {
    if (!isSimulating) return;

    setConnectionStatus("Connecting");
    const connectTimer = setTimeout(() => {
      setConnectionStatus("Tracking");
    }, 600);

    const streamInterval = setInterval(() => {
      waypointIdxRef.current = (waypointIdxRef.current + 1) % simulatedRouteWaypoints.length;
      const rawWp = simulatedRouteWaypoints[waypointIdxRef.current]!;
      const payload: PersonPosition = {
        ...rawWp,
        timestamp: new Date().toLocaleTimeString(),
      };
      processIncomingPosition(payload);
    }, 2500);

    return () => {
      clearTimeout(connectTimer);
      clearInterval(streamInterval);
    };
  }, [isSimulating, processIncomingPosition]);

  // Manual real-time movement handler (WASD / Arrow keys / D-Pad) with collision detection
  const moveActivePerson = useCallback((dx: number, dy: number) => {
    const pId = "PERSON-01";

    setTrackedPersons((prev) => {
      const current = prev[pId] || defaultInitialPerson;
      let targetX = current.x + dx;
      let targetY = current.y + dy;

      let finalX = current.x;
      let finalY = current.y;

      // 1. Try full diagonal move
      if (isWalkablePosition(targetX, targetY)) {
        finalX = targetX;
        finalY = targetY;
      }
      // 2. Wall sliding: try horizontal move only
      else if (isWalkablePosition(targetX, current.y)) {
        finalX = targetX;
      }
      // 3. Wall sliding: try vertical move only
      else if (isWalkablePosition(current.x, targetY)) {
        finalY = targetY;
      }
      // Fully blocked by shelf/wall
      else {
        return prev;
      }

      const nowTs = new Date().toLocaleTimeString();
      const locInfo = getZoneAndAisleName(finalX, finalY);

      const updatedHistory = [
        ...current.history.slice(-25),
        { x: finalX, y: finalY, timestamp: nowTs },
      ];

      return {
        ...prev,
        [pId]: {
          ...current,
          x: finalX,
          y: finalY,
          zoneId: locInfo.zoneId,
          aisleId: locInfo.aisleId,
          timestamp: nowTs,
          status: "Tracking",
          history: updatedHistory,
        },
      };
    });

    setConnectionStatus("Tracking");
  }, []);

  return {
    trackedPersons,
    activePerson: trackedPersons["PERSON-01"] || defaultInitialPerson,
    connectionStatus,
    setConnectionStatus,
    isSimulating,
    setIsSimulating,
    processIncomingPosition,
    moveActivePerson,
  };
}

import { isWalkablePosition } from "@/lib/navigation/navigationGraph";

function getZoneAndAisleName(x: number, y: number): { zoneId: string; aisleId: string } {
  if (y >= 480) return { zoneId: "ZONE_CHECKOUT", aisleId: "Main Concourse" };
  if (y <= 120) return { zoneId: "ZONE_SNACKS", aisleId: "Top Concourse" };
  if (x <= 180) return { zoneId: "ZONE_WEST", aisleId: "West Corridor" };
  if (x >= 700) return { zoneId: "ZONE_EAST", aisleId: "East Corridor" };
  if (y >= 320 && y <= 480) return { zoneId: "ZONE_DAIRY", aisleId: "Aisle Row C" };
  if (y >= 170 && y <= 320) return { zoneId: "ZONE_GROCERY", aisleId: "Aisle Row B" };
  return { zoneId: "ZONE_CENTRAL", aisleId: "Central Spine" };
}

export default usePersonPositionStream;
