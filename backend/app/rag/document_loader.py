import logging
from typing import Any, List, Optional, Dict
from langchain_core.documents import Document

logger = logging.getLogger(__name__)

def product_to_document(product: Any) -> Optional[Document]:
    """
    Converts a single Product ORM record or dictionary into a LangChain Document.
    Preserves all essential metadata fields while creating a rich page_content
    suitable for semantic vector embedding.
    """
    if not product:
        return None

    try:
        # Helper to safely retrieve attributes from either ORM instance or Dict
        def get_val(key: str, default: Any = "") -> Any:
            if isinstance(product, dict):
                v = product.get(key)
            else:
                v = getattr(product, key, None)
            return v if v is not None else default

        # Extract primary identifiers
        product_id = str(get_val("id") or get_val("sku") or "").strip()
        product_name = str(get_val("product_name") or get_val("name") or "").strip()

        # If both product_id and product_name are missing, it's an invalid record
        if not product_id and not product_name:
            logger.warning("Skipping product conversion due to missing id and product_name.")
            return None

        brand = str(get_val("brand") or "").strip()
        category = str(get_val("category") or "").strip()
        sub_category = str(get_val("sub_category") or "").strip()
        product_type = str(get_val("type") or "").strip()
        description = str(get_val("description") or "").strip()
        
        aisle = str(get_val("aisle") or "").strip()
        shelf = str(get_val("shelf") or "").strip()
        location_str = f"{aisle if aisle else 'Aisle Unknown'}, {shelf if shelf else 'Shelf Unknown'}"

        # Safe numeric parsing
        try:
            sale_price = float(get_val("sale_price", 0.0) or 0.0)
        except (ValueError, TypeError):
            sale_price = 0.0

        try:
            market_price = float(get_val("market_price", 0.0) or 0.0)
        except (ValueError, TypeError):
            market_price = 0.0

        # Determine effective display price
        if hasattr(product, "price"):
            try:
                price = float(product.price)
            except (ValueError, TypeError):
                price = sale_price or market_price or 0.0
        else:
            price = sale_price or market_price or 0.0

        try:
            stock = int(get_val("stock", 0) or 0)
        except (ValueError, TypeError):
            stock = 0

        try:
            rating = float(get_val("rating", 0.0) or 0.0)
        except (ValueError, TypeError):
            rating = 0.0

        verified = bool(get_val("verified", True))

        # Build rich composite text representation for vector indexing
        content_parts = []
        if product_name:
            content_parts.append(f"Product Name: {product_name}")
        if brand:
            content_parts.append(f"Brand: {brand}")
        if category or sub_category:
            cat_str = f"{category} > {sub_category}" if (category and sub_category) else (category or sub_category)
            content_parts.append(f"Category: {cat_str}")
        if product_type:
            content_parts.append(f"Type: {product_type}")
        if price > 0:
            content_parts.append(f"Price: ₹{price:.2f}")
        if aisle or shelf:
            content_parts.append(f"Store Location: {location_str}")
        if description:
            content_parts.append(f"Description: {description}")

        page_content = "\n".join(content_parts)

        # Preserve metadata as specified by Phase 2 requirements
        metadata: Dict[str, Any] = {
            "product_id": product_id,
            "product_name": product_name,
            "category": category,
            "sub_category": sub_category,
            "brand": brand,
            "price": round(price, 2),
            "sale_price": round(sale_price, 2),
            "market_price": round(market_price, 2),
            "stock": stock,
            "location": location_str,
            "aisle": aisle,
            "shelf": shelf,
            "type": product_type,
            "rating": round(rating, 2),
            "verified": verified,
        }

        return Document(page_content=page_content, metadata=metadata)

    except Exception as e:
        logger.error(f"Error converting product to document: {e}", exc_info=True)
        return None


def convert_products_to_documents(products: List[Any]) -> List[Document]:
    """
    Converts a list of products into a list of valid LangChain Document objects.
    Safely filters out invalid or empty records.
    """
    documents = []
    if not products:
        return documents

    for p in products:
        doc = product_to_document(p)
        if doc:
            documents.append(doc)

    logger.info(f"Successfully converted {len(documents)} out of {len(products)} products into LangChain documents.")
    return documents
