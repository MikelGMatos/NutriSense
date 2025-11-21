from typing import List, Optional, Dict
from bson import ObjectId
from app.config.database import async_foods_collection
from app.models.food import Food, FoodSearchResponse
import re

class FoodService:
    
    @staticmethod
    async def search_foods(query: str, limit: int = 20) -> List[FoodSearchResponse]:
        """Buscar alimentos por nombre o marca"""
        # Crear regex para búsqueda flexible
        regex_pattern = re.compile(query, re.IGNORECASE)
        
        # Búsqueda en MongoDB
        cursor = async_foods_collection.find({
            "$or": [
                {"name": regex_pattern},
                {"brand": regex_pattern},
                {"category": regex_pattern}
            ]
        }).limit(limit)
        
        results = []
        async for doc in cursor:
            results.append(FoodSearchResponse(
                id=str(doc["_id"]),
                name=doc["name"],
                brand=doc.get("brand"),
                category=doc["category"],
                calories_per_100g=doc["nutritional_info_per_100g"]["calories"],
                protein_per_100g=doc["nutritional_info_per_100g"]["protein"],
                carbs_per_100g=doc["nutritional_info_per_100g"]["carbohydrates"],
                fat_per_100g=doc["nutritional_info_per_100g"]["fat"],
                portions=doc.get("portions", [])
            ))
        
        return results
    
    @staticmethod
    async def get_food_by_id(food_id: str) -> Optional[Food]:
        """Obtener alimento por ID"""
        try:
            doc = await async_foods_collection.find_one({"_id": ObjectId(food_id)})
            if doc:
                doc["_id"] = str(doc["_id"])
                return Food(**doc)
        except:
            return None
    
    @staticmethod
    async def create_food(food: Food) -> str:
        """Crear nuevo alimento"""
        food_dict = food.model_dump(exclude={"id"})
        result = await async_foods_collection.insert_one(food_dict)
        return str(result.inserted_id)
    
    @staticmethod
    async def get_all_foods(skip: int = 0, limit: int = 100) -> List[Food]:
        """Obtener todos los alimentos con paginación"""
        cursor = async_foods_collection.find().skip(skip).limit(limit)
        results = []
        async for doc in cursor:
            doc["_id"] = str(doc["_id"])
            results.append(Food(**doc))
        return results
    
    @staticmethod
    async def get_categories() -> List[str]:
        """Obtener todas las categorías únicas"""
        categories = await async_foods_collection.distinct("category")
        return sorted(categories)