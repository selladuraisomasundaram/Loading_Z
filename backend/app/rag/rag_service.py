import logging
from typing import Dict, Any, List, Optional
from app.rag.config import DEFAULT_TOP_K
from app.rag.db_connector import fetch_all_products, fetch_product_by_id
from app.rag.document_loader import product_to_document
from app.rag.vector_store import get_or_create_vector_store, is_index_persisted
from app.rag.retriever import search_similar_products, get_retriever

logger = logging.getLogger(__name__)

class RAGService:
    """
    Service facade for the RAG data access layer.
    Connects the 27K SQLite database to LangChain documents, FAISS vector store,
    and semantic vector retriever.
    """

    def initialize_system(self, force_rebuild: bool = False) -> Dict[str, Any]:
        """
        Initializes the RAG system: checks DB connection and ensures FAISS vector store exists.
        """
        try:
            persisted = is_index_persisted()
            logger.info(f"Initializing RAG Service (index_persisted={persisted}, force_rebuild={force_rebuild})...")
            
            store = get_or_create_vector_store(force_rebuild=force_rebuild)
            success = store is not None

            return {
                "success": success,
                "index_persisted": is_index_persisted(),
                "status": "ready" if success else "failed",
                "message": "RAG system initialized successfully." if success else "Failed to initialize RAG system."
            }
        except Exception as e:
            logger.error(f"Failed to initialize RAG Service: {e}", exc_info=True)
            return {
                "success": False,
                "index_persisted": False,
                "status": "error",
                "message": f"Error initializing RAG service: {str(e)}"
            }

    def retrieve_context(self, query: str, top_k: int = DEFAULT_TOP_K) -> Dict[str, Any]:
        """
        Retrieves relevant product documents matching the natural language query.
        """
        if not query or not query.strip():
            return {
                "success": False,
                "query": query,
                "count": 0,
                "results": [],
                "error": "Query string cannot be empty."
            }

        try:
            results = search_similar_products(query=query, top_k=top_k)
            return {
                "success": True,
                "query": query,
                "count": len(results),
                "results": results
            }
        except Exception as e:
            logger.error(f"Error in retrieve_context for query '{query}': {e}", exc_info=True)
            return {
                "success": False,
                "query": query,
                "count": 0,
                "results": [],
                "error": str(e)
            }

    def get_document_for_product(self, product_id: str) -> Optional[Dict[str, Any]]:
        """
        Fetches a product from the database and returns its LangChain Document representation & metadata.
        """
        product = fetch_product_by_id(product_id)
        if not product:
            return None

        doc = product_to_document(product)
        if not doc:
            return None

        return {
            "page_content": doc.page_content,
            "metadata": doc.metadata
        }

# Global singleton service instance
rag_service = RAGService()

def get_rag_service() -> RAGService:
    return rag_service
