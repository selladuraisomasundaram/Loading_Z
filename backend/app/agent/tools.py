from typing import Dict, Any, Optional
from services.product_service import resolve_product, search_products
from app.navigation.pathfinder import calculate_route

def search_catalog(query: str) -> Dict[str, Any]:
    """
    Queries the product database to find matching products by name, category, or substring.
    """
    if not query or not query.strip():
        return {
            "success": False,
            "found": False,
            "error": "Query cannot be empty"
        }
    
    # Check multi-match list to see if query matches a broad category or brand
    matches = search_products(query, limit=5)
    product = resolve_product(query, allow_fallback=False)
    
    if not product and not matches:
        return {
            "success": True,
            "found": False,
            "error": f"No product found matching '{query}'"
        }
        
    if not product and matches:
        first = matches[0]
        return {
            "success": True,
            "found": True,
            "sku": first.get("sku") or first.get("id"),
            "product_name": first.get("product_name"),
            "brand": first.get("brand"),
            "category": first.get("category"),
            "sub_category": first.get("sub_category"),
            "price": first.get("price"),
            "stock": first.get("stock", 0),
            "aisle": first.get("aisle", "Aisle 1"),
            "shelf": first.get("shelf", "Shelf 1"),
            "x": first.get("x", 200),
            "y": first.get("y", 350),
            "matches": matches
        }

    return {
        "success": True,
        "found": True,
        "sku": product.sku,
        "product_name": product.product_name,
        "brand": product.brand,
        "category": product.category,
        "sub_category": product.sub_category,
        "price": product.price,
        "stock": product.stock,
        "aisle": getattr(product, "aisle", "Aisle 1"),
        "shelf": getattr(product, "shelf", "Shelf 1"),
        "x": getattr(product, "x", 200),
        "y": getattr(product, "y", 350),
        "verified": product.verified,
        "matches": matches if len(matches) > 1 else []
    }

def get_route(destination: str) -> Dict[str, Any]:
    """
    Invokes the NetworkX pathfinder to calculate a route to the destination.
    """
    if not destination or not destination.strip():
        return {
            "success": False,
            "error": "Destination cannot be empty"
        }
    
    # Calculate route from the default "ENTRANCE" location
    route = calculate_route(start_node="ENTRANCE", destination_node=destination)
    return {
        "success": True,
        **route
    }

def check_inventory(sku: str) -> Dict[str, Any]:
    """
    Checks the database stock level and pricing for a specific SKU.
    """
    if not sku or not sku.strip():
        return {
            "success": False,
            "error": "SKU cannot be empty"
        }
    
    product = resolve_product(sku)
    return {
        "success": True,
        "sku": product.sku,
        "product_name": product.product_name,
        "brand": product.brand,
        "price": product.price,
        "stock": product.stock,
        "aisle": product.aisle,
        "shelf": product.shelf,
        "verified": product.verified
    }

def search_web(query: str) -> str:
    """
    Executes a web search using DuckDuckGo to fetch up-to-date snippets for recipes,
    nutritional facts, or general knowledge. Returns a concatenated readable context string.
    """
    if not query or not query.strip():
        return "Web search query was empty."

    snippets = []
    
    # 1. Try DDGS().text() from duckduckgo_search library
    try:
        from duckduckgo_search import DDGS
        with DDGS() as ddgs:
            results = list(ddgs.text(query, max_results=3))
            for res in results:
                title = str(res.get("title", "")).strip()
                body = str(res.get("body", res.get("snippet", ""))).strip()
                if title or body:
                    snippets.append(f"Title: {title}\nSnippet: {body}")
    except Exception as e:
        print(f"DDGS package search error / fallback triggered: {e}")

    # 2. Fallback to direct DuckDuckGo HTML parser if DDGS returns no results or fails
    if not snippets:
        try:
            import urllib.request
            import urllib.parse
            import re
            import html
            url = "https://html.duckduckgo.com/html/"
            params = urllib.parse.urlencode({'q': query}).encode('utf-8')
            headers = {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8'
            }
            req = urllib.request.Request(url, data=params, headers=headers)
            with urllib.request.urlopen(req, timeout=8) as response:
                body_content = response.read().decode('utf-8', errors='ignore')
            titles_and_links = re.findall(r'<a[^>]+class="result__a"[^>]*href="([^"]+)"[^>]*>(.*?)</a>', body_content, re.DOTALL)
            raw_snippets = re.findall(r'<a[^>]+class="result__snippet"[^>]*>(.*?)</a>', body_content, re.DOTALL)
            for i in range(min(len(titles_and_links), len(raw_snippets), 3)):
                _, raw_t = titles_and_links[i]
                raw_s = raw_snippets[i]
                c_title = html.unescape(re.sub(r'<[^<]+?>', '', raw_t)).strip()
                c_snippet = html.unescape(re.sub(r'<[^<]+?>', '', raw_s)).strip()
                if c_title or c_snippet:
                    snippets.append(f"Title: {c_title}\nSnippet: {c_snippet}")
        except Exception as fallback_err:
            print(f"Direct HTML fallback search error: {fallback_err}")

    if not snippets:
        return f"No web search results found for '{query}'."

    return "\n\n".join(snippets)

