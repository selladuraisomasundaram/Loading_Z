export interface TurnInstruction {
  stepNumber: number;
  instruction: string;
  distanceMeters: number;
  action: "straight" | "turn_left" | "turn_right" | "arrive";
}

export interface RouteData {
  currentLocation: string;
  targetLocation: string;
  targetProductName?: string;
  waypoints: string[];
  distanceMeters: number;
  estimatedTimeSeconds: number;
  turnInstructions?: TurnInstruction[];
}

export interface AisleZone {
  id: string;
  name: string;
  category: string;
  itemNames: string[];
  gridPosition: { col: number; row: number };
}
