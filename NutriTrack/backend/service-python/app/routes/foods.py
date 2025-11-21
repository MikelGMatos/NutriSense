from fastapi import APIRouter, HTTPException, Query
from typing import List, Optional
from app.models.food import Food, FoodSearchResponse
from app.services.food_service import FoodService

router = APIRouter(prefix="/api/foods", tags=["foods"])

@router.get("/search", response_model=List[FoodSearchResponse])
async def search_foods(
    q: str = Query(..., min_length=1, description="Término de búsqueda"),
    limit: int = Query(20, ge=1, le=100)
):
    """Buscar alimentos por nombre, marca o categoría"""
    results = await FoodService.search_foods(q, limit)
    return results

@router.get("/categories", response_model=List[str])
async def get_categories():
    """Obtener todas las categorías de alimentos"""
    return await FoodService.get_categories()

@router.get("/{food_id}", response_model=Food)
async def get_food(food_id: str):
    """Obtener un alimento por ID"""
    food = await FoodService.get_food_by_id(food_id)
    if not food:
        raise HTTPException(status_code=404, detail="Alimento no encontrado")
    return food

@router.get("", response_model=List[Food])
async def get_all_foods(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=500)
):
    """Obtener todos los alimentos con paginación"""
    return await FoodService.get_all_foods(skip, limit)

@router.post("", response_model=dict)
async def create_food(food: Food):
    """Crear un nuevo alimento"""
    food_id = await FoodService.create_food(food)
    return {"id": food_id, "message": "Alimento creado exitosamente"}