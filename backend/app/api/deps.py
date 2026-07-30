from app.core.database import get_db_engine, DatabaseEngine

def get_db() -> DatabaseEngine:
    return get_db_engine()
