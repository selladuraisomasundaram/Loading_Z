import json
import logging
from typing import Dict, Any, List
from langchain_ollama import OllamaLLM
from app.gemma.engine import GEMMA_MODEL, OLLAMA_HOST
from app.rag.rag_service import rag_service

logger = logging.getLogger(__name__)

RAG_SYSTEM_PROMPT = """You are a Smart Supermarket Assistant running locally.
Use retrieved supermarket information as your source of knowledge.
Never invent product information.
When product information is unavailable, clearly state that it was not found.
Answer naturally and concisely.
If the request requires an application action, return a structured action request.

You must output valid JSON ONLY with the following schema:
{
    "intent": "PRODUCT_LOCATION" | "PRODUCT_AVAILABILITY" | "PRODUCT_SEARCH" | "CATEGORY_SEARCH" | "PRODUCT_FILTER" | "NAVIGATION_REQUEST" | "ADD_TO_CART" | "REMOVE_FROM_CART" | "GENERAL_SUPERMARKET_QUERY" | "UNKNOWN",
    "product_id": "SKU or null",
    "product_name": "Name or null",
    "response": "Your natural conversational response based ONLY on the context",
    "navigation_required": boolean,
    "cart_action": "add" | "remove" | null,
    "confidence": float between 0.0 and 1.0
}
"""

def execute_rag_pipeline(query: str) -> Dict[str, Any]:
    """
    Executes the full RAG pipeline:
    1. Retrieve from FAISS.
    2. Build context.
    3. Query local Gemma 4 via LangChain Ollama.
    4. Return validated JSON.
    """
    logger.info(f"Executing RAG pipeline for query: '{query}'")
    
    # 1. Retrieve relevant documents from FAISS
    context_data = rag_service.retrieve_context(query, top_k=5)
    
    if not context_data.get("success"):
        logger.error(f"RAG retrieval failed: {context_data.get('error')}")
        return _fallback_error_response("I encountered an error retrieving product information.")
        
    docs = context_data.get("results", [])
    
    # 2. Build context
    context_str = ""
    if not docs:
        context_str = "No products found matching the query."
    else:
        for i, doc in enumerate(docs):
            meta = doc.get("metadata", {})
            context_str += f"[Product {i+1}]\n"
            context_str += f"Name: {meta.get('product_name', 'Unknown')}\n"
            context_str += f"ID: {meta.get('product_id', 'Unknown')}\n"
            context_str += f"Price: Rs.{meta.get('price', 'Unknown')}\n"
            context_str += f"Stock: {meta.get('stock', 'Unknown')} units\n"
            context_str += f"Location: {meta.get('location', 'Unknown')}\n\n"
            
    prompt = f"{RAG_SYSTEM_PROMPT}\n\nContext:\n{context_str}\nUser Query: {query}\n\nOutput JSON ONLY:"
    
    # 3. Send context + query to local Gemma 4 using LangChain
    # LangChain Ollama wrapper connects to our existing OLLAMA_HOST
    llm = OllamaLLM(base_url=OLLAMA_HOST, model=GEMMA_MODEL)
    
    try:
        response_text = llm.invoke(prompt)
        
        # 4. Extract and validate JSON structured output
        clean_json = response_text.strip()
        if clean_json.startswith("```json"):
            clean_json = clean_json[7:]
        if clean_json.startswith("```"):
            clean_json = clean_json[3:]
        if clean_json.endswith("```"):
            clean_json = clean_json[:-3]
        clean_json = clean_json.strip()
        
        try:
            parsed = json.loads(clean_json)
            
            # Ensure it adheres to the structure
            validated = {
                "intent": str(parsed.get("intent", "conversational")),
                "product_id": parsed.get("product_id"),
                "product_name": parsed.get("product_name"),
                "response": str(parsed.get("response", "I found the information.")),
                "navigation_required": bool(parsed.get("navigation_required", False)),
                "cart_action": parsed.get("cart_action"),
                "confidence": float(parsed.get("confidence", 0.0))
            }
            return validated
            
        except json.JSONDecodeError:
            logger.error(f"Failed to parse Gemma RAG output as JSON. Output: {response_text}")
            return _fallback_error_response("I found some information, but I couldn't format it properly.")
            
    except Exception as e:
        logger.error(f"Error calling local Gemma LLM in RAG pipeline: {e}")
        return _fallback_error_response("Sorry, my reasoning engine is currently unavailable.")

def _fallback_error_response(message: str) -> Dict[str, Any]:
    return {
        "intent": "conversational",
        "product_id": None,
        "product_name": None,
        "response": message,
        "navigation_required": False,
        "cart_action": None,
        "confidence": 0.0
    }
