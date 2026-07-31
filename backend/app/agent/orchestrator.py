import json
import re
import os
import asyncio
import hashlib
from typing import Dict, Any, List, Optional
from app.gemma.engine import get_ollama_client, GEMMA_MODEL
from app.agent.tools import search_catalog, get_route, check_inventory, search_web
from app.navigation.pathfinder import map_to_spatial_node

INTENT_SYSTEM_INSTRUCTION = (
    "You are an intent parser for a supermarket smart trolley assistant.\n"
    "Identify which tool to use and its argument based on the user's message.\n"
    "Available tools:\n"
    "1. search_catalog(query): User searches for a single specific product or asks about a single product (e.g. 'Where is butter?', 'Find me milk', 'what is price of navarathna oil'). The argument MUST be JUST the product name, stripped of all filler words like 'price of', 'where is', 'what is'. Example: 'navarathna oil'.\n"
    "2. query_database_nl(query): User asks a complex question requiring filtering, sorting, or aggregating multiple products (e.g. 'show me 10 products above 100', 'what are the cheapest snacks', 'list 5 drinks under 50'). The argument is the user's full request.\n"
    "3. get_route(destination): User asks for directions, path, route, navigation, or how to get somewhere (e.g. 'Show route to Aisle 3', 'Navigate to checkout').\n"
    "4. check_inventory(sku): User asks about stock levels or checks inventory/price for a SKU format SKU-XXXXXX (e.g. 'Is SKU-E4B92C in stock?').\n"
    "5. search_web(query): You have access to a web search tool. ONLY use it for general knowledge, recipes, or nutrition. NEVER use it to check product prices, stock, or aisles.\n"
    "6. conversational: Greetings, general conversation, or queries requiring no tools (e.g. 'Hi', 'Hello').\n\n"
    "Output valid JSON format with keys:\n"
    "- 'tool': 'search_catalog', 'query_database_nl', 'get_route', 'check_inventory', 'search_web', or 'conversational'\n"
    "- 'argument': query, destination, SKU, or empty string."
)

RESPONSE_SYSTEM_INSTRUCTION = (
    "You are a helpful supermarket smart trolley assistant.\n"
    "Formulate a concise, polite conversational response to the user based ONLY on the provided tool result details.\n"
    "Strictly avoid hallucinating price, stock, or location details. Do not state info not provided in the tool output."
)

