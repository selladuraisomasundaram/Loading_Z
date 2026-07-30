import urllib.request
import urllib.parse
import re
import html
import json

def duckduckgo_web_search(query: str, max_results: int = 5):
    """
    Searches DuckDuckGo HTML endpoint for query and returns list of results with title, snippet, and link.
    """
    url = "https://html.duckduckgo.com/html/"
    params = urllib.parse.urlencode({'q': query}).encode('utf-8')
    headers = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5'
    }
    
    try:
        req = urllib.request.Request(url, data=params, headers=headers)
        with urllib.request.urlopen(req, timeout=10) as response:
            body = response.read().decode('utf-8', errors='ignore')
            
        # Parse titles, snippets, links
        results = []
        # Match result links & titles
        titles_and_links = re.findall(r'<a[^>]+class="result__a"[^>]*href="([^"]+)"[^>]*>(.*?)</a>', body, re.DOTALL)
        snippets = re.findall(r'<a[^>]+class="result__snippet"[^>]*>(.*?)</a>', body, re.DOTALL)
        
        for i in range(min(len(titles_and_links), len(snippets), max_results)):
            link, raw_title = titles_and_links[i]
            raw_snippet = snippets[i]
            
            clean_title = html.unescape(re.sub(r'<[^<]+?>', '', raw_title)).strip()
            clean_snippet = html.unescape(re.sub(r'<[^<]+?>', '', raw_snippet)).strip()
            
            # Clean duckduckgo redirect link if present
            if "/l/?" in link or "uddg=" in link:
                parsed_link = urllib.parse.parse_qs(urllib.parse.urlparse(link).query).get('uddg', [link])[0]
            else:
                parsed_link = link
                
            results.append({
                "title": clean_title,
                "snippet": clean_snippet,
                "link": parsed_link
            })
            
        return {"success": True, "query": query, "results": results}
    except Exception as e:
        return {"success": False, "query": query, "error": str(e), "results": []}

if __name__ == "__main__":
    print(json.dumps(duckduckgo_web_search("Maggi noodles nutritional benefits"), indent=2))
