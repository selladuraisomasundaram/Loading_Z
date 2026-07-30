import asyncio
from app.agent.tools import search_web
from app.gemma.engine import get_ollama_client, GEMMA_MODEL

async def test():
    print("--- Testing DDGS Web Search ---")
    try:
        result = search_web("What is the price of maggi noodles in India?")
        print(f"Web Search Result:\n{result}\n")
    except Exception as e:
        print(f"Web Search Failed: {e}\n")

    print(f"--- Testing Gemma Connection ({GEMMA_MODEL}) ---")
    try:
        client = get_ollama_client()
        response = await client.generate(model=GEMMA_MODEL, prompt="Say 'Hello, I am Gemma!' and nothing else.")
        print(f"Gemma Response:\n{response['response']}\n")
    except Exception as e:
        print(f"Gemma Connection Failed: {e}\n")

if __name__ == "__main__":
    asyncio.run(test())
