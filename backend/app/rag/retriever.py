import logging
from typing import List, Dict, Any, Optional
from app.rag.config import DEFAULT_TOP_K, LIVE_VALIDATE_FIELDS
from app.rag.vector_store import get_or_create_vector_store
from app.rag.db_connector import fetch_products_by_ids

logger = logging.getLogger(__name__)

def get_retriever(vector_store=None, top_k: int = DEFAULT_TOP_K):
    """
    Returns a standard LangChain VectorStoreRetriever interface for downstream RAG chains.
    """
    if vector_store is None:
        vector_store = get_or_create_vector_store()

    if vector_store is None:
        logger.error("Cannot create retriever: FAISS vector store is unavailable.")
        return None

    return vector_store.as_retriever(search_kwargs={"k": top_k})


def search_similar_products(query: str, top_k: int = DEFAULT_TOP_K, vector_store=None) -> List[Dict[str, Any]]:
    """
    Executes a similarity search against the 27K FAISS vector store.
    Returns a list of dictionaries with matching document contents, metadata, and similarity score.
    Safely handles edge cases like empty queries or database/vector store errors.
    
    IMPORTANT: Performs live DB validation for critical fields (price, stock, location)
    to prevent returning stale FAISS data to the user.
    """
    if not query or not query.strip():
        logger.warning("Empty search query provided to RAG retriever.")
        return []

    try:
        if vector_store is None:
            vector_store = get_or_create_vector_store()

        if vector_store is None:
            logger.error("RAG search failed: FAISS vector store could not be loaded or initialized.")
            return []

        logger.info(f"Executing RAG similarity search for query: '{query.strip()}' (top_k={top_k})")
        # Perform similarity search with score (L2 distance or inner product)
        results_with_score = vector_store.similarity_search_with_score(query.strip(), k=top_k)

        formatted_results = []
        product_ids = [doc.metadata.get("product_id") for doc, score in results_with_score if doc.metadata.get("product_id")]
        
        # Batch fetch from live DB to validate critical fields
        live_products = fetch_products_by_ids(product_ids)

        for doc, score in results_with_score:
            metadata = dict(doc.metadata)
            product_id = metadata.get("product_id")
            
            # Live validation
            if product_id and product_id in live_products:
                live_product = live_products[product_id]
                for field in LIVE_VALIDATE_FIELDS:
                    live_val = getattr(live_product, field, None)
                    if live_val is not None:
                        metadata[field] = live_val
                        
            formatted_results.append({
                "page_content": doc.page_content,
                "metadata": metadata,
                "score": float(score),
                # Metadata convenience shortcuts
                "product_id": metadata.get("product_id"),
                "product_name": metadata.get("product_name"),
                "category": metadata.get("category"),
                "brand": metadata.get("brand"),
                "price": metadata.get("price"),
                "stock": metadata.get("stock"),
                "location": metadata.get("location"),
                "aisle": metadata.get("aisle"),
                "shelf": metadata.get("shelf"),
            })

        logger.info(f"RAG similarity search returned {len(formatted_results)} results (validated against live DB).")
        return formatted_results

    except Exception as e:
        logger.error(f"Error during RAG similarity search for query '{query}': {e}", exc_info=True)
        return []
