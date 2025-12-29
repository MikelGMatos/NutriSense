from fastapi import APIRouter, HTTPException, Query, Path
from typing import List, Optional
from app.models.food import Food, FoodSearchResponse
from app.services.food_service import FoodService

router = APIRouter(prefix="/api/foods", tags=["foods"])

@router.get(
    "/search",
    response_model=List[FoodSearchResponse],
    summary="Buscar alimentos",
    description="Busca alimentos en el catálogo por nombre, marca o categoría",
    response_description="Lista de alimentos que coinciden con la búsqueda",
    responses={
        200: {
            "description": "Búsqueda exitosa",
            "content": {
                "application/json": {
                    "example": [
                        {
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
                    ]
                }
            }
        }
    }
)
async def search_foods(
    q: str = Query(
        ..., 
        min_length=1, 
        description="Término de búsqueda (nombre, marca o categoría)",
        example="pollo"
    ),
    limit: int = Query(
        20, 
        ge=1, 
        le=100,
        description="Número máximo de resultados a devolver"
    )
):
    """
    ## Buscar Alimentos
    
    Realiza una búsqueda en el catálogo de alimentos.
    
    ### Parámetros:
    - **q**: Término de búsqueda (obligatorio)
        - Busca en nombre, marca y categoría
        - Mínimo 1 carácter
        - Ejemplos: "pollo", "yogur", "manzana"
    - **limit**: Número de resultados (opcional, por defecto 20)
        - Mínimo: 1
        - Máximo: 100
    
    ### Respuesta:
    Lista de alimentos con:
    - ID único del alimento
    - Nombre y marca
    - Categoría
    - Información nutricional por 100g
    - Porciones disponibles
    
    ### Ejemplos de uso:
    - `/api/foods/search?q=pollo` - Buscar pollo
    - `/api/foods/search?q=yogur&limit=10` - Buscar yogur (máximo 10 resultados)
    """
    results = await FoodService.search_foods(q, limit)
    return results

@router.get(
    "/categories",
    response_model=List[str],
    summary="Obtener categorías de alimentos",
    description="Devuelve todas las categorías únicas de alimentos disponibles en el catálogo",
    response_description="Lista de categorías disponibles",
    responses={
        200: {
            "description": "Lista de categorías obtenida exitosamente",
            "content": {
                "application/json": {
                    "example": [
                        "Carnes",
                        "Lácteos",
                        "Frutas",
                        "Verduras",
                        "Cereales",
                        "Legumbres"
                    ]
                }
            }
        }
    }
)
async def get_categories():
    """
    ## Obtener Categorías
    
    Devuelve todas las categorías de alimentos disponibles en el catálogo.
    
    ### Respuesta:
    Lista de strings con los nombres de las categorías únicas.
    
    ### Uso:
    Útil para:
    - Crear filtros por categoría
    - Mostrar menús de navegación
    - Agrupar alimentos en la interfaz
    
    ### Ejemplos de categorías:
    - Carnes
    - Lácteos
    - Frutas y Verduras
    - Cereales y Legumbres
    - Bebidas
    """
    return await FoodService.get_categories()

@router.get(
    "/{food_id}",
    response_model=Food,
    summary="Obtener alimento por ID",
    description="Obtiene los detalles completos de un alimento específico",
    response_description="Información completa del alimento",
    responses={
        200: {
            "description": "Alimento encontrado",
            "content": {
                "application/json": {
                    "example": {
                        "id": "507f1f77bcf86cd799439011",
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
                            }
                        ],
                        "barcode": "8480000123456",
                        "source": "openfoodfacts"
                    }
                }
            }
        },
        404: {
            "description": "Alimento no encontrado",
            "content": {
                "application/json": {
                    "example": {"detail": "Alimento no encontrado"}
                }
            }
        }
    }
)
async def get_food(
    food_id: str = Path(
        ...,
        description="ID único del alimento en MongoDB (ObjectId)",
        example="507f1f77bcf86cd799439011"
    )
):
    """
    ## Obtener Alimento por ID
    
    Obtiene toda la información de un alimento específico.
    
    ### Parámetros:
    - **food_id**: ID del alimento (ObjectId de MongoDB)
        - Formato: string de 24 caracteres hexadecimales
        - Ejemplo: `507f1f77bcf86cd799439011`
    
    ### Respuesta:
    Objeto Food completo con:
    - **Información básica**: nombre, marca, categoría
    - **Información nutricional**: calorías, proteínas, carbohidratos, grasas, fibra, azúcar, sodio
    - **Porciones**: diferentes tamaños y sus equivalencias
    - **Metadata**: código de barras, fuente de datos, fechas
    
    ### Errores:
    - **404**: Si el alimento no existe en la base de datos
    """
    food = await FoodService.get_food_by_id(food_id)
    if not food:
        raise HTTPException(status_code=404, detail="Alimento no encontrado")
    return food

