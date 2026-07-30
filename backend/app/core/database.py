import os
from typing import Generator
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, Session
from app.models.product import Base

# Ensure target database directory exists
DB_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", "data", "products"))
os.makedirs(DB_DIR, exist_ok=True)
DB_PATH = os.path.join(DB_DIR, "smart_trolley.db")

SQLALCHEMY_DATABASE_URL = f"sqlite:///{DB_PATH}"

engine = create_engine(
    SQLALCHEMY_DATABASE_URL,
    connect_args={"check_same_thread": False}
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def init_db():
    """
    Creates SQLite database tables if they do not exist.
    """
    Base.metadata.create_all(bind=engine)

# Run table creation on engine initialization
init_db()

def get_db() -> Generator[Session, None, None]:
    """
    FastAPI dependency that yields a SQLAlchemy database session.
    """
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

class DatabaseEngine:
    """
    Backward-compatible wrapper for existing endpoints and services.
    Delegates calls to standard SQLAlchemy product_service functions.
    """
    def resolve_product(self, query_name: str):
        from services.product_service import resolve_product as service_resolve
        db = SessionLocal()
        try:
            return service_resolve(query_name, db=db)
        finally:
            db.close()

    def search_products(self, query: str, limit: int = 5):
        from services.product_service import search_products as service_search
        db = SessionLocal()
        try:
            return service_search(query, limit=limit, db=db)
        finally:
            db.close()

db_engine = DatabaseEngine()

def get_db_engine() -> DatabaseEngine:
    return db_engine

def resolve_product(query_name: str):
    return db_engine.resolve_product(query_name)

def search_products(query: str, limit: int = 5):
    return db_engine.search_products(query, limit)
