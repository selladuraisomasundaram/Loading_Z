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

      const turnInstructions = generateTurnInstructions(pathNodeIds, waypoints, graph);

      return {
        pathNodeIds,
        waypoints,
        totalDistanceMeters,
        estimatedTimeSeconds,
        turnInstructions,
        isArrived: false,
        isOffRoute: false,
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

import { TurnInstruction } from "@/types/navigation";

export const DEFAULT_WALKING_SPEED_M_PER_SEC = 1.2;

/**
 * Calculates remaining walking distance in meters along exact waypoints sequence.
 */
export function calculatePathDistance(
  waypoints: Array<{ x: number; y: number }>,
  walkingSpeedMetersPerSec: number = DEFAULT_WALKING_SPEED_M_PER_SEC
): { totalSvgDistance: number; totalDistanceMeters: number; estimatedTimeSeconds: number } {
  if (waypoints.length < 2) {
    return { totalSvgDistance: 0, totalDistanceMeters: 0, estimatedTimeSeconds: 0 };
  }

  let totalSvgDistance = 0;
  for (let i = 0; i < waypoints.length - 1; i++) {
    totalSvgDistance += calculateDistance(waypoints[i]!, waypoints[i + 1]!);
  }

  const totalDistanceMeters = Number((totalSvgDistance * 0.05).toFixed(1));
  const estimatedTimeSeconds = Math.max(3, Math.round(totalDistanceMeters / walkingSpeedMetersPerSec));

  return { totalSvgDistance, totalDistanceMeters, estimatedTimeSeconds };
}

/**
 * Generates lightweight turn-by-turn navigation instructions for supermarket customer guidance.
 */
export function generateTurnInstructions(
  pathNodeIds: string[],
  waypoints: Array<{ x: number; y: number }>,
  graph: NavigationGraph,
  destinationName: string = "Target Item"
): TurnInstruction[] {
  const instructions: TurnInstruction[] = [];
  if (waypoints.length < 2) return instructions;

  const firstNode = graph.nodes[pathNodeIds[0] || ""];
  const startDesc = firstNode?.name || "current location";
  instructions.push({
    stepNumber: 1,
    instruction: `Start walking from ${startDesc} along the main corridor`,
    distanceMeters: Number((calculateDistance(waypoints[0]!, waypoints[Math.min(1, waypoints.length - 1)]!) * 0.05).toFixed(1)),
    action: "straight",
  });

  for (let i = 1; i < pathNodeIds.length - 1; i++) {
    const prev = waypoints[i - 1]!;
    const curr = waypoints[i]!;
    const next = waypoints[i + 1]!;
    const node = graph.nodes[pathNodeIds[i]!];

    const dx1 = curr.x - prev.x;
    const dy1 = curr.y - prev.y;
    const dx2 = next.x - curr.x;
    const dy2 = next.y - curr.y;
    const cross = dx1 * dy2 - dy1 * dx2;

    let action: "turn_left" | "turn_right" | "straight" = "straight";
    let turnLabel = "Continue straight";

    if (cross > 50) {
      action = "turn_right";
      turnLabel = "Turn right";
    } else if (cross < -50) {
      action = "turn_left";
      turnLabel = "Turn left";
    }

    if (action !== "straight") {
      instructions.push({
        stepNumber: instructions.length + 1,
        instruction: `${turnLabel} at ${node?.name || "corridor junction"}`,
        distanceMeters: Number((calculateDistance(curr, next) * 0.05).toFixed(1)),
        action,
      });
    }
  }

  const finalDist = Number((calculateDistance(waypoints[waypoints.length - 2] || waypoints[0]!, waypoints[waypoints.length - 1]!) * 0.05).toFixed(1));
  instructions.push({
    stepNumber: instructions.length + 1,
    instruction: `Destination ${destinationName} is ahead on your aisle rack`,
    distanceMeters: finalDist,
    action: "arrive",
  });

  return instructions;
}

/**
 * Detects whether the person has arrived at the destination threshold (<= 30px / ~1.5m).
 */
export function checkArrivalStatus(
  personPos: { x: number; y: number },
  destPos: { x: number; y: number },
  thresholdPx: number = 30
): boolean {
  return Math.hypot(personPos.x - destPos.x, personPos.y - destPos.y) <= thresholdPx;
}

/**
 * Detects whether the person has moved off the calculated route (> 40px / ~2.0m perpendicular distance).
 */
export function checkOffRouteStatus(
  personPos: { x: number; y: number },
  waypoints: Array<{ x: number; y: number }>,
  thresholdPx: number = 40
): boolean {
  if (waypoints.length < 2) return false;
  let minDistance = Infinity;

  for (let i = 0; i < waypoints.length - 1; i++) {
    const p1 = waypoints[i]!;
    const p2 = waypoints[i + 1]!;

    const l2 = (p2.x - p1.x) ** 2 + (p2.y - p1.y) ** 2;
    if (l2 === 0) {
      minDistance = Math.min(minDistance, Math.hypot(personPos.x - p1.x, personPos.y - p1.y));
      continue;
    }

    let t = ((personPos.x - p1.x) * (p2.x - p1.x) + (personPos.y - p1.y) * (p2.y - p1.y)) / l2;
    t = Math.max(0, Math.min(1, t));

    const projX = p1.x + t * (p2.x - p1.x);
    const projY = p1.y + t * (p2.y - p1.y);

    const dist = Math.hypot(personPos.x - projX, personPos.y - projY);
    minDistance = Math.min(minDistance, dist);
  }

  return minDistance > thresholdPx;
}

/**
 * Architecture helper for multi-product sequential navigation (Person -> Product A -> Product B -> Checkout).
 */
export function calculateMultiStopRoute(
  graph: NavigationGraph,
  startPos: { x: number; y: number },
  destinations: Array<{ id: string; name: string; x: number; y: number }>
): AStarResult[] {
  const routes: AStarResult[] = [];
  let currentStartPos = startPos;

  for (const dest of destinations) {
    const startNode = findNearestWalkableNode(graph, currentStartPos.x, currentStartPos.y);
    const goalNode = findNearestWalkableNode(graph, dest.x, dest.y);
    const route = findShortestPathAStar(graph, startNode.id, goalNode.id);
    routes.push(route);
    currentStartPos = { x: dest.x, y: dest.y };
  }

  return routes;
}
