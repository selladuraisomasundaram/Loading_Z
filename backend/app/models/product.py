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
