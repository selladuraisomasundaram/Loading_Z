import networkx as nx
import re

# 1. Initialize undirected graph representing the supermarket layout
G = nx.Graph()

SPATIAL_NODES = {"ENTRANCE", "AISLE_1", "AISLE_2", "AISLE_3", "AISLE_4", "CHECKOUT"}
G.add_nodes_from(SPATIAL_NODES)

# Add weighted edges representing realistic distances in meters.
# Layout design:
# ENTRANCE (bottom) -> AISLE_1 (left, lower), AISLE_2 (right, lower)
# AISLE_1 <-> AISLE_2
# AISLE_1 -> AISLE_3 (left, upper)
# AISLE_2 -> AISLE_4 (right, upper)
# AISLE_3 <-> AISLE_4
# AISLE_3 -> CHECKOUT (top, left)
# AISLE_4 -> CHECKOUT (top, right)
G.add_edge("ENTRANCE", "AISLE_1", weight=6.0)
G.add_edge("ENTRANCE", "AISLE_2", weight=9.5)
G.add_edge("AISLE_1", "AISLE_2", weight=4.0)
G.add_edge("AISLE_1", "AISLE_3", weight=5.5)
G.add_edge("AISLE_2", "AISLE_4", weight=6.5)
G.add_edge("AISLE_3", "AISLE_4", weight=4.5)
G.add_edge("AISLE_3", "CHECKOUT", weight=8.0)
G.add_edge("AISLE_4", "CHECKOUT", weight=5.0)

def map_to_spatial_node(node_str: str) -> str:
    """
    Maps any user/DB inputs (e.g. "Aisle D10", "Aisle 2", "checkout_1")
    to one of the graph's canonical spatial nodes:
    ENTRANCE, AISLE_1, AISLE_2, AISLE_3, AISLE_4, CHECKOUT.
    """
    if not node_str:
        return "ENTRANCE"

    cleaned = node_str.strip().upper().replace(" ", "_").replace("-", "_")

    # 1. Direct match check
    if cleaned in SPATIAL_NODES:
        return cleaned

    # 2. Check for numeric characters to resolve to AISLE_1..4
    digits = re.findall(r'\d+', cleaned)
    if digits:
        num = int(digits[0])
        # Map to range 1-4 using modulo
        mapped_num = ((num - 1) % 4) + 1
        return f"AISLE_{mapped_num}"

    # 3. Match entrance and checkout keyword patterns
    if any(kw in cleaned for kw in ("ENTR", "IN", "START", "BEGIN")):
        return "ENTRANCE"
    if any(kw in cleaned for kw in ("CHECK", "EXIT", "OUT", "PAY", "BILL")):
        return "CHECKOUT"

    # 4. Fallback hash mapping to one of the aisles
    hash_val = sum(ord(c) for c in cleaned)
    mapped_num = (hash_val % 4) + 1
    return f"AISLE_{mapped_num}"

def calculate_route(start_node: str, destination_node: str) -> dict:
    """
    Determines the shortest waypoints path and distance using NetworkX.
    """
    start_canonical = map_to_spatial_node(start_node)
    dest_canonical = map_to_spatial_node(destination_node)

    try:
        path = nx.shortest_path(G, source=start_canonical, target=dest_canonical, weight="weight")
        length = nx.shortest_path_length(G, source=start_canonical, target=dest_canonical, weight="weight")
    except Exception:
        # Graceful fallback in case pathfinding fails (should not happen in a connected graph)
        path = [start_canonical, dest_canonical]
        length = 15.0

    return {
        "current_location": start_canonical,
        "target_location": dest_canonical,
        "waypoints": path,
        "distance_meters": float(length)
    }

import math
from app.navigation.zone_mapper import resolve_coordinates_for_product

def _euclidean_distance(p1: tuple, p2: tuple) -> float:
    return math.sqrt((p1[0] - p2[0])**2 + (p1[1] - p2[1])**2)

def calculate_tsp_cart_route(cart_items: list, current_pos: tuple) -> dict:
    """
    Calculates the shortest route starting from user location (or Entrance), 
    visiting all unique item locations, and ending at Checkout.
    """
    ENTRANCE_POS = current_pos if current_pos else (625, 125)
    CHECKOUT_POS = (625, 875)

    stops = []
    
    # Resolve all items
    for item in cart_items:
        sku = item.get("id") or item.get("sku") or ""
        cat = item.get("category", "")
        subcat = item.get("sub_category", "")
        
        # Determine if it's a web item
        is_web = str(sku).startswith("WEB-") or not sku
        
        coords = resolve_coordinates_for_product(cat, subcat, str(sku))
        stops.append({
            "product_name": item.get("product_name", item.get("name", "Unknown")),
            "aisle": coords["aisle"],
            "x": coords["x"],
            "y": coords["y"],
            "is_web_item": is_web
        })

    # Deduplicate stops based on physical coordinates to avoid unnecessary nodes
    unique_locations = []
    unique_points = []
    for s in stops:
        pt = (s["x"], s["y"])
        if pt not in unique_points:
            unique_points.append(pt)
            unique_locations.append(s)

    # If no items, just route from entrance to checkout
    if not unique_points:
        dist = _euclidean_distance(ENTRANCE_POS, CHECKOUT_POS)
        # Using 10 pixels = 1 meter approximation for realistic distance mapping
        dist_meters = round(dist / 10.0, 2)
        return {
            "route_waypoints": [list(ENTRANCE_POS), list(CHECKOUT_POS)],
            "stops": [],
            "total_distance_meters": dist_meters,
            "estimated_time_minutes": round((dist_meters / 60.0), 1)  # approx 1m/s
        }

    # Build Complete Graph
    tsp_graph = nx.Graph()
    # Add nodes: 0 is entrance, 1..N are stops, N+1 is checkout
    nodes = [ENTRANCE_POS] + unique_points + [CHECKOUT_POS]
    for i in range(len(nodes)):
        for j in range(i + 1, len(nodes)):
            dist = _euclidean_distance(nodes[i], nodes[j])
            tsp_graph.add_edge(i, j, weight=dist)

    # Simple nearest neighbor from Entrance
    # This guarantees we start at 0, visit all, and then we manually append Checkout (N+1)
    unvisited = set(range(1, len(unique_points) + 1))
    current_node = 0
    route_indices = [0]
    total_dist = 0.0

    while unvisited:
        # Find nearest unvisited
        nearest = min(unvisited, key=lambda node: tsp_graph[current_node][node]['weight'])
        total_dist += tsp_graph[current_node][nearest]['weight']
        route_indices.append(nearest)
        unvisited.remove(nearest)
        current_node = nearest

    # Connect last stop to checkout
    checkout_node = len(nodes) - 1
    total_dist += tsp_graph[current_node][checkout_node]['weight']
    route_indices.append(checkout_node)

    # Prepare waypoints
    route_waypoints = [list(nodes[idx]) for idx in route_indices]

    dist_meters = round(total_dist / 10.0, 2) # convert pixel distance to meters
    est_time = round((dist_meters / 60.0), 1)

    return {
        "route_waypoints": route_waypoints,
        "stops": stops, # return all stops including duplicates to display them
        "total_distance_meters": dist_meters,
        "estimated_time_minutes": est_time
    }
