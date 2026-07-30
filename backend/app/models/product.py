from sqlalchemy import Column, String, Float, Integer, Text, Boolean
from sqlalchemy.orm import declarative_base
from pydantic import BaseModel, Field

Base = declarative_base()

class Product(Base):
    """
    SQLAlchemy ORM Model representing a retail product in the smart trolley database.
    """
    __tablename__ = "products"

    id = Column(String, primary_key=True, index=True) # Mapped to SKU ID
    product_name = Column(String, index=True, nullable=False)
    brand = Column(String, index=True, nullable=True)
    category = Column(String, index=True, nullable=True)
    sub_category = Column(String, nullable=True)
    sale_price = Column(Float, default=0.0)
    market_price = Column(Float, default=0.0)
    stock = Column(Integer, default=50)
    aisle = Column(String, nullable=True)
    shelf = Column(String, nullable=True)
    type = Column(String, nullable=True)
    rating = Column(Float, default=0.0)
    description = Column(Text, nullable=True)
    verified = Column(Boolean, default=True)

    @property
    def sku(self) -> str:
        return self.id

    @property
    def price(self) -> float:
        if self.sale_price and self.sale_price > 0:
            return round(float(self.sale_price), 2)
        if self.market_price and self.market_price > 0:
            return round(float(self.market_price), 2)
        return 9.99

    def to_dict(self) -> dict:
        return {
            "sku": self.id,
            "id": self.id,
            "product_name": self.product_name or "",
            "brand": self.brand or "",
            "category": self.category or "",
            "sub_category": self.sub_category or "",
            "price": self.price,
            "sale_price": round(float(self.sale_price or 0.0), 2),
            "market_price": round(float(self.market_price or 0.0), 2),
            "stock": self.stock or 0,
            "aisle": self.aisle or "Aisle A1",
            "shelf": self.shelf or "Shelf 1",
            "type": self.type or "",
            "rating": round(float(self.rating or 0.0), 2),
            "description": self.description or "",
            "verified": self.verified if self.verified is not None else True
        }

    def dict(self) -> dict:
        return self.to_dict()

class ProductSchema(BaseModel):
    sku: str = Field(..., description="Stock Keeping Unit")
    product_name: str = Field(..., description="Name of the product")
    brand: str = Field(..., description="Brand name")
    category: str = Field(..., description="Main category")
    sub_category: str = Field(..., description="Sub category")
    price: float = Field(..., description="Product price")
    stock: int = Field(..., description="Available stock quantity")
    aisle: str = Field(..., description="Aisle location in store")
    shelf: str = Field(..., description="Shelf location in store")
    verified: bool = Field(True, description="Whether the product is verified")
    
    # Extended dataset fields
    market_price: float = Field(0.0, description="Market list price")
    sale_price: float = Field(0.0, description="Sale discount price")
    type: str = Field("", description="Specific product type/subtype")
    rating: float = Field(0.0, description="Product rating score")
    description: str = Field("", description="Full product description text")

    class Config:
        from_attributes = True

class VisionAnalysisResponse(BaseModel):
    sku: str = Field(..., description="Stock Keeping Unit")
    product_name: str = Field(..., description="Name of the product")
    brand: str = Field(..., description="Brand name")
    category: str = Field(..., description="Main category")
    sub_category: str = Field(..., description="Sub category")
    price: float = Field(..., description="Product price")
    stock: int = Field(..., description="Available stock quantity")
    aisle: str = Field(..., description="Aisle location in store")
    shelf: str = Field(..., description="Shelf location in store")
    gemma_confidence: float = Field(..., ge=0.0, le=1.0, description="Gemma Vision confidence score")
    verified: bool = Field(..., description="Verification status")
