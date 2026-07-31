import os
import sys
import logging

# Configure basic logging for the script
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

# Ensure backend directory is in sys.path
backend_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if backend_dir not in sys.path:
    sys.path.insert(0, backend_dir)

from app.rag.rag_service import rag_service

def main():
    logger.info("Starting FAISS Index Build Process for all 27K products...")
    
    # Initialize the system with force_rebuild=True to overwrite the test index
    # and fetch all products from the live DB.
    result = rag_service.initialize_system(force_rebuild=True)
    
    if result.get("success"):
        logger.info("FAISS Index built and persisted successfully!")
    else:
        logger.error(f"FAISS Index build failed: {result.get('error') or result.get('message')}")

if __name__ == "__main__":
    main()
