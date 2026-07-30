import logging
from typing import List, Optional
from sqlalchemy.orm import Session
from app.core.database import SessionLocal
from app.models.product import Product

logger = logging.getLogger(__name__)

def get_db_session(db: Optional[Session] = None) -> Session:
    """
    Returns the provided session or creates a new SessionLocal instance.
    """
    return db if db is not None else SessionLocal()

def fetch_all_products(db: Optional[Session] = None, batch_size: Optional[int] = None) -> List[Product]:
    """
    Fetches product records from the 27K SQLite database.
    Reuses existing database connection safely.
    Includes safe handling for database connection failure, invalid records, and missing fields.
    """
    session = None
    should_close = False

    try:
        if db is None:
            session = SessionLocal()
            should_close = True
        else:
            session = db

        logger.info("Executing database product query for RAG index loading...")
        query = session.query(Product)
        if batch_size:
            query = query.limit(batch_size)
            
        products = query.all()
        logger.info(f"Retrieved {len(products)} products from database.")

        # Filter out completely invalid records (missing ID and missing product_name)
        valid_products = []
        for p in products:
            if not p:
                continue
            # Ensure product has at least an ID or product name
            p_id = getattr(p, "id", None) or getattr(p, "sku", None)
            p_name = getattr(p, "product_name", None)
            if not p_id and not p_name:
                continue
            valid_products.append(p)

        logger.info(f"Filtered {len(valid_products)} valid products for RAG processing.")
        return valid_products

    except Exception as e:
        logger.error(f"Database connection failure or query error in db_connector: {e}", exc_info=True)
        return []

    finally:
        if should_close and session:
            session.close()

def fetch_product_by_id(product_id: str, db: Optional[Session] = None) -> Optional[Product]:
    """
    Fetches a single product record by primary key SKU/id.
    Used for live DB validation of critical fields (price, stock, location).
    """
    if not product_id:
        return None

    session = None
    should_close = False

    try:
        if db is None:
            session = SessionLocal()
            should_close = True
        else:
            session = db

        return session.query(Product).filter(Product.id == product_id).first()

    except Exception as e:
        logger.error(f"Error fetching product {product_id} from database: {e}")
        return None

    finally:
        if should_close and session:
            session.close()


def fetch_product_count(db: Optional[Session] = None) -> int:
    """
    Returns the total number of product records in the live database.
    Used for staleness detection — if count changed, the FAISS index is stale.
    """
    session = None
    should_close = False
    try:
        if db is None:
            session = SessionLocal()
            should_close = True
        else:
            session = db
        count = session.query(Product).count()
        return count
    except Exception as e:
        logger.error(f"Error fetching product count: {e}")
        return 0
    finally:
        if should_close and session:
            session.close()


def fetch_products_by_ids(product_ids: List[str], db: Optional[Session] = None) -> dict:
    """
    Batch-fetches multiple products by their SKU/id.
    Returns a dict keyed by product_id for O(1) lookup.
    Used for live DB validation after FAISS similarity search returns multiple results.
    """
    if not product_ids:
        return {}

    session = None
    should_close = False

    try:
        if db is None:
            session = SessionLocal()
            should_close = True
        else:
            session = db

        products = session.query(Product).filter(Product.id.in_(product_ids)).all()
        return {p.id: p for p in products}

    except Exception as e:
        logger.error(f"Error batch-fetching products {product_ids}: {e}")
        return {}

    finally:
        if should_close and session:
            session.close()
