import logging
from typing import Optional, Any
from langchain_huggingface import HuggingFaceEmbeddings
from app.rag.config import EMBEDDING_MODEL_NAME

logger = logging.getLogger(__name__)

_embedding_instance: Optional[Any] = None

def get_embedding_model() -> Any:
    """
    Returns a singleton instance of the HuggingFace sentence transformer embedding model.
    Includes safe fallback handling if model initialization fails.
    """
    global _embedding_instance
    if _embedding_instance is not None:
        return _embedding_instance

    try:
        logger.info(f"Loading embedding model: {EMBEDDING_MODEL_NAME}...")
        _embedding_instance = HuggingFaceEmbeddings(
            model_name=EMBEDDING_MODEL_NAME,
            model_kwargs={'device': 'cpu'},
            encode_kwargs={'normalize_embeddings': True}
        )
        logger.info("Embedding model loaded successfully.")
        return _embedding_instance
    except Exception as e:
        logger.error(f"Failed to load HuggingFaceEmbeddings model '{EMBEDDING_MODEL_NAME}': {e}", exc_info=True)
        # Attempt fallback to basic HuggingFaceEmbeddings without extra kwargs
        try:
            logger.info("Attempting fallback HuggingFaceEmbeddings initialization...")
            _embedding_instance = HuggingFaceEmbeddings(model_name=EMBEDDING_MODEL_NAME)
            return _embedding_instance
        except Exception as fallback_err:
            logger.critical(f"Critical failure initializing embedding model: {fallback_err}")
            raise RuntimeError(f"Embedding model initialization failed: {fallback_err}")
