import {
  Product,
  RouteWaypoint,
  MultiProductRouteResult,
} from "@/types";
import { supermarketGraph } from "./navigationGraph";
import { findShortestPathAStar, findNearestWalkableNode } from "./aStar";

interface ProductStop {
  product: Product;
  nodeId: string;
  x: number;
  y: number;
}

/**
 * Calculates total graph path distance (in meters) for a specific sequence of stop node IDs.
 */
function calculateSequenceGraphDistance(nodeSequence: string[]): {
  distanceMeters: number;
  fullPathNodeIds: string[];
  fullWaypoints: Array<{ x: number; y: number }>;
} {
  let totalDistMeters = 0;
  const fullPathNodeIds: string[] = [];
  const fullWaypoints: Array<{ x: number; y: number }> = [];

  for (let i = 0; i < nodeSequence.length - 1; i++) {
    const fromId = nodeSequence[i]!;
    const toId = nodeSequence[i + 1]!;

    const segment = findShortestPathAStar(supermarketGraph, fromId, toId);
    totalDistMeters += segment.totalDistanceMeters;

    if (segment.pathNodeIds.length > 0) {
      if (i === 0) {
        fullPathNodeIds.push(...segment.pathNodeIds);
        fullWaypoints.push(...segment.waypoints);
      } else {
        // Omit first node to avoid duplication at transition points
        fullPathNodeIds.push(...segment.pathNodeIds.slice(1));
        fullWaypoints.push(...segment.waypoints.slice(1));
      }
    }
  }

  return {
    distanceMeters: Number(totalDistMeters.toFixed(1)),
    fullPathNodeIds,
    fullWaypoints,
  };
}

/**
 * Generates all permutations for an array of product stops.
 */
function getPermutations<T>(array: T[]): T[][] {
  if (array.length <= 1) return [array];
  const result: T[][] = [];

  for (let i = 0; i < array.length; i++) {
    const current = array[i]!;
    const remaining = [...array.slice(0, i), ...array.slice(i + 1)];
    const perms = getPermutations(remaining);

    for (const p of perms) {
      result.push([current, ...p]);
    }
  }

  return result;
}

/**
 * Greedy Nearest-Unvisited-Neighbor heuristic for larger cart lists (> 8 items).
 */
function solveGreedyRoute(
  startNodeId: string,
  stops: ProductStop[],
  _checkoutNodeId: string
): ProductStop[] {
  const unvisited = [...stops];
  const orderedStops: ProductStop[] = [];
  let currentId = startNodeId;

  while (unvisited.length > 0) {
    let nearestIdx = 0;
    let minGraphDist = Infinity;

    for (let i = 0; i < unvisited.length; i++) {
      const candidate = unvisited[i]!;
      const seg = findShortestPathAStar(supermarketGraph, currentId, candidate.nodeId);
      if (seg.totalDistanceMeters < minGraphDist) {
        minGraphDist = seg.totalDistanceMeters;
        nearestIdx = i;
      }
    }

    const nextStop = unvisited.splice(nearestIdx, 1)[0]!;
    orderedStops.push(nextStop);
    currentId = nextStop.nodeId;
  }

  return orderedStops;
}

/**
 * PHASE 4: Multi-Product Route Optimizer Engine
 * Solves Traveling Salesperson Problem (TSP) over A* graph path costs.
 */
