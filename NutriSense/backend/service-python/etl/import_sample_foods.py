"""Script para importar alimentos de ejemplo"""
from app.config.database import foods_collection
from datetime import datetime

# Datos de ejemplo
SAMPLE_FOODS = [
    {
        "name": "Pechuga de pollo",
        "category": "Carnes",
        "brand": None,
        "nutritional_info_per_100g": {
            "calories": 165,
            "protein": 31,
            "carbohydrates": 0,
            "fat": 3.6,
            "fiber": 0,
            "sugar": 0,
            "sodium": 74
        },
        "portions": [
            {"name": "unidad (150g)", "weight_grams": 150, "multiplier": 1.5},
            {"name": "porción (100g)", "weight_grams": 100, "multiplier": 1}
        ],
        "source": "manual"
    },
    {
        "name": "Arroz blanco cocido",
        "category": "Cereales",
        "nutritional_info_per_100g": {
            "calories": 130,
            "protein": 2.7,
            "carbohydrates": 28,
            "fat": 0.3,
            "fiber": 0.4,
            "sugar": 0.1,
            "sodium": 1
        },
        "portions": [
            {"name": "taza (158g)", "weight_grams": 158, "multiplier": 1.58},
            {"name": "porción (100g)", "weight_grams": 100, "multiplier": 1}
        ],
        "source": "manual"
    },
    {
        "name": "Manzana",
        "category": "Frutas",
        "nutritional_info_per_100g": {
            "calories": 52,
            "protein": 0.3,
            "carbohydrates": 14,
            "fat": 0.2,
            "fiber": 2.4,
            "sugar": 10,
            "sodium": 1
        },
        "portions": [
            {"name": "unidad mediana (182g)", "weight_grams": 182, "multiplier": 1.82},
            {"name": "porción (100g)", "weight_grams": 100, "multiplier": 1}
        ],
        "source": "manual"
    },
    {
        "name": "Huevo cocido",
        "category": "Huevos",
        "nutritional_info_per_100g": {
            "calories": 155,
            "protein": 13,
            "carbohydrates": 1.1,
            "fat": 11,
            "fiber": 0,
            "sugar": 1.1,
            "sodium": 124
        },
        "portions": [
            {"name": "unidad (50g)", "weight_grams": 50, "multiplier": 0.5},
            {"name": "porción (100g)", "weight_grams": 100, "multiplier": 1}
        ],
        "source": "manual"
    },
    {
        "name": "Leche entera",
        "category": "Lácteos",
        "nutritional_info_per_100g": {
            "calories": 61,
            "protein": 3.2,
            "carbohydrates": 4.8,
            "fat": 3.3,
            "fiber": 0,
            "sugar": 5,
            "sodium": 43
        },
        "portions": [
            {"name": "vaso (250ml)", "weight_grams": 250, "multiplier": 2.5},
            {"name": "taza (240ml)", "weight_grams": 240, "multiplier": 2.4},
            {"name": "100ml", "weight_grams": 100, "multiplier": 1}
        ],
        "source": "manual"
    },
    {
        "name": "Pan integral",
        "category": "Panadería",
        "nutritional_info_per_100g": {
            "calories": 247,
            "protein": 13,
            "carbohydrates": 41,
            "fat": 3.4,
            "fiber": 6.9,
            "sugar": 6,
            "sodium": 400
        },
        "portions": [
            {"name": "rebanada (28g)", "weight_grams": 28, "multiplier": 0.28},
            {"name": "porción (100g)", "weight_grams": 100, "multiplier": 1}
        ],
        "source": "manual"
    },
    {
        "name": "Salmón",
        "category": "Pescados",
        "nutritional_info_per_100g": {
            "calories": 208,
            "protein": 20,
            "carbohydrates": 0,
            "fat": 13,
            "fiber": 0,
            "sugar": 0,
            "sodium": 59
        },
        "portions": [
            {"name": "filete (170g)", "weight_grams": 170, "multiplier": 1.7},
            {"name": "porción (100g)", "weight_grams": 100, "multiplier": 1}
        ],
        "source": "manual"
    },
    {
        "name": "Pasta cocida",
        "category": "Cereales",
        "nutritional_info_per_100g": {
            "calories": 131,
            "protein": 5,
            "carbohydrates": 25,
            "fat": 1.1,
            "fiber": 1.8,
            "sugar": 0.6,
            "sodium": 1
        },
        "portions": [
            {"name": "plato (180g)", "weight_grams": 180, "multiplier": 1.8},
            {"name": "taza (140g)", "weight_grams": 140, "multiplier": 1.4},
            {"name": "porción (100g)", "weight_grams": 100, "multiplier": 1}
        ],
        "source": "manual"
    },
    {
        "name": "Aguacate",
        "category": "Frutas",
        "nutritional_info_per_100g": {
            "calories": 160,
            "protein": 2,
            "carbohydrates": 9,
            "fat": 15,
            "fiber": 7,
            "sugar": 0.7,
            "sodium": 7
        },
        "portions": [
            {"name": "unidad (200g)", "weight_grams": 200, "multiplier": 2},
            {"name": "mitad (100g)", "weight_grams": 100, "multiplier": 1}
        ],
        "source": "manual"
    },
    {
        "name": "Yogur natural",
        "category": "Lácteos",
        "nutritional_info_per_100g": {
            "calories": 59,
            "protein": 10,
            "carbohydrates": 3.6,
            "fat": 0.4,
            "fiber": 0,
            "sugar": 3.6,
            "sodium": 46
        },
        "portions": [
            {"name": "vaso (125g)", "weight_grams": 125, "multiplier": 1.25},
            {"name": "porción (100g)", "weight_grams": 100, "multiplier": 1}
        ],
        "source": "manual"
    },
    {
        "name": "Brócoli cocido",
        "category": "Verduras",
        "nutritional_info_per_100g": {
            "calories": 35,
            "protein": 2.4,
            "carbohydrates": 7,
            "fat": 0.4,
            "fiber": 3.3,
            "sugar": 1.4,
            "sodium": 41
        },
        "portions": [
            {"name": "taza (156g)", "weight_grams": 156, "multiplier": 1.56},
            {"name": "porción (100g)", "weight_grams": 100, "multiplier": 1}
        ],
        "source": "manual"
    },
    {
        "name": "Almendras",
        "category": "Frutos secos",
        "nutritional_info_per_100g": {
            "calories": 579,
            "protein": 21,
            "carbohydrates": 22,
            "fat": 50,
            "fiber": 13,
            "sugar": 4.4,
            "sodium": 1
        },
        "portions": [
            {"name": "puñado (28g)", "weight_grams": 28, "multiplier": 0.28},
            {"name": "porción (100g)", "weight_grams": 100, "multiplier": 1}
        ],
        "source": "manual"
    }
]

def import_sample_foods():
    """Importar alimentos de ejemplo a MongoDB"""
    # Limpiar colección existente
    foods_collection.delete_many({})
    
    # Añadir timestamps
    for food in SAMPLE_FOODS:
        food["created_at"] = datetime.now()
        food["updated_at"] = datetime.now()
    
    # Insertar alimentos
    result = foods_collection.insert_many(SAMPLE_FOODS)
    
    print(f"✅ Se importaron {len(result.inserted_ids)} alimentos de ejemplo")
    print("📋 Categorías:", foods_collection.distinct("category"))
    
    return len(result.inserted_ids)

if __name__ == "__main__":
    import_sample_foods()