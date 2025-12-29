from pydantic import BaseModel, Field
from typing import Optional, List, Dict
from datetime import datetime

class Portion(BaseModel):
    """
    Modelo de porción de alimento
    
    Define diferentes tamaños de porción y su equivalencia en gramos.
    """
    name: str = Field(
        ...,
        description="Nombre de la porción (ej: 'unidad', 'taza', 'cucharada')",
        example="unidad"
    )
    weight_grams: float = Field(
        ...,
        description="Peso de la porción en gramos",
        example=150,
        gt=0
    )
    multiplier: float = Field(
        ...,
        description="Multiplicador para calcular nutrientes (weight_grams / 100)",
        example=1.5,
        gt=0
    )

class NutritionalInfo(BaseModel):
    """
    Información nutricional por 100 gramos de alimento
    
    Contiene todos los macronutrientes principales y micronutrientes básicos.
    """
    calories: float = Field(
        ...,
        description="Calorías en kcal por 100g",
        example=165,
        ge=0
    )
    protein: float = Field(
        ...,
        description="Proteínas en gramos por 100g",
        example=31,
        ge=0
    )
    carbohydrates: float = Field(
        ...,
        description="Carbohidratos en gramos por 100g",
        example=0,
        ge=0
    )
    fat: float = Field(
        ...,
        description="Grasas en gramos por 100g",
        example=3.6,
        ge=0
    )
    fiber: Optional[float] = Field(
        0,
        description="Fibra en gramos por 100g",
        example=0,
        ge=0
    )
    sugar: Optional[float] = Field(
        0,
        description="Azúcares en gramos por 100g",
        example=0,
        ge=0
    )
    sodium: Optional[float] = Field(
        0,
        description="Sodio en miligramos por 100g",
        example=70,
        ge=0
    )

class Food(BaseModel):
    """
    Modelo completo de un alimento
    
    Representa un alimento en el catálogo con toda su información nutricional,
    porciones disponibles y metadata.
    """
    id: Optional[str] = Field(
        None,
        alias="_id",
        description="ID único del alimento en MongoDB (ObjectId)"
    )
    name: str = Field(
        ...,
        description="Nombre del alimento",
        example="Pechuga de pollo",
        min_length=1,
        max_length=200
    )
    brand: Optional[str] = Field(
        None,
        description="Marca del producto (si aplica)",
        example="Carrefour",
        max_length=100
    )
    category: str = Field(
        ...,
        description="Categoría del alimento",
        example="Carnes",
        min_length=1,
        max_length=100
    )
    nutritional_info_per_100g: NutritionalInfo = Field(
        ...,
        description="Información nutricional por 100 gramos"
    )
    portions: List[Portion] = Field(
        default=[],
        description="Lista de porciones disponibles con sus equivalencias"
    )
    barcode: Optional[str] = Field(
        None,
        description="Código de barras del producto (EAN)",
        example="8480000123456",
        max_length=20
    )
    source: str = Field(
        "manual",
        description="Fuente de donde se obtuvo la información",
        example="openfoodfacts"
    )
    created_at: datetime = Field(
        default_factory=datetime.now,
        description="Fecha de creación del registro"
    )
    updated_at: datetime = Field(
        default_factory=datetime.now,
        description="Fecha de última actualización del registro"
    )
    
    class Config:
        populate_by_name = True
        json_schema_extra = {
            "example": {
                "name": "Pechuga de pollo",
                "brand": "Carrefour",
                "category": "Carnes",
                "nutritional_info_per_100g": {
                    "calories": 165,
                    "protein": 31,
                    "carbohydrates": 0,
                    "fat": 3.6,
                    "fiber": 0,
                    "sugar": 0,
                    "sodium": 70
                },
                "portions": [
                    {
                        "name": "unidad",
                        "weight_grams": 150,
                        "multiplier": 1.5
                    },
                    {
                        "name": "porción",
                        "weight_grams": 100,
                        "multiplier": 1.0
                    }
                ],
                "barcode": "8480000123456",
                "source": "openfoodfacts"
            }
        }

class FoodSearchResponse(BaseModel):
    """
    Respuesta simplificada para búsquedas de alimentos
    
    Versión optimizada del modelo Food que incluye solo la información
    esencial para mostrar en resultados de búsqueda.
    """
    id: str = Field(
        ...,
        description="ID único del alimento"
    )
    name: str = Field(
        ...,
        description="Nombre del alimento",
        example="Pechuga de pollo"
    )
    brand: Optional[str] = Field(
        None,
        description="Marca del producto",
        example="Carrefour"
    )
    category: str = Field(
        ...,
        description="Categoría del alimento",
        example="Carnes"
    )
    calories_per_100g: float = Field(
        ...,
        description="Calorías por 100g",
        example=165
    )
    protein_per_100g: float = Field(
        ...,
        description="Proteínas en gramos por 100g",
        example=31
    )
    carbs_per_100g: float = Field(
        ...,
        description="Carbohidratos en gramos por 100g",
        example=0
    )
    fat_per_100g: float = Field(
        ...,
        description="Grasas en gramos por 100g",
        example=3.6
    )
    portions: List[Portion] = Field(
        ...,
        description="Lista de porciones disponibles"
    )
    
    class Config:
        json_schema_extra = {
            "example": {
                "id": "507f1f77bcf86cd799439011",
                "name": "Pechuga de pollo",
                "brand": "Carrefour",
                "category": "Carnes",
                "calories_per_100g": 165,
                "protein_per_100g": 31,
                "carbs_per_100g": 0,
                "fat_per_100g": 3.6,
                "portions": [
                    {
                        "name": "unidad",
                        "weight_grams": 150,
                        "multiplier": 1.5
                    }
                ]
            }
        }