@router.get(
    "",
    response_model=List[Food],
    summary="Listar todos los alimentos",
    description="Obtiene todos los alimentos del catálogo con paginación",
    response_description="Lista paginada de alimentos",
    responses={
        200: {
            "description": "Lista de alimentos obtenida exitosamente",
            "content": {
                "application/json": {
                    "example": [
                        {
                            "id": "507f1f77bcf86cd799439011",
                            "name": "Pechuga de pollo",
                            "brand": "Carrefour",
                            "category": "Carnes",
                            "nutritional_info_per_100g": {
                                "calories": 165,
                                "protein": 31,
                                "carbohydrates": 0,
                                "fat": 3.6
                            }
                        }
                    ]
                }
            }
        }
    }
)
async def get_all_foods(
    skip: int = Query(
        0,
        ge=0,
        description="Número de registros a saltar (offset para paginación)",
        example=0
    ),
    limit: int = Query(
        100,
        ge=1,
        le=500,
        description="Número máximo de registros a devolver",
        example=100
    )
):
    """
    ## Listar Todos los Alimentos
    
    Obtiene todos los alimentos del catálogo con soporte de paginación.
    
    ### Parámetros:
    - **skip**: Número de registros a saltar (por defecto 0)
        - Útil para paginación
        - Ejemplo: skip=0 para primera página, skip=100 para segunda página
    - **limit**: Número de registros por página (por defecto 100)
        - Mínimo: 1
        - Máximo: 500
    
    ### Respuesta:
    Lista de objetos Food con toda su información.
    
    ### Paginación:
    ```
    # Primera página (alimentos 0-99)
    GET /api/foods?skip=0&limit=100
    
    # Segunda página (alimentos 100-199)
    GET /api/foods?skip=100&limit=100
    
    # Tercera página (alimentos 200-299)
    GET /api/foods?skip=200&limit=100
    ```
    
    ### Uso recomendado:
    - Para cargar datos iniciales
    - Para exportar el catálogo completo
    - Para sincronización de datos
    """
    return await FoodService.get_all_foods(skip, limit)

@router.post(
    "",
    response_model=dict,
    summary="Crear nuevo alimento",
    description="Crea un nuevo alimento en el catálogo",
    response_description="ID del alimento creado",
    status_code=201,
    responses={
        201: {
            "description": "Alimento creado exitosamente",
            "content": {
                "application/json": {
                    "example": {
                        "id": "507f1f77bcf86cd799439011",
                        "message": "Alimento creado exitosamente"
                    }
                }
            }
        },
        422: {
            "description": "Error de validación",
            "content": {
                "application/json": {
                    "example": {
                        "detail": [
                            {
                                "loc": ["body", "name"],
                                "msg": "field required",
                                "type": "value_error.missing"
                            }
                        ]
                    }
                }
            }
        }
    }
)
async def create_food(food: Food):
    """
    ## Crear Nuevo Alimento
    
    Crea un nuevo alimento en el catálogo de MongoDB.
    
    ### Body (JSON):
    Objeto Food completo con:
    - **name** (requerido): Nombre del alimento
    - **category** (requerido): Categoría del alimento
    - **nutritional_info_per_100g** (requerido): Información nutricional
    - **brand** (opcional): Marca del producto
    - **portions** (opcional): Lista de porciones
    - **barcode** (opcional): Código de barras
    - **source** (opcional): Fuente de datos (por defecto "manual")
    
    ### Ejemplo de body:
    ```json
    {
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
        }
      ],
      "barcode": "8480000123456",
      "source": "manual"
    }
    ```
    
    ### Respuesta:
    - **id**: ID del alimento creado (ObjectId de MongoDB)
    - **message**: Mensaje de confirmación
    
    ### Validación:
    - Todos los campos requeridos deben estar presentes
    - Los valores numéricos deben ser positivos
    - Las porciones deben tener name, weight_grams y multiplier
    """
    food_id = await FoodService.create_food(food)
    return {"id": food_id, "message": "Alimento creado exitosamente"}
