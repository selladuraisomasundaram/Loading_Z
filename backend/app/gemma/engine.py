import os
from ollama import AsyncClient

OLLAMA_HOST = os.getenv("OLLAMA_HOST", "http://localhost:11434")
GEMMA_MODEL = os.getenv("GEMMA_MODEL", "gemma4:e4b")

def get_ollama_client() -> AsyncClient:
    return AsyncClient(host=OLLAMA_HOST)
