import os
import sys
import json

backend_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if backend_dir not in sys.path:
    sys.path.insert(0, backend_dir)

from app.rag.nlp_processor import process_nlp_query

queries = [
    "Where is Aashirvaad Atta?",
    "How much is Maggi?",
    "Do you have Dove shampoo?",
    "Show biscuits under 100 rupees.",
    "Add Aashirvaad Atta to my cart.",
    "Take me to the biscuit section.",
]

def test_nlp():
    print("Testing NLP Query Processor...")
    for q in queries:
        print(f"\nQuery: '{q}'")
        res = process_nlp_query(q)
        print(f"Intent: {res['intent']}")
        print(f"Entities: {json.dumps(res['entities'], indent=2)}")

if __name__ == "__main__":
    test_nlp()
