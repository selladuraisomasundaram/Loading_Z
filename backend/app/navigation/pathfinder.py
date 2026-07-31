import networkx as nx
import math
from networkx.algorithms.approximation import traveling_salesman_problem
from app.core.database import SessionLocal
from app.models.product import Product

# 1. Initialize True Spatial Grid Graph
G = nx.Graph()

# Define canonical spatial coordinates for routing mapping
# Coordinates (x, y) represent pixels on the 1000x1000 store map.
SPATIAL_NODES = {
    "N_ENTRANCE": (625, 125),
    "N_CHECKOUT": (625, 875),
    "N_AISLE_1": (200, 350),
    "N_AISLE_2": (300, 200),
    "N_AISLE_3": (450, 200),
    "N_AISLE_4": (650, 350),
    "N_AISLE_7": (350, 500),
    "N_CORRIDOR_MAIN": (500, 450),
    "N_CORRIDOR_TOP": (500, 750),
    "N_UNKNOWN": (850, 150)
}

# Add nodes to graph
for node_name, (x, y) in SPATIAL_NODES.items():
    G.add_node(node_name, pos=(x, y))

# Add edges with physical Euclidean distances
edges = [
    ("N_ENTRANCE", "N_AISLE_2"),
    ("N_ENTRANCE", "N_AISLE_3"),
    ("N_AISLE_2", "N_AISLE_3"),
    ("N_AISLE_2", "N_AISLE_1"),
    ("N_AISLE_3", "N_CORRIDOR_MAIN"),
    ("N_AISLE_1", "N_CORRIDOR_MAIN"),
    ("N_CORRIDOR_MAIN", "N_AISLE_7"),
    ("N_CORRIDOR_MAIN", "N_AISLE_4"),
    ("N_AISLE_4", "N_UNKNOWN"),
    ("N_CORRIDOR_MAIN", "N_CORRIDOR_TOP"),
    ("N_AISLE_7", "N_CORRIDOR_TOP"),
    ("N_CORRIDOR_TOP", "N_CHECKOUT")
]

for n1, n2 in edges:
    p1 = SPATIAL_NODES[n1]
    p2 = SPATIAL_NODES[n2]
    dist = math.sqrt((p1[0] - p2[0])**2 + (p1[1] - p2[1])**2)
    G.add_edge(n1, n2, weight=dist)

def _euclidean_distance(p1: tuple, p2: tuple) -> float:
    return math.sqrt((p1[0] - p2[0])**2 + (p1[1] - p2[1])**2)

def map_to_spatial_node(aisle_str: str) -> str:
    """Map DB aisle string to closest NetworkX node"""
    if not aisle_str:
        return "N_UNKNOWN"
    
    aisle_upper = aisle_str.upper()
    if "AISLE 1" in aisle_upper or "AISLE_1" in aisle_upper: return "N_AISLE_1"
    if "AISLE 2" in aisle_upper or "AISLE_2" in aisle_upper: return "N_AISLE_2"
    if "AISLE 3" in aisle_upper or "AISLE_3" in aisle_upper: return "N_AISLE_3"
    if "AISLE 4" in aisle_upper or "AISLE_4" in aisle_upper: return "N_AISLE_4"
    if "AISLE 7" in aisle_upper or "AISLE_7" in aisle_upper: return "N_AISLE_7"
    if "CHECKOUT" in aisle_upper: return "N_CHECKOUT"
    if "ENTRANCE" in aisle_upper: return "N_ENTRANCE"
    return "N_UNKNOWN"