export function optimizeMultiProductRoute(
  products: Product[],
  startNodeId = "N_ENTRANCE",
  checkoutNodeId = "N_CHECKOUT"
): MultiProductRouteResult {
  const startNode = supermarketGraph.nodes[startNodeId] || supermarketGraph.nodes["N_ENTRANCE"]!;
  const checkoutNode = supermarketGraph.nodes[checkoutNodeId] || supermarketGraph.nodes["N_CHECKOUT"]!;

  if (products.length === 0) {
    return {
      waypoints: [
        {
          id: "wp-start",
          stepNumber: 1,
          type: "start",
          nodeId: startNode.id,
          x: startNode.x,
          y: startNode.y,
          status: "completed",
        },
        {
          id: "wp-checkout",
          stepNumber: 2,
          type: "checkout",
          nodeId: checkoutNode.id,
          x: checkoutNode.x,
          y: checkoutNode.y,
          status: "pending",
        },
      ],
      fullNodePath: [startNode.id, checkoutNode.id],
      fullSvgWaypoints: [
        { x: startNode.x, y: startNode.y },
        { x: checkoutNode.x, y: checkoutNode.y },
      ],
      originalDistanceMeters: 28.0,
      optimizedDistanceMeters: 28.0,
      distanceSavedMeters: 0,
      percentageSaved: 0,
      estimatedTimeSeconds: 23,
      success: true,
    };
  }

  // Map products to product stops and nearest walkable corridor nodes
  const stops: ProductStop[] = products.map((product) => {
    let x = 300;
    let y = 200;
    if (product.location) {
      x = product.location.x;
      y = product.location.y;
    }
    const nearestNode = findNearestWalkableNode(supermarketGraph, x, y);
    return {
      product,
      nodeId: nearestNode.id,
      x,
      y,
    };
  });

  // Calculate Original Unoptimized Route Distance (Start -> Prod 1 -> Prod 2 ... -> Checkout)
  const originalSequence = [
    startNode.id,
    ...stops.map((s) => s.nodeId),
    checkoutNode.id,
  ];
  const originalResult = calculateSequenceGraphDistance(originalSequence);

  // Calculate Optimal Visiting Order using TSP Permutation (or Greedy Heuristic)
  let bestStops: ProductStop[] = [];

  if (stops.length <= 8) {
    const permutations = getPermutations(stops);
    let minTotalDist = Infinity;

    for (const perm of permutations) {
      const seq = [startNode.id, ...perm.map((s) => s.nodeId), checkoutNode.id];
      const res = calculateSequenceGraphDistance(seq);

      if (res.distanceMeters < minTotalDist) {
        minTotalDist = res.distanceMeters;
        bestStops = perm;
      }
    }
  } else {
    bestStops = solveGreedyRoute(startNode.id, stops, checkoutNode.id);
  }

  // Re-calculate final graph path for best optimized order
  const optimizedSequence = [
    startNode.id,
    ...bestStops.map((s) => s.nodeId),
    checkoutNode.id,
  ];
  const optimizedResult = calculateSequenceGraphDistance(optimizedSequence);

  // Distance Saved Telemetry
  const origDist = originalResult.distanceMeters;
  const optDist = optimizedResult.distanceMeters;
  const savedDist = Math.max(0, Number((origDist - optDist).toFixed(1)));
  const percentageSaved =
    origDist > 0 ? Number(((savedDist / origDist) * 100).toFixed(1)) : 0;

  // Construct Waypoints List (① Start -> ② Prod 1 -> ③ Prod 2 ... -> Checkout)
  const waypoints: RouteWaypoint[] = [];

  // 1. Start Waypoint
  waypoints.push({
    id: "wp-start",
    stepNumber: 1,
    type: "start",
    productName: "Entrance Gateway",
    nodeId: startNode.id,
    x: startNode.x,
    y: startNode.y,
    status: "completed",
  });

  // 2. Product Waypoints
  bestStops.forEach((stop, idx) => {
    waypoints.push({
      id: `wp-prod-${stop.product.id}`,
      stepNumber: idx + 2,
      type: "product",
      productId: stop.product.id,
      productName: stop.product.name,
      aisleId: stop.product.location?.aisleId || "Aisle",
      shelfId: stop.product.location?.shelfId || "S1",
      nodeId: stop.nodeId,
      x: stop.x,
      y: stop.y,
      status: "pending",
    });
  });

  // 3. Checkout Waypoint (Final Stop)
  waypoints.push({
    id: "wp-checkout",
    stepNumber: waypoints.length + 1,
    type: "checkout",
    productName: "Express Checkout Counters",
    nodeId: checkoutNode.id,
    x: checkoutNode.x,
    y: checkoutNode.y,
    status: "pending",
  });

  const estimatedTimeSeconds = Math.max(
    8,
    Math.round(optimizedResult.distanceMeters / 1.2)
  );

  return {
    waypoints,
    fullNodePath: optimizedResult.fullPathNodeIds,
    fullSvgWaypoints: optimizedResult.fullWaypoints,
    originalDistanceMeters: origDist,
    optimizedDistanceMeters: optDist,
    distanceSavedMeters: savedDist,
    percentageSaved,
    estimatedTimeSeconds,
    success: true,
  };
}
