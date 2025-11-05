"""Script para importar alimentos desde Open Food Facts API"""
import aiohttp
import asyncio
from app.config.database import foods_collection
from datetime import datetime
import json

BASE_URL = "https://world.openfoodfacts.org"

async def fetch_products(session, page=1, page_size=100):
    """Obtener productos de Open Food Facts"""
    url = f"{BASE_URL}/cgi/search.pl"
    params = {
        "action": "process",
        "json": True,
        "page": page,
        "page_size": page_size,
        "countries": "Spain",
        "fields": "product_name,brands,categories,nutriments,serving_size",
        "sort_by": "unique_scans_n"
    }
    
    try:
        async with session.get(url, params=params) as response:
            if response.status == 200:
                data = await response.json()
                return data.get("products", [])
    except Exception as e:
        print(f"Error fetching page {page}: {e}")
    
    return []

def transform_product(product):
    """Transformar producto de Open Food Facts a nuestro formato"""
    try:
        nutriments = product.get("nutriments", {})
        
        # Determinar categoría
        categories = product.get("categories", "").split(",")
        category = "Otros"
        if categories:
            # Mapear categorías comunes
            cat_map = {
                "meat": "Carnes",
                "dairy": "Lácteos", 
                "fruits": "Frutas",
                "vegetables": "Verduras",
                "cereals": "Cereales",
                "fish": "Pescados",
                "beverages": "Bebidas",
                "snacks": "Snacks"
            }
            for cat in categories:
                for key, val in cat_map.items():
                    if key in cat.lower():
                        category = val
                        break
        
        return {
            "name": product.get("product_name", "Sin nombre"),
            "brand": product.get("brands", ""),
            "category": category,
            "nutritional_info_per_100g": {
                "calories": nutriments.get("energy-kcal_100g", 0),
                "protein": nutriments.get("proteins_100g", 0),
                "carbohydrates": nutriments.get("carbohydrates_100g", 0),
                "fat": nutriments.get("fat_100g", 0),
                "fiber": nutriments.get("fiber_100g", 0),
                "sugar": nutriments.get("sugars_100g", 0),
                "sodium": nutriments.get("sodium_100g", 0) * 1000 if nutriments.get("sodium_100g") else 0
            },
            "portions": [
                {"name": "porción (100g)", "weight_grams": 100, "multiplier": 1}
            ],
            "barcode": product.get("code", ""),
            "source": "openfoodfacts",
            "created_at": datetime.now(),
            "updated_at": datetime.now()
        }
    except Exception as e:
        print(f"Error transforming product: {e}")
        return None

async def import_from_openfoodfacts(total_products=100):
    """Importar productos desde Open Food Facts"""
    foods_collection.delete_many({"source": "openfoodfacts"})
    
    async with aiohttp.ClientSession() as session:
        all_products = []
        pages_needed = (total_products // 100) + 1
        
        print(f"📥 Descargando {total_products} productos de Open Food Facts...")
        
        for page in range(1, pages_needed + 1):
            products = await fetch_products(session, page, 100)
            all_products.extend(products)
            print(f"  Página {page}: {len(products)} productos")
            
            if len(all_products) >= total_products:
                break
        
        # Transformar y filtrar productos válidos
        transformed = []
        for product in all_products[:total_products]:
            transformed_product = transform_product(product)
            if transformed_product and transformed_product["name"] != "Sin nombre":
                transformed.append(transformed_product)
        
        # Insertar en MongoDB
        if transformed:
            result = foods_collection.insert_many(transformed)
            print(f"✅ Se importaron {len(result.inserted_ids)} productos")
            print(f"📋 Categorías: {foods_collection.distinct('category')}")
        else:
            print("⚠️ No se pudieron importar productos")

if __name__ == "__main__":
    # Ejecutar importación
    asyncio.run(import_from_openfoodfacts(200))