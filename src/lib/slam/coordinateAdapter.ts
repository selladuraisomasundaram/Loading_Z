/**
 * Coordinate Adapter
 * 
 * Maps physical SLAM coordinates (e.g. meters) to frontend Supermarket Map UI coordinates (pixels).
 * Adjust these constants to match the actual layout of the physical robot map to the digital map.
 */

// Example Constants (to be calibrated later with real robot data)
export const SLAM_CONFIG = {
  RESOLUTION: 0.05, // meters per pixel in the SLAM occupancy grid
  MAP_SCALE: 20.0,  // pixels per meter on the digital map UI
  ORIGIN_X_OFFSET: 0, // origin X translation to align maps
  ORIGIN_Y_OFFSET: 0, // origin Y translation to align maps
  ROTATION: 0 // rotation offset in radians if maps are rotated relative to each other
};

export interface Point {
  x: number;
  y: number;
}

export interface Pose extends Point {
  theta: number;
  timestamp: number;
}

/**
 * Convert SLAM physical coordinates (meters) to UI Map pixel coordinates.
 */
export function slamToMapCoordinates(slamX: number, slamY: number): Point {
  // 1. Apply rotation offset if the SLAM map and UI map are not aligned
  const rotatedX = slamX * Math.cos(SLAM_CONFIG.ROTATION) - slamY * Math.sin(SLAM_CONFIG.ROTATION);
  const rotatedY = slamX * Math.sin(SLAM_CONFIG.ROTATION) + slamY * Math.cos(SLAM_CONFIG.ROTATION);

  // 2. Scale to pixels and add offsets
  return {
    x: (rotatedX * SLAM_CONFIG.MAP_SCALE) + SLAM_CONFIG.ORIGIN_X_OFFSET,
    y: (rotatedY * SLAM_CONFIG.MAP_SCALE) + SLAM_CONFIG.ORIGIN_Y_OFFSET,
  };
}

/**
 * Convert UI Map pixel coordinates to SLAM physical coordinates (meters).
 */
export function mapToSlamCoordinates(mapX: number, mapY: number): Point {
  // 1. Remove offsets and scale back to meters
  const unscaledX = (mapX - SLAM_CONFIG.ORIGIN_X_OFFSET) / SLAM_CONFIG.MAP_SCALE;
  const unscaledY = (mapY - SLAM_CONFIG.ORIGIN_Y_OFFSET) / SLAM_CONFIG.MAP_SCALE;

  // 2. Reverse rotation offset
  const reverseRot = -SLAM_CONFIG.ROTATION;
  return {
    x: unscaledX * Math.cos(reverseRot) - unscaledY * Math.sin(reverseRot),
    y: unscaledX * Math.sin(reverseRot) + unscaledY * Math.cos(reverseRot),
  };
}
