import logging
from typing import List, Dict, Any, Optional
from app.rag.config import DEFAULT_TOP_K
from app.rag.vector_store import get_or_create_vector_store

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
        for doc, score in results_with_score:
            formatted_results.append({
                "page_content": doc.page_content,
                "metadata": doc.metadata,
                "score": float(score),
                # Metadata convenience shortcuts
                "product_id": doc.metadata.get("product_id"),
                "product_name": doc.metadata.get("product_name"),
                "category": doc.metadata.get("category"),
                "brand": doc.metadata.get("brand"),
                "price": doc.metadata.get("price"),
                "stock": doc.metadata.get("stock"),
                "location": doc.metadata.get("location"),
                "aisle": doc.metadata.get("aisle"),
                "shelf": doc.metadata.get("shelf"),
            })

        logger.info(f"RAG similarity search returned {len(formatted_results)} results.")
        return formatted_results

    except Exception as e:
        logger.error(f"Error during RAG similarity search for query '{query}': {e}", exc_info=True)
        return []
