import os
import sys

# Ensure backend directory is in sys.path
backend_dir = os.path.dirname(os.path.abspath(__file__))
if backend_dir not in sys.path:
    sys.path.insert(0, backend_dir)

from app.rag.db_connector import fetch_all_products
from app.rag.document_loader import convert_products_to_documents, product_to_document
from app.rag.embeddings import get_embedding_model
from app.rag.vector_store import build_vector_store, is_index_persisted, load_vector_store
from app.rag.retriever import search_similar_products
from app.rag.rag_service import rag_service

def test_rag_pipeline():
    print("==================================================")
    print("TESTING RAG FOUNDATION (PHASE 2)")
    print("==================================================")

    # 1. Test Database Connector
    print("\n1. Testing Database Connector...")
    products = fetch_all_products(batch_size=50) # Sample 50 for quick verification
    print(f"-> Successfully fetched {len(products)} products from 27K database.")
    assert len(products) > 0, "Failed to fetch products from DB"

    sample = products[0]
    print(f"-> Sample DB Product: ID={sample.id}, Name={sample.product_name}, Brand={sample.brand}, Category={sample.category}, Aisle={sample.aisle}")

    # 2. Test Product to Document Conversion & Metadata Preservation
    print("\n2. Testing Product-to-Document Conversion & Metadata Preservation...")
    docs = convert_products_to_documents(products)
    print(f"-> Successfully converted {len(docs)} products to LangChain Documents.")
    assert len(docs) > 0, "Failed to convert products to documents"

    doc = docs[0]
    meta = doc.metadata
    print(f"-> Document Metadata Keys: {list(meta.keys())}")
    
    # Required metadata verification
    required_keys = ["product_id", "product_name", "category", "brand", "price", "stock", "location", "aisle", "shelf"]
    for key in required_keys:
        assert key in meta, f"Missing required metadata key: {key}"
        print(f"   - {key}: {meta[key]}")

    print("\n-> Document Page Content Sample:")
    print("--------------------------------------------------")
    print(doc.page_content[:300].encode('ascii', errors='replace').decode('ascii') + "...")
    print("--------------------------------------------------")

    # 3. Test Safe Handling of Edge Cases (Missing/Null/Invalid Fields)
    print("\n3. Testing Edge Case & Null Value Handling...")
    null_product = type('DummyProduct', (), {
        'id': None,
        'product_name': None,
        'brand': None,
        'category': None,
        'sub_category': None,
        'sale_price': None,
        'market_price': None,
        'stock': None,
        'aisle': None,
        'shelf': None,
        'description': None,
    })()
    
    invalid_doc = product_to_document(null_product)
    assert invalid_doc is None, "Null product should return None safely without crashing."
    print("-> Null product safely handled (returned None).")

    partial_product = type('DummyProduct', (), {
        'id': 'SKU-TEST-999',
        'product_name': 'Test Olive Oil 500ml',
        'brand': None,
        'category': 'Pantry Staples',
        'sub_category': None,
        'sale_price': 450.0,
        'market_price': None,
        'stock': None,
        'aisle': 'Aisle 7',
        'shelf': None,
        'description': None,
    })()
    partial_doc = product_to_document(partial_product)
    assert partial_doc is not None, "Partial product should convert safely."
    assert partial_doc.metadata["product_id"] == "SKU-TEST-999"
    assert partial_doc.metadata["brand"] == ""
    assert partial_doc.metadata["location"] == "Aisle 7, Shelf Unknown"
    print("-> Partial product safely converted with fallbacks.")

    # 4. Test Embedding Model
    print("\n4. Testing Embedding Model...")
    embeddings = get_embedding_model()
    vec = embeddings.embed_query("Organic extra virgin olive oil")
    print(f"-> Embedding generated successfully. Vector dimension: {len(vec)}")
    assert len(vec) > 0, "Embedding vector is empty"

    # 5. Test FAISS Vector Store Building & Persistence
    print("\n5. Testing FAISS Vector Store Building & Persistence...")
    vstore = build_vector_store(docs, embeddings)
    assert vstore is not None, "FAISS vector store creation failed"
    assert is_index_persisted(), "FAISS index persistence failed"
    print("-> FAISS vector store created and persisted to disk successfully.")

    # 6. Test FAISS Vector Store Loading from Disk
    print("\n6. Testing Loading FAISS Vector Store from Disk...")
    loaded_vstore = load_vector_store(embeddings)
    assert loaded_vstore is not None, "FAISS loading from disk failed"
    print("-> FAISS index loaded from disk successfully.")

    # 7. Test Retriever Similarity Search
    print("\n7. Testing Retriever Similarity Search...")
    search_results = search_similar_products("Garlic Oil digestion cholesterol", top_k=3, vector_store=loaded_vstore)
    print(f"-> Retrieved {len(search_results)} matching documents.")
    assert len(search_results) > 0, "Retriever returned 0 results"
    for i, r in enumerate(search_results):
        safe_name = r['product_name'].encode('ascii', errors='replace').decode('ascii')
        print(f"   [{i+1}] {safe_name} | Brand: {r['brand']} | Location: {r['location']} | Price: Rs.{r['price']} | Score: {r['score']:.4f}")

    # 8. Test RAG Service Facade
    print("\n8. Testing RAG Service Facade...")
    init_res = rag_service.initialize_system()
    print(f"-> RAG Service Init: {init_res}")
    assert init_res["success"], "RAG service init failed"

    context_res = rag_service.retrieve_context("Hair Care Oil", top_k=2)
    print(f"-> RAG Service retrieve_context count: {context_res['count']}")
    assert context_res["success"], "RAG service context retrieval failed"

    print("\n==================================================")
    print("ALL PHASE 2 RAG FOUNDATION TESTS PASSED SUCCESSFULLY! [PASS]")
    print("==================================================")

if __name__ == "__main__":
    test_rag_pipeline()