def fallback_parse_intent(message: str) -> Dict[str, Any]:
    lower = message.lower().strip()
    # 0. Check for conversational greetings or help
    if any(w in lower for w in ("hi", "hello", "hey", "morning", "afternoon", "evening", "who are you", "help", "thank", "thanks")):
        return {"tool": "conversational", "argument": ""}

    # 1. Check for search_web (recipes, nutrition, health, general knowledge)
    if any(w in lower for w in ("recipe", "cook", "how to make", "ingredients for", "nutrition", "calories", "healthy", "health benefits", "benefits of", "pairs best with", "pairs with")):
        return {"tool": "search_web", "argument": message.strip()}

    # 2. Check for check_inventory (SKU)
    sku_match = re.search(r'sku-[a-f0-9]{4,8}', lower)
    if not sku_match:
        sku_match = re.search(r'sku[a-f0-9]{4,8}', lower)
    if not sku_match:
        sku_match = re.search(r'\b[a-f0-9]{6}\b', lower)
        
    if sku_match:
        sku = sku_match.group(0).upper()
        if not sku.startswith("SKU-") and len(sku) == 6:
            sku = f"SKU-{sku}"
        elif sku.startswith("SKU") and len(sku) == 9:
            sku = f"SKU-{sku[3:]}"
        # If they mention stock/price/have or check, it's inventory
        if any(w in lower for w in ("stock", "inventory", "left", "have", "qty", "quantity", "available", "check", "price")):
            return {"tool": "check_inventory", "argument": sku}
            
    # 3. Check for query_database_nl
    if any(w in lower for w in ("above", "under", "less than", "more than", "cheapest", "most expensive", "list", "show me all", "how many", "filter", "sort by")):
        return {"tool": "query_database_nl", "argument": message.strip()}

    # 4. Check for get_route
    if any(w in lower for w in ("route", "path", "map", "navigate", "directions", "way to", "get to", "go to")):
        dest = "ENTRANCE"
        if "checkout" in lower:
            dest = "CHECKOUT"
        elif "entrance" in lower:
            dest = "ENTRANCE"
        else:
            aisle_match = re.search(r'aisle\s*\d+', lower)
            if aisle_match:
                dest = aisle_match.group(0).upper().replace(" ", "_")
            else:
                for indicator in ("way to", "get to", "go to", "route to", "path to", "directions to"):
                    if indicator in lower:
                        parts = lower.split(indicator)
                        if len(parts) > 1:
                            dest = parts[1].strip()
                            break
        return {"tool": "get_route", "argument": dest}
        
    # 4. Check for search_catalog
    if any(w in lower for w in ("find", "search", "where", "have", "buy", "get", "price of", "price", "locate")):
        query = lower
        # Remove filler words longest first
        fillers = ["what is the price of", "what is price of", "what is the price for", "price of", "price for", "price", "where is", "where can i find", "do you have", "find", "search for", "locate"]
        for word in fillers:
            if word in query:
                query = query.replace(word, "")
        query = query.strip("? .,").strip()
        query = " ".join(query.split()) # clean up extra spaces
        return {"tool": "search_catalog", "argument": query if query else lower}
        
    if len(lower.split()) <= 4 and lower not in ("hi", "hello", "hey", "who are you", "help"):
        return {"tool": "search_catalog", "argument": message.strip()}
        
    return {"tool": "conversational", "argument": ""}

