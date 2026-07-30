import os

# Base directory paths
RAG_DIR = os.path.dirname(os.path.abspath(__file__))
BACKEND_DIR = os.path.abspath(os.path.join(RAG_DIR, "..", ".."))
DATA_DIR = os.path.join(BACKEND_DIR, "data")
FAISS_INDEX_DIR = os.path.join(DATA_DIR, "faiss_index")

# Ensure FAISS data directory exists
os.makedirs(FAISS_INDEX_DIR, exist_ok=True)

# Embedding configuration
EMBEDDING_MODEL_NAME = os.getenv("EMBEDDING_MODEL_NAME", "all-MiniLM-L6-v2")

# Vector Store configuration
FAISS_INDEX_NAME = "products_index"
BATCH_SIZE = int(os.getenv("RAG_BATCH_SIZE", "500"))
DEFAULT_TOP_K = int(os.getenv("RAG_DEFAULT_TOP_K", "5"))

# Index metadata file (used for staleness detection)
INDEX_METADATA_FILE = os.path.join(FAISS_INDEX_DIR, "index_metadata.json")

# Critical fields that MUST be refreshed from live DB before returning results
# These fields can become stale in FAISS if products are updated in the DB.
LIVE_VALIDATE_FIELDS = {"price", "stock", "aisle", "shelf", "location", "sale_price", "market_price"}
