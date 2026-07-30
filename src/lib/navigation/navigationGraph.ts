import { NavigationGraph, NavigationNode, NavigationEdge } from "@/types";

export function calculateDistance(
  n1: { x: number; y: number },
  n2: { x: number; y: number }
): number {
  return Math.hypot(n2.x - n1.x, n2.y - n1.y);
}

const rawNodes: NavigationNode[] = [
  // Gateway Nodes
  { id: "N_ENTRANCE", name: "Entrance Gateway", x: 150, y: 535, type: "entrance" },
  { id: "N_CHECKOUT", name: "Checkout Counters", x: 680, y: 535, type: "checkout" },

  // Main Walkway Intersections (Bottom Corridor)
  { id: "N_CORRIDOR_BOTTOM_1", name: "Corridor Entrance Junction", x: 150, y: 480, type: "intersection" },
  { id: "N_CORRIDOR_BOTTOM_2", name: "Corridor Junction 2", x: 340, y: 480, type: "intersection" },
  { id: "N_CORRIDOR_BOTTOM_3", name: "Corridor Junction 3", x: 530, y: 480, type: "intersection" },
  { id: "N_CORRIDOR_BOTTOM_4", name: "Corridor Checkout Junction", x: 720, y: 480, type: "intersection" },

  // Top Corridor Intersections
  { id: "N_CORRIDOR_TOP_1", name: "Top Corridor 1", x: 150, y: 45, type: "intersection" },
  { id: "N_CORRIDOR_TOP_2", name: "Top Corridor 2", x: 340, y: 45, type: "intersection" },
  { id: "N_CORRIDOR_TOP_3", name: "Top Corridor 3", x: 530, y: 45, type: "intersection" },
  { id: "N_CORRIDOR_TOP_4", name: "Top Corridor 4", x: 720, y: 45, type: "intersection" },

  // Aisle Walkable Access Nodes (Placed strictly in open walkways adjacent to aisles)
  { id: "N_AISLE_A1", name: "Aisle A1 Access", x: 150, y: 125, type: "aisle", aisleId: "A1" },
  { id: "N_AISLE_A2", name: "Aisle A2 Access", x: 340, y: 125, type: "aisle", aisleId: "A2" },
  { id: "N_AISLE_A3", name: "Aisle A3 Access", x: 530, y: 125, type: "aisle", aisleId: "A3" },
  { id: "N_AISLE_A4", name: "Aisle A4 Access", x: 720, y: 125, type: "aisle", aisleId: "A4" },

  { id: "N_AISLE_B1", name: "Aisle B1 Access", x: 150, y: 275, type: "aisle", aisleId: "B1" },
  { id: "N_AISLE_B2", name: "Aisle B2 Access", x: 340, y: 275, type: "aisle", aisleId: "B2" },
  { id: "N_AISLE_B3", name: "Aisle B3 Access", x: 530, y: 275, type: "aisle", aisleId: "B3" },
  { id: "N_AISLE_B4", name: "Aisle B4 Access", x: 720, y: 275, type: "aisle", aisleId: "B4" },

  { id: "N_AISLE_C1", name: "Aisle C1 Access", x: 150, y: 425, type: "aisle", aisleId: "C1" },
  { id: "N_AISLE_C2", name: "Aisle C2 Access", x: 340, y: 425, type: "aisle", aisleId: "C2" },
  { id: "N_AISLE_C3", name: "Aisle C3 Access", x: 530, y: 425, type: "aisle", aisleId: "C3" },
  { id: "N_AISLE_C4", name: "Aisle C4 Access", x: 720, y: 425, type: "aisle", aisleId: "C4" },
];

const nodeMap: Record<string, NavigationNode> = rawNodes.reduce(
  (acc, curr) => ({ ...acc, [curr.id]: curr }),
  {}
);

// Undirected Walkable Edges (No connections crossing shelves)
const rawEdgeConnections: Array<[string, string]> = [
  // Entrance & Checkout Connections
  ["N_ENTRANCE", "N_CORRIDOR_BOTTOM_1"],
  ["N_CHECKOUT", "N_CORRIDOR_BOTTOM_4"],

  // Horizontal Bottom Corridor Walkway
  ["N_CORRIDOR_BOTTOM_1", "N_CORRIDOR_BOTTOM_2"],
  ["N_CORRIDOR_BOTTOM_2", "N_CORRIDOR_BOTTOM_3"],
  ["N_CORRIDOR_BOTTOM_3", "N_CORRIDOR_BOTTOM_4"],

  // Horizontal Top Corridor Walkway
  ["N_CORRIDOR_TOP_1", "N_CORRIDOR_TOP_2"],
  ["N_CORRIDOR_TOP_2", "N_CORRIDOR_TOP_3"],
  ["N_CORRIDOR_TOP_3", "N_CORRIDOR_TOP_4"],

  // Vertical Corridor Column 1 (Left Walkway)
  ["N_CORRIDOR_TOP_1", "N_AISLE_A1"],
  ["N_AISLE_A1", "N_AISLE_B1"],
  ["N_AISLE_B1", "N_AISLE_C1"],
  ["N_AISLE_C1", "N_CORRIDOR_BOTTOM_1"],

  // Vertical Corridor Column 2 (Mid-Left Walkway)
  ["N_CORRIDOR_TOP_2", "N_AISLE_A2"],
  ["N_AISLE_A2", "N_AISLE_B2"],
  ["N_AISLE_B2", "N_AISLE_C2"],
  ["N_AISLE_C2", "N_CORRIDOR_BOTTOM_2"],

  // Vertical Corridor Column 3 (Mid-Right Walkway)
  ["N_CORRIDOR_TOP_3", "N_AISLE_A3"],
  ["N_AISLE_A3", "N_AISLE_B3"],
  ["N_AISLE_B3", "N_AISLE_C3"],
  ["N_AISLE_C3", "N_CORRIDOR_BOTTOM_3"],

  // Vertical Corridor Column 4 (Right Walkway)
  ["N_CORRIDOR_TOP_4", "N_AISLE_A4"],
  ["N_AISLE_A4", "N_AISLE_B4"],
  ["N_AISLE_B4", "N_AISLE_C4"],
  ["N_AISLE_C4", "N_CORRIDOR_BOTTOM_4"],
];

const edges: NavigationEdge[] = [];
rawEdgeConnections.forEach(([from, to]) => {
  const n1 = nodeMap[from];
  const n2 = nodeMap[to];
  if (n1 && n2) {
    const dist = calculateDistance(n1, n2);
    // Add bidirectionally
    edges.push({ from, to, distance: dist });
    edges.push({ from: to, to: from, distance: dist });
  }
});

export const supermarketGraph: NavigationGraph = {
  nodes: nodeMap,
  edges,
};
