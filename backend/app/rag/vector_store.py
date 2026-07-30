import os
import logging
from typing import Optional, List, Any
from langchain_community.vectorstores import FAISS
from langchain_core.documents import Document
from app.rag.config import FAISS_INDEX_DIR, FAISS_INDEX_NAME, BATCH_SIZE
from app.rag.embeddings import get_embedding_model
from app.rag.db_connector import fetch_all_products
from app.rag.document_loader import convert_products_to_documents

logger = logging.getLogger(__name__)

_vector_store_cache: Optional[FAISS] = None

def get_faiss_file_paths() -> tuple[str, str]:
    """
    Returns expected FAISS index file paths (index.faiss and index.pkl).
    """
    faiss_file = os.path.join(FAISS_INDEX_DIR, f"{FAISS_INDEX_NAME}.faiss")
    pkl_file = os.path.join(FAISS_INDEX_DIR, f"{FAISS_INDEX_NAME}.pkl")
    return faiss_file, pkl_file

def is_index_persisted() -> bool:
    """
    Checks if a valid persisted FAISS index exists on disk.
    """
    faiss_file, pkl_file = get_faiss_file_paths()
    exists = os.path.exists(faiss_file) and os.path.exists(pkl_file)
    logger.info(f"FAISS index persistence check: {exists} (Directory: {FAISS_INDEX_DIR})")
    return exists

def save_vector_store(vector_store: FAISS) -> bool:
    """
    Saves FAISS vector store to disk.
    """
    try:
        os.makedirs(FAISS_INDEX_DIR, exist_ok=True)
        vector_store.save_local(FAISS_INDEX_DIR, FAISS_INDEX_NAME)
        logger.info(f"FAISS vector store successfully saved to '{FAISS_INDEX_DIR}' as '{FAISS_INDEX_NAME}'.")
        return True
    except Exception as e:
        logger.error(f"Failed to save FAISS vector store: {e}", exc_info=True)
        return False

def load_vector_store(embeddings: Any = None) -> Optional[FAISS]:
    """
    Loads persisted FAISS vector store from disk.
    """
    if not is_index_persisted():
        logger.warning("Attempted to load FAISS vector store, but index is not persisted.")
        return None

    try:
        if embeddings is None:
            embeddings = get_embedding_model()

        logger.info(f"Loading FAISS vector store from '{FAISS_INDEX_DIR}'...")
        vector_store = FAISS.load_local(
            FAISS_INDEX_DIR,
            embeddings,
            index_name=FAISS_INDEX_NAME,
            allow_dangerous_deserialization=True
        )
        logger.info("FAISS vector store loaded successfully.")
        return vector_store
    except Exception as e:
        logger.error(f"Error loading FAISS vector store from disk: {e}", exc_info=True)
        return None

def build_vector_store(documents: List[Document], embeddings: Any = None) -> Optional[FAISS]:
    """
    Builds FAISS vector store from LangChain documents in batches for performance optimization.
    Persists the created index to disk.
    """
    if not documents:
        logger.error("Cannot build FAISS vector store: No documents provided.")
        return None

    try:
        if embeddings is None:
            embeddings = get_embedding_model()

        logger.info(f"Building FAISS vector store for {len(documents)} documents (batch size: {BATCH_SIZE})...")

        # Process first batch to initialize FAISS
        first_batch = documents[:BATCH_SIZE]
        vector_store = FAISS.from_documents(first_batch, embeddings)
        logger.info(f"Processed initial batch of {len(first_batch)} documents.")

        # Process remaining batches
        for i in range(BATCH_SIZE, len(documents), BATCH_SIZE):
            batch = documents[i : i + BATCH_SIZE]
            vector_store.add_documents(batch)
            logger.info(f"Processed batch {i // BATCH_SIZE + 1} ({i + len(batch)} / {len(documents)} documents completed).")

        # Persist to disk
        save_vector_store(vector_store)
        return vector_store

    except Exception as e:
        logger.error(f"Failed to build FAISS vector store: {e}", exc_info=True)
        return None

def get_or_create_vector_store(force_rebuild: bool = False) -> Optional[FAISS]:
    """
    Singleton manager: returns cached or persisted FAISS store, or builds it from DB if missing.
    """
    global _vector_store_cache

    if _vector_store_cache is not None and not force_rebuild:
        return _vector_store_cache

    # 1. Try loading from disk persistence if not force_rebuild
    if not force_rebuild and is_index_persisted():
        store = load_vector_store()
        if store is not None:
            _vector_store_cache = store
            return store

    # 2. Build from 27K database
    logger.info("Building new RAG FAISS vector store from database records...")
    products = fetch_all_products()
    if not products:
        logger.error("No products retrieved from database. Vector store creation aborted.")
        return None

    documents = convert_products_to_documents(products)
    if not documents:
        logger.error("No valid documents generated from products. Vector store creation aborted.")
        return None

    store = build_vector_store(documents)
    if store is not None:
        _vector_store_cache = store

    return store