def calculate_optimal_tsp_route(cart_item_ids: list[str], start_coords: tuple = None) -> dict:
    """
    Implements true TSP pathfinding on a spatial grid utilizing SQLAlchemy.
    """
    # 1. Start session
    db = SessionLocal()
    
    stops_data = []
    
    try:
        # 2. Fetch all products to determine their physical nodes
        for sku in cart_item_ids:
            if not sku or sku.startswith("WEB-"):
                continue # Skip web items for spatial routing
                
            product = db.query(Product).filter(Product.id == sku).first()
            if product:
                node = map_to_spatial_node(product.aisle)
                pt = SPATIAL_NODES[node]
                stops_data.append({
                    "sku": sku,
                    "product_name": product.product_name,
                    "aisle": product.aisle,
                    "node": node,
                    "x": pt[0],
                    "y": pt[1]
                })
    finally:
        db.close()

    # Determine unique target nodes
    target_nodes = set([stop["node"] for stop in stops_data])
    target_nodes.add("N_ENTRANCE")
    target_nodes.add("N_CHECKOUT")
    
    # 3. Build complete Distance Matrix Graph for TSP
    tsp_graph = nx.Graph()
    target_nodes_list = list(target_nodes)
    
    # To force the path from ENTRANCE to CHECKOUT we can use a standard nearest neighbor TSP
    # and adjust. The traveling_salesperson_problem returns a cycle.
    for i in range(len(target_nodes_list)):
        for j in range(i + 1, len(target_nodes_list)):
            n1 = target_nodes_list[i]
            n2 = target_nodes_list[j]
            # Get shortest path length on actual store grid (avoids flying through walls)
            try:
                shortest_len = nx.shortest_path_length(G, source=n1, target=n2, weight="weight")
                tsp_graph.add_edge(n1, n2, weight=shortest_len)
            except nx.NetworkXNoPath:
                # Fallback if disconnected
                tsp_graph.add_edge(n1, n2, weight=9999)

    # Make the edge between ENTRANCE and CHECKOUT weight 0 to encourage the cycle to close there,
    # then we can break it to form a linear path.
    if "N_ENTRANCE" in tsp_graph and "N_CHECKOUT" in tsp_graph:
        tsp_graph["N_ENTRANCE"]["N_CHECKOUT"]["weight"] = 0.0

    # 4. Run TSP Algorithm
    try:
        tsp_cycle = traveling_salesman_problem(tsp_graph, weight="weight")
    except nx.NetworkXError:
        tsp_cycle = ["N_ENTRANCE", "N_CHECKOUT"]
    
    # Extract linear path from cycle by breaking it at CHECKOUT -> ENTRANCE
    try:
        start_idx = tsp_cycle.index("N_ENTRANCE")
        # Rotate cycle so it starts at ENTRANCE
        rotated_cycle = tsp_cycle[start_idx:] + tsp_cycle[:start_idx]
        
        # We need to traverse towards CHECKOUT. If CHECKOUT is at the very end, great.
        # If CHECKOUT is adjacent to ENTRANCE in the cycle (because we set weight=0),
        # we might need to reverse the cycle so checkout is at the end.
        if len(rotated_cycle) > 1 and rotated_cycle[1] == "N_CHECKOUT":
            # Reverse the cycle except for the first element
            rotated_cycle = [rotated_cycle[0]] + rotated_cycle[1:][::-1]
            
        if "N_CHECKOUT" in rotated_cycle:
            end_idx = rotated_cycle.index("N_CHECKOUT")
            optimal_sequence = rotated_cycle[:end_idx+1]
        else:
            optimal_sequence = rotated_cycle
    except ValueError:
        optimal_sequence = ["N_ENTRANCE", "N_CHECKOUT"]
        
    # Remove consecutive duplicates
    clean_sequence = []
    for node in optimal_sequence:
        if not clean_sequence or clean_sequence[-1] != node:
            clean_sequence.append(node)

    # 5. Generate continuous (x, y) coordinate polyline waypoints
    continuous_waypoints = []
    total_distance_px = 0.0
    
    for i in range(len(clean_sequence) - 1):
        source = clean_sequence[i]
        target = clean_sequence[i+1]
        
        # Get exact shortest path list of nodes
        path_nodes = nx.shortest_path(G, source=source, target=target, weight="weight")
        
        for p_node in path_nodes:
            pt = SPATIAL_NODES[p_node]
            if not continuous_waypoints or continuous_waypoints[-1] != list(pt):
                continuous_waypoints.append(list(pt))
                
        # Use actual grid distance, not the forced 0 weight
        total_distance_px += nx.shortest_path_length(G, source=source, target=target, weight="weight")

    # If empty (only entrance and checkout)
    if not continuous_waypoints:
        continuous_waypoints = [list(SPATIAL_NODES["N_ENTRANCE"]), list(SPATIAL_NODES["N_CHECKOUT"])]
        total_distance_px = nx.shortest_path_length(G, source="N_ENTRANCE", target="N_CHECKOUT", weight="weight")
        
    # Scale to meters (approx 10 pixels = 1 meter)
    total_distance_m = round(total_distance_px / 10.0, 2)
    est_time_sec = int(total_distance_m / 1.0) # 1 meter per second walking speed
    
    return {
        "waypoints": continuous_waypoints,
        "stop_sequence": stops_data,
        "total_distance_m": total_distance_m,
        "est_time_sec": est_time_sec
    }

def calculate_route(start_node: str, destination_node: str) -> dict:
    """Legacy single destination routing"""
    start_canonical = map_to_spatial_node(start_node)
    dest_canonical = map_to_spatial_node(destination_node)

    try:
        path_nodes = nx.shortest_path(G, source=start_canonical, target=dest_canonical, weight="weight")
        length_px = nx.shortest_path_length(G, source=start_canonical, target=dest_canonical, weight="weight")
        path = [list(SPATIAL_NODES[n]) for n in path_nodes]
    except Exception:
        path = [list(SPATIAL_NODES["N_ENTRANCE"]), list(SPATIAL_NODES["N_CHECKOUT"])]
        length_px = 150.0

    return {
        "current_location": start_canonical,
        "target_location": dest_canonical,
        "waypoints": path,
        "distance_meters": round(length_px / 10.0, 2)
    }
