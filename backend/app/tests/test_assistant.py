import unittest
from fastapi.testclient import TestClient
from main import app
from app.agent.orchestrator import fallback_parse_intent
from app.core.database import get_db_engine

class TestAssistant(unittest.TestCase):
    def setUp(self):
        self.client = TestClient(app)

    def test_fallback_intent_parsing(self):
        # 1. Product catalog search queries
        res_search = fallback_parse_intent("Where can I find butter?")
        self.assertEqual(res_search["tool"], "search_catalog")
        self.assertIn("butter", res_search["argument"].lower())

        # 2. Navigation queries
        res_route = fallback_parse_intent("Show route to Aisle 3")
        self.assertEqual(res_route["tool"], "get_route")
        self.assertEqual(res_route["argument"], "AISLE_3")

        # 3. Inventory / Stock check queries
        res_inv = fallback_parse_intent("Check stock for SKU-E4B92C")
        self.assertEqual(res_inv["tool"], "check_inventory")
        self.assertEqual(res_inv["argument"], "SKU-E4B92C")

        # 4. Conversational greetings
        res_conv = fallback_parse_intent("Hello assistant!")
        self.assertEqual(res_conv["tool"], "conversational")

    def test_api_chat_greeting(self):
        response = self.client.post(
            "/api/v1/assistant/chat",
            json={"message": "hello"}
        )
        self.assertEqual(response.status_code, 200)
        data = response.json()
        
        # Test required schema elements
        self.assertIn("response", data)
        self.assertIn("tool_activity", data)
        self.assertTrue(isinstance(data["tool_activity"], list))
        self.assertEqual(data["tool_activity"][0]["step"], "Gemma Tool Selection")
        self.assertEqual(data["tool_activity"][0]["action"], "conversational")
        
        # Test frontend compatibility fields
        self.assertEqual(data["sender"], "assistant")
        self.assertIn("text", data)
        self.assertIn("timestamp", data)

    def test_api_chat_product_search(self):
        # We query for an item (e.g. "noodles")
        response = self.client.post(
            "/api/v1/assistant/chat",
            json={"message": "Do you have noodles?"}
        )
        self.assertEqual(response.status_code, 200)
        data = response.json()
        
        self.assertTrue(len(data["tool_activity"]) >= 2)
        self.assertEqual(data["tool_activity"][0]["step"], "Gemma Tool Selection")
        self.assertIn("search_catalog", data["tool_activity"][0]["action"])
        self.assertEqual(data["tool_activity"][1]["step"], "Database Query")

    def test_api_chat_route_finding(self):
        response = self.client.post(
            "/api/v1/assistant/chat",
            json={"message": "give me directions to Aisle 1"}
        )
        self.assertEqual(response.status_code, 200)
        data = response.json()
        
        self.assertTrue(len(data["tool_activity"]) >= 2)
        self.assertEqual(data["tool_activity"][0]["step"], "Gemma Tool Selection")
        self.assertIn("get_route", data["tool_activity"][0]["action"])
        self.assertEqual(data["tool_activity"][1]["step"], "Pathfinder Execution")
        self.assertEqual(data["target_aisle"], "AISLE_1")
        self.assertIsNotNone(data["route"])
        self.assertIn("waypoints", data["route"])

    def test_api_chat_inventory_sku(self):
        db = get_db_engine()
        if db.df is not None and not db.df.empty:
            row = db.df.iloc[0]
            first_product = db._row_to_product(row, 0)
            sku = first_product.sku
            
            response = self.client.post(
                "/api/v1/assistant/chat",
                json={"message": f"check stock level for {sku}"}
            )
            self.assertEqual(response.status_code, 200)
            data = response.json()
            
            self.assertTrue(len(data["tool_activity"]) >= 2)
            self.assertEqual(data["tool_activity"][0]["step"], "Gemma Tool Selection")
            self.assertIn("check_inventory", data["tool_activity"][0]["action"])
            self.assertEqual(data["tool_activity"][1]["step"], "Database Query")

if __name__ == "__main__":
    unittest.main()
