from pydantic import BaseModel, Field
from typing import Optional, List, Dict
from datetime import datetime

class Portion(BaseModel):
    name: str
    weight_grams: float
    multiplier: float

class NutritionalInfo(BaseModel):
    calories: float
    protein: float
    carbohydrates: float
    fat: float
    fiber: Optional[float] = 0
    sugar: Optional[float] = 0
    sodium: Optional[float] = 0

class Food(BaseModel):
    id: Optional[str] = Field(None, alias="_id")
    name: str
    brand: Optional[str] = None
    category: str
    nutritional_info_per_100g: NutritionalInfo
    portions: List[Portion] = []
    barcode: Optional[str] = None
    source: str = "manual"
    created_at: datetime = Field(default_factory=datetime.now)
    updated_at: datetime = Field(default_factory=datetime.now)
    
    class Config:
        populate_by_name = True
        json_schema_extra = {
            "example": {
                "name": "Pechuga de pollo",
                "category": "Carnes",
                "nutritional_info_per_100g": {
                    "calories": 165,
                    "protein": 31,
                    "carbohydrates": 0,
                    "fat": 3.6
                },
                "portions": [
                    {"name": "unidad", "weight_grams": 150, "multiplier": 1.5}
                ]
            }
        }

class FoodSearchResponse(BaseModel):
    id: str
    name: str
    brand: Optional[str]
    category: str
    calories_per_100g: float
    protein_per_100g: float
    carbs_per_100g: float
    fat_per_100g: float
    portions: List[Portion]