from app.gemma.engine import get_ollama_client, GEMMA_MODEL

def generate_route_explanation(stops: list, distance_meters: float) -> str:
    """
    Calls Gemma 4 E4B to generate a short, intelligent navigation tip 
    based on the calculated TSP route.
    """
    if not stops:
        return "Head straight to the checkout!"

    stop_names = [s.get("product_name", "Unknown Item") for s in stops]
    stop_str = ", ".join(stop_names)
    
    prompt = (
        f"The shopper has an optimized route with stops in this exact order: {stop_str}. "
        f"Total distance is {distance_meters} meters. "
        "Write a 2-sentence smart navigation tip for the user. "
        "Example: 'Gemma optimized your path: Pick up Aashirvaad Atta first, then head to Aisle 99 for your special web item, and grab chilled Milk last near checkout!'"
    )

    try:
        client = get_ollama_client()
        response = client.chat(
            model=GEMMA_MODEL,
            messages=[
                {"role": "system", "content": "You are a helpful supermarket navigation AI. Be extremely concise. Max 2 sentences. Sound smart and helpful."},
                {"role": "user", "content": prompt}
            ],
            options={"temperature": 0.3}
        )
        return response['message']['content'].strip()
    except Exception as e:
        print(f"Error generating route explanation: {e}")
        return f"Gemma optimized your route of {len(stops)} stops covering {distance_meters} meters. Follow the map to collect your items efficiently!"
