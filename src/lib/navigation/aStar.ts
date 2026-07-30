import {
  NavigationGraph,
  NavigationNode,
  AStarResult,
} from "@/types";
import { calculateDistance } from "./navigationGraph";

interface AStarNodeState {
  id: string;
  g: number; // Cost from start node to current node
  h: number; // Heuristic estimated cost from current node to goal node
  f: number; // Total estimated cost: f = g + h
  parent: string | null;
}

/**
 * Finds the nearest walkable corridor navigation node to any map coordinate (x, y).
 */
export function findNearestWalkableNode(
  graph: NavigationGraph,
  x: number,
  y: number
): NavigationNode {
  const nodes = Object.values(graph.nodes);
  let minDistance = Infinity;
  let nearestNode = nodes[0]!;

  for (const node of nodes) {
    const dist = Math.hypot(node.x - x, node.y - y);
    if (dist < minDistance) {
      minDistance = dist;
      nearestNode = node;
    }
  }

  return nearestNode;
}

/**
 * A* Pathfinding Algorithm Implementation for Indoor Supermarket Navigation.
 * 
 * Cost Formula: f(n) = g(n) + h(n)
 * Heuristic h(n): 2D Euclidean Distance to goal node.
 */
export function findShortestPathAStar(
  graph: NavigationGraph,
  startNodeId: string,
  goalNodeId: string
): AStarResult {
  const nodes = graph.nodes;
  const startNode = nodes[startNodeId];
  const goalNode = nodes[goalNodeId];

  if (!startNode || !goalNode) {
    return {
      pathNodeIds: [],
      waypoints: [],
      totalDistanceMeters: 0,
      estimatedTimeSeconds: 0,
      success: false,
      error: "Invalid start or destination node specified.",
    };
  }

  if (startNodeId === goalNodeId) {
    return {
      pathNodeIds: [startNodeId],
      waypoints: [{ x: startNode.x, y: startNode.y }],
      totalDistanceMeters: 0,
      estimatedTimeSeconds: 0,
      success: true,
    };
  }

  // Open set and closed set tracking
  const openSet = new Set<string>([startNodeId]);
  const closedSet = new Set<string>();

  const stateMap: Record<string, AStarNodeState> = {};
  stateMap[startNodeId] = {
    id: startNodeId,
    g: 0,
    h: calculateDistance(startNode, goalNode),
    f: calculateDistance(startNode, goalNode),
    parent: null,
  };

  // Build adjacency list for quick lookup
  const adjMap: Record<string, Array<{ to: string; distance: number }>> = {};
  graph.edges.forEach((edge) => {
    if (!adjMap[edge.from]) adjMap[edge.from] = [];
    adjMap[edge.from]!.push({ to: edge.to, distance: edge.distance });
  });

  while (openSet.size > 0) {
    // Pick node with lowest f score in openSet
    let currentId: string | null = null;
    let lowestF = Infinity;

    for (const nodeId of openSet) {
      const st = stateMap[nodeId];
      if (st && st.f < lowestF) {
        lowestF = st.f;
        currentId = nodeId;
      }
    }

    if (!currentId) break;

    // Goal Reached! Reconstruct Path
    if (currentId === goalNodeId) {
      const pathNodeIds: string[] = [];
      let curr: string | null = goalNodeId;

      while (curr !== null) {
        pathNodeIds.unshift(curr);
        curr = stateMap[curr]?.parent || null;
      }

      const waypoints = pathNodeIds
        .map((id) => nodes[id])
        .filter((n): n is NavigationNode => Boolean(n))
        .map((n) => ({ x: n.x, y: n.y }));

      // Calculate total SVG distance in map units
      const svgDistance = stateMap[goalNodeId]?.g || 0;
      // Calibration: 1 SVG unit ~ 0.05 meters (e.g. 300 SVG units = 15m)
      const totalDistanceMeters = Number((svgDistance * 0.05).toFixed(1));
      // Average walking speed ~ 1.2 m/sec
      const estimatedTimeSeconds = Math.max(
        5,
        Math.round(totalDistanceMeters / 1.2)
      );

      return {
        pathNodeIds,
        waypoints,
        totalDistanceMeters,
        estimatedTimeSeconds,
        success: true,
      };
    }

    openSet.delete(currentId);
    closedSet.add(currentId);

    const currentState = stateMap[currentId]!;
    const neighbors = adjMap[currentId] || [];

    for (const neighbor of neighbors) {
      const neighborId = neighbor.to;
      if (closedSet.has(neighborId)) continue;

      const neighborNode = nodes[neighborId];
      if (!neighborNode) continue;

      const tentativeG = currentState.g + neighbor.distance;

      if (!openSet.has(neighborId)) {
        openSet.add(neighborId);
      } else {
        const existingState = stateMap[neighborId];
        if (existingState && tentativeG >= existingState.g) {
          continue; // Not a better path
        }
      }

      const h = calculateDistance(neighborNode, goalNode);
      stateMap[neighborId] = {
        id: neighborId,
        g: tentativeG,
        h,
        f: tentativeG + h,
        parent: currentId,
      };
    }
  }

  return {
    pathNodeIds: [],
    waypoints: [],
    totalDistanceMeters: 0,
    estimatedTimeSeconds: 0,
    success: false,
    error: "No walkable route found between specified points.",
  };
}
