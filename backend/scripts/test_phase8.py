import asyncio
import os
import sys

# Add backend directory to sys.path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.agent.orchestrator import orchestrate_message

async def main():
    queries = [
        "Where is Aashirvaad Atta?",
        "How much is Maggi?",
        "Do you have Dove shampoo?",
        "Show me biscuits under 100 rupees.",
        "Add Aashirvaad Atta to my cart.",
        "Where is XYZ product?",
        "Take me to the biscuit section.",
        "I need something for breakfast under 200 rupees."
    ]
    
    print("--- PHASE 8 INTEGRATION TESTS ---")
    for i, q in enumerate(queries, 1):
        print(f"\n[TEST {i}] Query: {q}")
        try:
            result = await orchestrate_message(q)
            print("Response:", result.get("response", "").replace('\n', ' '))
            print("Target Aisle:", result.get("targetAisle"))
            print("Target Product ID:", result.get("targetProductId"))
            
            tool_act = result.get("toolActivity", [])
            print("Tool Activity:")
            for act in tool_act:
                print(f"  - {act.get('step')}: {act.get('action')} -> {act.get('result', '')}")
                
        except Exception as e:
            print(f"Error: {e}")

if __name__ == "__main__":
    asyncio.run(main())
