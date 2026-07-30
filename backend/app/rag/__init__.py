"""
RAG (Retrieval-Augmented Generation) Module for Smart Supermarket Trolley.
Provides database access, product document conversion, embedding, FAISS vector store, and retriever capabilities.
"""

from .rag_service import rag_service, get_rag_service
from .pipeline import execute_rag_pipeline

__all__ = ["rag_service", "get_rag_service", "execute_rag_pipeline"]