async def orchestrate_message(message: str) -> Dict[str, Any]:
    from app.rag.nlp_processor import process_nlp_query
    from app.rag.pipeline import execute_rag_pipeline
    
    tool_activity: List[Dict[str, str]] = []
    
    # 1. Gemma RAG Intelligence Layer
    tool_activity.append({"step": "NLP Processing", "action": "Analyzing intent & extracting entities via Gemma RAG"})
    
    rag_result = execute_rag_pipeline(message)
    intent = rag_result.get("intent", "UNKNOWN")
    
    tool_activity.append({"step": "Intent Detected", "action": f"Classified as {intent}", "result": str(rag_result)})
    
    # Extract query term from RAG entities
    query_term = rag_result.get("product_name") or message
    
    # Clean filler words for catalog search just in case Gemma didn't strip them
    for filler in ["where is the", "where is", "where can i find", "show me where", "show me", "take me to the", "take me to", "is", "available", "find me a product for", "cheapest"]:
        pattern = r'\b' + re.escape(filler) + r'\b'
        if re.search(pattern, query_term, flags=re.IGNORECASE):
            query_term = re.sub(pattern, "", query_term, flags=re.IGNORECASE).strip()
            
    query_term = re.sub(r'\s+', ' ', query_term).strip()

    # 2. Database Catalog Search (Source of Truth)
    tool_activity.append({"step": "Product DB Search", "action": f"Querying smart_trolley.db for '{query_term}'"})
    prod_data = search_catalog(query_term if query_term else message)
    
    target_aisle: Optional[str] = None
    target_product_data: Optional[Dict[str, Any]] = None
    multiple_matches: List[Dict[str, Any]] = []
    
    if prod_data.get("found"):
        stock = prod_data.get("stock", 0)
        p_name = prod_data.get("product_name", "Product")
        aisle = prod_data.get("aisle", "Aisle 1")
        category = prod_data.get("category", "General")
        brand = prod_data.get("brand", "")
        shelf = prod_data.get("shelf", "Shelf 1")
        multiple_matches = prod_data.get("matches", [])

        # Low stock threshold (configurable)
        LOW_STOCK_THRESHOLD = 5
        
        # Determine availability status
        if stock <= 0:
            availability = "Out of Stock"
        elif stock <= LOW_STOCK_THRESHOLD:
            availability = "Low Stock"
        else:
            availability = "In Stock"
        
        target_aisle = aisle
        target_product_data = {
          "id": prod_data.get("sku") or "SKU-001",
          "productId": prod_data.get("sku") or "SKU-001",
          "name": p_name,
          "productName": p_name,
          "brand": brand,
          "price": prod_data.get("price", 0),
          "stock": stock,
          "category": category,
          "aisleId": aisle,
          "shelfId": shelf,
          "mapX": prod_data.get("x", 510),
          "mapY": prod_data.get("y", 95),
          "availability": availability,
          "weightGrams": 0
        }
        
        from langchain_ollama import OllamaLLM
        from app.gemma.engine import OLLAMA_HOST, GEMMA_MODEL
        
        # Format the context for Gemma to generate a natural response
        gemma_prompt = (
            "You are a Smart Supermarket Assistant. A user asked a query. "
            "Based ONLY on the product details below, write a very concise (1-2 sentences), natural response. "
            "Do NOT invent information. "
            f"User Query: '{message}'\n"
            f"Product: {p_name}\n"
            f"Category: {category}\n"
            f"Aisle: {aisle}\n"
            f"Stock: {stock} units\n"
        )
        if stock <= 0:
            gemma_prompt += "Instruction: Tell the user it is out of stock but state the aisle it belongs in."
        elif stock <= LOW_STOCK_THRESHOLD:
            gemma_prompt += "Instruction: Tell the user it is in stock but warn them it's running low. State the aisle."
        else:
            gemma_prompt += "Instruction: Tell the user it is in stock and state the aisle."

        try:
            llm = OllamaLLM(base_url=OLLAMA_HOST, model=GEMMA_MODEL)
            response_text = llm.invoke(gemma_prompt).strip()
        except Exception as e:
            # Fallback if Gemma is offline
            if stock > LOW_STOCK_THRESHOLD:
                response_text = f"{p_name} is in {aisle}, {category}. It is currently in stock."
            elif stock > 0:
                response_text = f"{p_name} is in {aisle}, {category}. Only {stock} units left — hurry!"
            else:
                response_text = f"{p_name} is located in {aisle}, but it is currently out of stock."
            
        tool_activity.append({
            "step": "Location Resolved",
            "action": f"Found {p_name} in {aisle}",
            "result": f"Stock: {stock} ({availability})"
        })
    else:
        # Product not found in SQLite DB exactly by name, fallback to Gemma's FAISS RAG response!
        response_text = rag_result.get("response")
        if not response_text or response_text == "I found the information.":
            response_text = "I couldn't find that product in the catalog, but feel free to ask a staff member."
            
        tool_activity.append({
            "step": "Product DB Search",
            "action": "Product not found in strict DB match, falling back to RAG semantic search",
            "result": "404"
        })
    
    timestamp_str = new_ts = "12:00:00 PM"
    return {
        "response": response_text,
        "tool_activity": tool_activity,
        "target_aisle": target_aisle,
        "target_product": target_product_data,
        "multiple_matches": multiple_matches,
        
        # Frontend ChatMessage compatibility
        "id": f"msg-bot-{hashlib.md5(response_text.encode()).hexdigest()[:4].upper()}",
        "sender": "assistant",
        "text": response_text,
        "timestamp": timestamp_str,
        "toolActivity": tool_activity,
        "targetAisle": target_aisle,
        "targetProductId": target_product_data.get("id") if target_product_data else None,
        "targetProductName": target_product_data.get("name") if target_product_data else None,
        "targetProduct": target_product_data,
        "multipleMatches": multiple_matches
    }
