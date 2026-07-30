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
