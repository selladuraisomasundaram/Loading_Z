import os
import sys
import json
import logging
import asyncio

logging.basicConfig(level=logging.INFO)

backend_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if backend_dir not in sys.path:
    sys.path.insert(0, backend_dir)

from app.rag.pipeline import execute_rag_pipeline

def test_pipeline():
    print("Testing LangChain RAG pipeline with Gemma 4...")
    query = "What is the price of Aashirvaad Atta?"
    result = execute_rag_pipeline(query)
    print("\nResult for 'What is the price of Aashirvaad Atta?':")
    print(json.dumps(result, indent=2))
    
    query = "Where can I find organic honey?"
    result = execute_rag_pipeline(query)
    print("\nResult for 'Where can I find organic honey?':")
    print(json.dumps(result, indent=2))
    
    query = "Add 2 packets of milk to my cart"
    result = execute_rag_pipeline(query)
    print("\nResult for 'Add 2 packets of milk to my cart':")
    print(json.dumps(result, indent=2))

if __name__ == "__main__":
    test_pipeline()
