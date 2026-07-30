from pydantic import BaseModel, Field

class Product(BaseModel):
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
    
    # Extended CSV dataset fields
    market_price: float = Field(0.0, description="Market list price")
    sale_price: float = Field(0.0, description="Sale discount price")
    type: str = Field("", description="Specific product type/subtype")
    rating: float = Field(0.0, description="Product rating score")
    description: str = Field("", description="Full product description text")

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
