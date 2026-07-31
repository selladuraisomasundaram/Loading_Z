export type NodeType =
  | "entrance"
  | "aisle"
  | "intersection"
  | "checkout"
  | "product";

export interface NavigationNode {
  id: string;
  name: string;
  x: number;
  y: number;
  type: NodeType;
  aisleId?: string;
}

export interface NavigationEdge {
  from: string;
  to: string;
  distance: number;
}

export interface NavigationGraph {
  nodes: Record<string, NavigationNode>;
  edges: NavigationEdge[];
}

import { TurnInstruction } from "./navigation";

export interface AStarResult {
  pathNodeIds: string[];
  waypoints: Array<{ x: number; y: number }>;
  totalDistanceMeters: number;
  estimatedTimeSeconds: number;
  turnInstructions?: TurnInstruction[];
  isArrived?: boolean;
  isOffRoute?: boolean;
  success: boolean;
  error?: string;
}
