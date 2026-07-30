import unittest
from fastapi.testclient import TestClient
import networkx as nx

from main import app
from app.navigation.pathfinder import G, map_to_spatial_node, calculate_route
from app.core.database import get_db_engine

class TestNavigation(unittest.TestCase):
    def setUp(self):
        self.client = TestClient(app)

    def test_graph_structure(self):
        # Verify graph exists and is undirected
        self.assertTrue(isinstance(G, nx.Graph))
        self.assertFalse(G.is_directed())
        
        # Verify all required spatial nodes exist in graph
        expected_nodes = {"ENTRANCE", "AISLE_1", "AISLE_2", "AISLE_3", "AISLE_4", "CHECKOUT"}
        self.assertEqual(set(G.nodes), expected_nodes)
        
        # Verify we have edges
        self.assertTrue(G.number_of_edges() > 0)

    def test_map_to_spatial_node(self):
        # Direct matches
        self.assertEqual(map_to_spatial_node("ENTRANCE"), "ENTRANCE")
        self.assertEqual(map_to_spatial_node("checkout"), "CHECKOUT")
        
        # Number mapping for aisles
        self.assertEqual(map_to_spatial_node("Aisle 1"), "AISLE_1")
        self.assertEqual(map_to_spatial_node("Aisle B2"), "AISLE_2")
        self.assertEqual(map_to_spatial_node("Aisle C3"), "AISLE_3")
        self.assertEqual(map_to_spatial_node("Aisle D4"), "AISLE_4")
        self.assertEqual(map_to_spatial_node("Aisle E5"), "AISLE_1")  # Modulo wrapping ((5-1)%4)+1 = 1
        
        # Keyword patterns
        self.assertEqual(map_to_spatial_node("entryway"), "ENTRANCE")
        self.assertEqual(map_to_spatial_node("bill counter"), "CHECKOUT")
        
        # Fallback
        self.assertEqual(map_to_spatial_node(""), "ENTRANCE")

    def test_calculate_route(self):
        # Test path calculation
        route = calculate_route("ENTRANCE", "CHECKOUT")
        self.assertEqual(route["current_location"], "ENTRANCE")
        self.assertEqual(route["target_location"], "CHECKOUT")
        self.assertIn("waypoints", route)
        self.assertGreaterEqual(len(route["waypoints"]), 2)
        self.assertEqual(route["waypoints"][0], "ENTRANCE")
        self.assertEqual(route["waypoints"][-1], "CHECKOUT")
        self.assertGreater(route["distance_meters"], 0.0)

    def test_database_sku_resolution(self):
        db = get_db_engine()
        if db.df is not None and not db.df.empty:
            # Get the first item's SKU
            row = db.df.iloc[0]
            # Resolve it
            first_product = db._row_to_product(row, 0)
            sku = first_product.sku
            
            # Test exact SKU query match
            resolved = db.resolve_product(sku)
            self.assertEqual(resolved.sku, sku)
            self.assertEqual(resolved.product_name, first_product.product_name)
            
            # Test case-insensitive and format variation matches
            resolved_lower = db.resolve_product(sku.lower())
            self.assertEqual(resolved_lower.sku, sku)
            
            sku_no_dash = sku.replace("-", "")
            resolved_no_dash = db.resolve_product(sku_no_dash)
            self.assertEqual(resolved_no_dash.sku, sku)
            
            sku_only_hex = sku.split("-")[1]
            resolved_hex = db.resolve_product(sku_only_hex)
            self.assertEqual(resolved_hex.sku, sku)

    def test_api_route_canonical(self):
        # Query with direct canonical nodes
        response = self.client.get("/api/v1/navigation/route?start=ENTRANCE&destination=CHECKOUT")
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertEqual(data["current_location"], "ENTRANCE")
        self.assertEqual(data["target_location"], "CHECKOUT")
        self.assertIn("waypoints", data)
        self.assertTrue(isinstance(data["waypoints"], list))
        self.assertTrue(isinstance(data["distance_meters"], float))

    def test_api_route_with_product_name(self):
        # Query with a generic product name
        response = self.client.get("/api/v1/navigation/route?destination=noodles")
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertEqual(data["current_location"], "ENTRANCE")  # default start
        self.assertTrue(data["target_location"].startswith("AISLE_") or data["target_location"] in {"ENTRANCE", "CHECKOUT"})

    def test_api_route_with_sku(self):
        db = get_db_engine()
        if db.df is not None and not db.df.empty:
            row = db.df.iloc[0]
            first_product = db._row_to_product(row, 0)
            sku = first_product.sku
            
            response = self.client.get(f"/api/v1/navigation/route?destination={sku}")
            self.assertEqual(response.status_code, 200)
            data = response.json()
            
            # Map the resolved product's aisle to canonical spatial node to verify target
            canonical_aisle = map_to_spatial_node(first_product.aisle)
            self.assertEqual(data["target_location"], canonical_aisle)

if __name__ == "__main__":
    unittest.main()
