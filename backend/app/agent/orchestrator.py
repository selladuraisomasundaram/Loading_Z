import json
import re
import os
import hashlib
from typing import Dict, Any, List, Optional
from app.gemma.engine import get_ollama_client, GEMMA_MODEL
from app.agent.tools import search_catalog, get_route, check_inventory, search_web
from app.navigation.pathfinder import map_to_spatial_node

INTENT_SYSTEM_INSTRUCTION = (
    "You are an intent parser for a supermarket smart trolley assistant.\n"
    "Identify which tool to use and its argument based on the user's message.\n"
    "Available tools:\n"
    "1. search_catalog(query): User searches for a product or asks about a store product name (e.g. 'Where is butter?', 'Find me milk').\n"
    "2. get_route(destination): User asks for directions, path, route, navigation, or how to get somewhere (e.g. 'Show route to Aisle 3', 'Navigate to checkout').\n"
    "3. check_inventory(sku): User asks about stock levels or checks inventory/price for a SKU format SKU-XXXXXX (e.g. 'Is SKU-E4B92C in stock?').\n"
    "4. search_web(query): You have access to a web search tool. ONLY use it for general knowledge, recipes, or nutrition. NEVER use it to check product prices, stock, or aisles—assume store data requires the catalog tool.\n"
    "5. conversational: Greetings, general conversation, or queries requiring no tools (e.g. 'Hi', 'Hello').\n\n"
    "Output valid JSON format with keys:\n"
    "- 'tool': 'search_catalog', 'get_route', 'check_inventory', 'search_web', or 'conversational'\n"
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
    if any(w in lower for w in ("recipe", "cook", "how to make", "ingredients for", "nutrition", "calories", "healthy", "health benefits", "benefits of", "why is", "what is")):
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
            
    # 3. Check for get_route
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
    if any(w in lower for w in ("find", "search", "where", "have", "buy", "get", "price of", "locate")):
        query = lower
        for word in ("where is", "where can i find", "do you have", "find", "search for", "locate", "price of", "price"):
            if word in query:
                query = query.replace(word, "")
        query = query.strip("? .,").strip()
        return {"tool": "search_catalog", "argument": query if query else lower}
        
    if len(lower.split()) <= 4 and lower not in ("hi", "hello", "hey", "who are you", "help"):
        return {"tool": "search_catalog", "argument": message.strip()}
        
    return {"tool": "conversational", "argument": ""}

async def orchestrate_message(message: str) -> Dict[str, Any]:
    client = get_ollama_client()
    model_name = os.getenv("GEMMA_MODEL", GEMMA_MODEL)
    
    # 1. Parse user intent (try Gemma, fallback to rule-based)
    tool_activity: List[Dict[str, str]] = []
    tool = "conversational"
    argument = ""
    
    try:
        response = await client.chat(
            model=model_name,
            messages=[{
                "role": "user",
                "content": f"{INTENT_SYSTEM_INSTRUCTION}\nUser message: {message}"
            }],
            format="json"
        )
        content = response.get("message", {}).get("content", "")
        parsed = json.loads(content)
        tool = str(parsed.get("tool", "conversational")).strip()
        argument = str(parsed.get("argument", "")).strip()
    except Exception as e:
        print(f"Orchestrator intent parsing fallback triggered: {e}")
        fallback = fallback_parse_intent(message)
        tool = fallback["tool"]
        argument = fallback["argument"]
        
    # Standardize tool logging
    tool_activity.append({
        "step": "Gemma Tool Selection",
        "action": f"{tool}('{argument}')" if tool != "conversational" else "conversational",
        "result": f"{tool}('{argument}')" if tool != "conversational" else "conversational"
    })
    
    response_text = ""
    target_aisle: Optional[str] = None
    route: Optional[Dict[str, Any]] = None
    
    # 2. Execute selected tool
    if tool == "search_web":
        search_query = argument if argument else message
        web_results = search_web(search_query)
        snippet_preview = web_results[:140] + "..." if len(web_results) > 140 else web_results
        tool_activity.append({
            "step": "DuckDuckGo Web Search",
            "action": f"search_web('{search_query}')",
            "result": snippet_preview
        })

        try:
            prompt = (
                f"You are a helpful supermarket smart trolley assistant.\n"
                f"User query: {message}\n"
                f"Web Search Results:\n{web_results}\n\n"
                f"Synthesize a clear, accurate, and concise natural language answer based on the web search results above."
            )
            resp = await client.chat(model=model_name, messages=[{"role": "user", "content": prompt}])
            response_text = resp.get("message", {}).get("content", "").strip()
        except Exception:
            response_text = f"Here is what I found online regarding '{search_query}':\n\n{web_results}"

    elif tool == "search_catalog":
        prod_data = search_catalog(argument)
        if prod_data.get("success") and prod_data.get("verified"):
            price_str = f"₹{prod_data['price']}"
            aisle_info = prod_data["aisle"]
            tool_activity.append({
                "step": "Database Query",
                "action": f"{aisle_info}, Price {price_str}",
                "result": f"{aisle_info}, Price {price_str}"
            })
            
            # Auto-calculate route to the product's aisle
            canonical_aisle = map_to_spatial_node(aisle_info)
            route_data = get_route(canonical_aisle)
            if route_data.get("success"):
                route = route_data
                target_aisle = canonical_aisle
                tool_activity.append({
                    "step": "Pathfinder Execution",
                    "action": f"Route ENTRANCE -> {canonical_aisle} calculated",
                    "result": f"Route ENTRANCE -> {canonical_aisle} calculated"
                })
                
            # Formulate response
            try:
                prompt = (
                    f"{RESPONSE_SYSTEM_INSTRUCTION}\n"
                    f"Product details: {json.dumps(prod_data)}\n"
                    f"Navigation: Route ENTRANCE -> {canonical_aisle} (Distance: {route['distance_meters']:.1f}m)"
                )
                resp = await client.chat(model=model_name, messages=[{"role": "user", "content": prompt}])
                response_text = resp.get("message", {}).get("content", "").strip()
            except Exception:
                response_text = (
                    f"{prod_data['product_name']} ({prod_data['brand']}) is located in {prod_data['aisle']}, {prod_data['shelf']}. "
                    f"Price: {price_str}, Stock: {prod_data['stock']} units. I've highlighted the route on your map."
                )
        else:
            tool_activity.append({
                "step": "Database Query",
                "action": "Product not found",
                "result": "Product not found"
            })
            response_text = f"I couldn't find any products matching '{argument}' in our store catalog."
            
    elif tool == "get_route":
        canonical_dest = map_to_spatial_node(argument)
        route_data = get_route(canonical_dest)
        if route_data.get("success"):
            route = route_data
            target_aisle = canonical_dest
            tool_activity.append({
                "step": "Pathfinder Execution",
                "action": f"Route ENTRANCE -> {canonical_dest} calculated",
                "result": f"Route ENTRANCE -> {canonical_dest} calculated"
            })
            
            try:
                prompt = (
                    f"{RESPONSE_SYSTEM_INSTRUCTION}\n"
                    f"Route details: Start ENTRANCE, Destination {canonical_dest}, "
                    f"Waypoints {route['waypoints']}, Distance {route['distance_meters']:.1f}m"
                )
                resp = await client.chat(model=model_name, messages=[{"role": "user", "content": prompt}])
                response_text = resp.get("message", {}).get("content", "").strip()
            except Exception:
                response_text = (
                    f"The route to {canonical_dest} is calculated. "
                    f"Waypoints: {' -> '.join(route['waypoints'])} (Distance: {route['distance_meters']:.1f} meters)."
                )
        else:
            tool_activity.append({
                "step": "Pathfinder Execution",
                "action": "Route calculation failed",
                "result": "Route calculation failed"
            })
            response_text = f"I'm sorry, I was unable to calculate a route to '{argument}'."
            
    elif tool == "check_inventory":
        prod_data = check_inventory(argument)
        if prod_data.get("success") and prod_data.get("verified"):
            stock_qty = prod_data["stock"]
            price_str = f"₹{prod_data['price']}"
            tool_activity.append({
                "step": "Database Query",
                "action": f"SKU {argument} has stock {stock_qty}, price {price_str}",
                "result": f"SKU {argument} has stock {stock_qty}, price {price_str}"
            })
            
            canonical_aisle = map_to_spatial_node(prod_data["aisle"])
            route_data = get_route(canonical_aisle)
            if route_data.get("success"):
                route = route_data
                target_aisle = canonical_aisle
                tool_activity.append({
                    "step": "Pathfinder Execution",
                    "action": f"Route ENTRANCE -> {canonical_aisle} calculated",
                    "result": f"Route ENTRANCE -> {canonical_aisle} calculated"
                })
                
            try:
                prompt = (
                    f"{RESPONSE_SYSTEM_INSTRUCTION}\n"
                    f"Inventory details: Product {prod_data['product_name']}, SKU {prod_data['sku']}, "
                    f"Price {price_str}, Stock {stock_qty}, Aisle {prod_data['aisle']}"
                )
                resp = await client.chat(model=model_name, messages=[{"role": "user", "content": prompt}])
                response_text = resp.get("message", {}).get("content", "").strip()
            except Exception:
                response_text = (
                    f"{prod_data['product_name']} (SKU: {prod_data['sku']}) is in stock with {stock_qty} units available. "
                    f"Price: {price_str}. It is located in {prod_data['aisle']}."
                )
        else:
            tool_activity.append({
                "step": "Database Query",
                "action": f"SKU {argument} not found",
                "result": f"SKU {argument} not found"
            })
            response_text = f"I couldn't find any catalog matches for SKU '{argument}'."
            
    else: # conversational
        try:
            resp = await client.chat(model=model_name, messages=[{"role": "user", "content": message}])
            response_text = resp.get("message", {}).get("content", "").strip()
        except Exception:
            response_text = "Hello! I am your Smart Trolley Assistant. How can I help you find items or navigate the store today?"

    # Build response dictionary combining snake_case and camelCase parameters for frontend compatibility
    timestamp_str = "12:00:00 PM"
    return {
        # Prompt matching structure
        "response": response_text,
        "tool_activity": tool_activity,
        "target_aisle": target_aisle,
        "route": route,
        
        # Frontend ChatMessage contract compatibility
        "id": f"msg-bot-{hashlib.md5(response_text.encode()).hexdigest()[:4].upper()}",
        "sender": "assistant",
        "text": response_text,
        "timestamp": timestamp_str,
        "toolActivity": tool_activity,
        "targetAisle": target_aisle
    }
