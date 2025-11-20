"""Script para importar alimentos desde Open Food Facts API ESPAÑA"""
import sys
import os
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

import aiohttp
import asyncio
from app.config.database import foods_collection
from datetime import datetime

# Usar la API ESPAÑOLA directamente
BASE_URL = "https://es.openfoodfacts.org"

# Mapeo mejorado de categorías en español
CATEGORY_MAPPING = {
    'carne': 'Carnes y Embutidos', 'carnes': 'Carnes y Embutidos', 'pollo': 'Carnes y Embutidos',
    'aves': 'Carnes y Embutidos', 'cerdo': 'Carnes y Embutidos', 'ternera': 'Carnes y Embutidos',
    'embutido': 'Carnes y Embutidos', 'jamón': 'Carnes y Embutidos', 'chorizo': 'Carnes y Embutidos',
    'pescado': 'Pescados y Mariscos', 'marisco': 'Pescados y Mariscos', 'salmón': 'Pescados y Mariscos',
    'atún': 'Pescados y Mariscos', 'merluza': 'Pescados y Mariscos',
    'lácteo': 'Lácteos', 'leche': 'Lácteos', 'queso': 'Lácteos', 'yogur': 'Lácteos',
    'yogurt': 'Lácteos', 'nata': 'Lácteos', 'mantequilla': 'Lácteos',
    'fruta': 'Frutas', 'manzana': 'Frutas', 'plátano': 'Frutas', 'naranja': 'Frutas',
    'verdura': 'Verduras y Hortalizas', 'hortaliza': 'Verduras y Hortalizas',
    'ensalada': 'Verduras y Hortalizas', 'tomate': 'Verduras y Hortalizas',
    'legumbre': 'Legumbres', 'lenteja': 'Legumbres', 'garbanzo': 'Legumbres',
    'cereal': 'Cereales y Granos', 'pan': 'Panadería', 'pasta': 'Cereales y Granos',
    'arroz': 'Cereales y Granos', 'grano': 'Cereales y Granos',
    'bebida': 'Bebidas', 'zumo': 'Bebidas', 'agua': 'Bebidas', 'café': 'Bebidas', 'té': 'Bebidas',
    'refresco': 'Bebidas', 'snack': 'Snacks y Aperitivos', 'aperitivo': 'Snacks y Aperitivos',
    'patata': 'Snacks y Aperitivos', 'galleta': 'Dulces y Repostería',
    'chocolate': 'Dulces y Repostería', 'dulce': 'Dulces y Repostería', 'postre': 'Dulces y Repostería',
    'fruto seco': 'Frutos Secos', 'nuez': 'Frutos Secos', 'almendra': 'Frutos Secos',
    'huevo': 'Huevos', 'aceite': 'Aceites y Grasas', 'grasa': 'Aceites y Grasas',
    'salsa': 'Salsas y Condimentos', 'condimento': 'Salsas y Condimentos',
    'plato preparado': 'Platos Preparados', 'pizza': 'Platos Preparados',
    # Inglés también por si acaso
    'meat': 'Carnes y Embutidos', 'fish': 'Pescados y Mariscos', 'dairy': 'Lácteos',
    'fruit': 'Frutas', 'vegetable': 'Verduras y Hortalizas', 'bread': 'Panadería',
    'beverage': 'Bebidas', 'snack': 'Snacks y Aperitivos', 'dessert': 'Dulces y Repostería',
}

def determine_category(categories_str):
    """Determinar categoría en español"""
    if not categories_str:
        return "Otros"
    categories_lower = categories_str.lower()
    for key, spanish_cat in CATEGORY_MAPPING.items():
        if key in categories_lower:
            return spanish_cat
    return "Otros"

def create_smart_portions(product_name):
    """Crear porciones inteligentes según el tipo de alimento"""
    portions = [{"name": "100g", "weight_grams": 100, "multiplier": 1}]
    name_lower = product_name.lower()
    
    if any(word in name_lower for word in ['leche', 'zumo', 'bebida', 'agua', 'refresco']):
        portions.extend([
            {"name": "vaso (250ml)", "weight_grams": 250, "multiplier": 2.5},
            {"name": "taza (200ml)", "weight_grams": 200, "multiplier": 2}
        ])
    elif any(word in name_lower for word in ['yogur', 'yoghurt']):
        portions.append({"name": "unidad (125g)", "weight_grams": 125, "multiplier": 1.25})
    elif any(word in name_lower for word in ['pan', 'galleta', 'biscuit']):
        portions.extend([
            {"name": "rebanada (30g)", "weight_grams": 30, "multiplier": 0.3},
            {"name": "porción (50g)", "weight_grams": 50, "multiplier": 0.5}
        ])
    elif any(word in name_lower for word in ['queso']):
        portions.extend([
            {"name": "loncha (25g)", "weight_grams": 25, "multiplier": 0.25},
            {"name": "porción (50g)", "weight_grams": 50, "multiplier": 0.5}
        ])
    elif any(word in name_lower for word in ['pasta', 'arroz', 'macarrones', 'espagueti']):
        portions.extend([
            {"name": "plato (150g)", "weight_grams": 150, "multiplier": 1.5},
            {"name": "porción (200g)", "weight_grams": 200, "multiplier": 2}
        ])
    elif any(word in name_lower for word in ['carne', 'pollo', 'pescado', 'ternera', 'cerdo', 'pechuga', 'filete']):
        portions.extend([
            {"name": "filete (150g)", "weight_grams": 150, "multiplier": 1.5},
            {"name": "porción (200g)", "weight_grams": 200, "multiplier": 2}
        ])
    elif any(word in name_lower for word in ['frutos secos', 'almendra', 'nuez', 'avellana', 'pistacho']):
        portions.append({"name": "puñado (30g)", "weight_grams": 30, "multiplier": 0.3})
    else:
        portions.extend([
            {"name": "porción (150g)", "weight_grams": 150, "multiplier": 1.5},
            {"name": "porción (200g)", "weight_grams": 200, "multiplier": 2}
        ])
    
    return portions

def is_valid_product(product):
    """Validar que el producto tenga datos de calidad"""
    product_name = product.get("product_name", "").strip()
    if not product_name or len(product_name) < 3:
        return False
    
    nutriments = product.get("nutriments", {})
    has_energy = (
        nutriments.get("energy-kcal_100g") is not None or
        nutriments.get("energy_100g") is not None
    )
    if not has_energy:
        return False
    
    has_macros = (
        nutriments.get("proteins_100g") is not None or
        nutriments.get("carbohydrates_100g") is not None or
        nutriments.get("fat_100g") is not None
    )
    if not has_macros:
        return False
    
    return True

async def fetch_products_batch(session, page=1, page_size=50):
    """Obtener productos de Open Food Facts España con páginas más pequeñas"""
    url = f"{BASE_URL}/cgi/search.pl"
    
    # Parámetros simplificados para la API española
    params = {
        "search_simple": "1",
        "action": "process",
        "json": "1",
        "page": str(page),
        "page_size": str(page_size),
        "sort_by": "unique_scans_n",
        "tagtype_0": "countries",
        "tag_contains_0": "contains",
        "tag_0": "españa"
    }
    
    try:
        timeout = aiohttp.ClientTimeout(total=30)
        async with session.get(url, params=params, timeout=timeout) as response:
            if response.status == 200:
                try:
                    data = await response.json()
                    products = data.get("products", [])
                    return products
                except:
                    return []
            else:
                return []
    except asyncio.TimeoutError:
        print("T", end="", flush=True)  # T = Timeout
        return []
    except Exception:
        print("E", end="", flush=True)  # E = Error
        return []

def transform_product(product):
    """Transformar producto de Open Food Facts a nuestro formato"""
    try:
        nutriments = product.get("nutriments", {})
        product_name = product.get("product_name", "").strip()
        
        if not product_name:
            return None
        
        calories = nutriments.get("energy-kcal_100g")
        if calories is None:
            energy_kj = nutriments.get("energy_100g")
            if energy_kj:
                calories = energy_kj / 4.184
            else:
                calories = 0
        
        categories_str = product.get("categories", "")
        category = determine_category(categories_str)
        portions = create_smart_portions(product_name)
        
        return {
            "name": product_name,
            "brand": product.get("brands", "").strip() or None,
            "category": category,
            "nutritional_info_per_100g": {
                "calories": round(calories, 1) if calories else 0,
                "protein": round(nutriments.get("proteins_100g", 0), 1),
                "carbohydrates": round(nutriments.get("carbohydrates_100g", 0), 1),
                "fat": round(nutriments.get("fat_100g", 0), 1),
                "fiber": round(nutriments.get("fiber_100g", 0), 1),
                "sugar": round(nutriments.get("sugars_100g", 0), 1),
                "sodium": round(nutriments.get("sodium_100g", 0) * 1000, 1) if nutriments.get("sodium_100g") else 0
            },
            "portions": portions,
            "barcode": product.get("code", ""),
            "nutriscore": product.get("nutriscore_grade", "").upper() if product.get("nutriscore_grade") else None,
            "source": "openfoodfacts",
            "created_at": datetime.now(),
            "updated_at": datetime.now()
        }
    except Exception:
        return None

async def import_from_openfoodfacts(total_products=500):
    """Importar productos desde Open Food Facts España"""
    
    print("\n" + "="*70)
    print("🚀 IMPORTACIÓN DE ALIMENTOS DESDE OPEN FOOD FACTS (ESPAÑA)")
    print("="*70)
    
    # Verificar productos existentes
    existing_off = foods_collection.count_documents({"source": "openfoodfacts"})
    existing_manual = foods_collection.count_documents({"source": "manual"})
    
    print(f"📊 Alimentos actuales:")
    print(f"   • OpenFoodFacts: {existing_off}")
    print(f"   • Manuales: {existing_manual}")
    
    if existing_off > 0:
        print(f"\n⚠️  Ya tienes {existing_off} productos de OpenFoodFacts.")
        response = input("¿Deseas reemplazarlos? (s/n): ").lower()
        if response != 's':
            print("❌ Operación cancelada")
            return 0
    
    # Eliminar productos OpenFoodFacts antiguos (mantiene manuales)
    deleted = foods_collection.delete_many({"source": "openfoodfacts"})
    print(f"🗑️  Eliminados {deleted.deleted_count} productos antiguos de OpenFoodFacts")
    print(f"✅ Los {existing_manual} productos manuales se mantienen intactos\n")
    
    all_valid_products = []
    
    # Usar páginas más pequeñas (50 productos por página en lugar de 100)
    page_size = 50
    timeout = aiohttp.ClientTimeout(total=60)
    
    async with aiohttp.ClientSession(timeout=timeout) as session:
        pages_needed = (total_products // page_size) + 2  # +2 por seguridad
        
        print(f"📥 Descargando productos de España...")
        print(f"   Buscando {total_products} productos válidos...")
        print(f"   [.=OK T=Timeout E=Error]")
        print("-" * 70)
        
        page = 1
        attempts = 0
        max_attempts = pages_needed * 2  # Intentar el doble por si hay timeouts
        
        while len(all_valid_products) < total_products and attempts < max_attempts:
            attempts += 1
            
            if attempts % 5 == 1:  # Cada 5 intentos mostrar progreso
                print(f"\n  Progreso: {len(all_valid_products)}/{total_products} productos | ", end="", flush=True)
            
            print(".", end="", flush=True)
            
            products = await fetch_products_batch(session, page, page_size)
            
            if products:
                # Filtrar productos válidos
                for product in products:
                    if len(all_valid_products) >= total_products:
                        break
                    if is_valid_product(product):
                        transformed = transform_product(product)
                        if transformed:
                            all_valid_products.append(transformed)
                
                page += 1
            
            # Pausa pequeña entre peticiones
            await asyncio.sleep(0.3)
        
        print()  # Nueva línea después del progreso
    
    # Insertar en MongoDB
    if all_valid_products:
        final_products = all_valid_products[:total_products]
        print(f"\n💾 Insertando {len(final_products)} productos en MongoDB...")
        result = foods_collection.insert_many(final_products)
        
        print("\n" + "="*70)
        print("✅ IMPORTACIÓN COMPLETADA")
        print("="*70)
        print(f"📊 Total productos importados: {len(result.inserted_ids)}")
        
        # Estadísticas por categoría
        categories = foods_collection.distinct('category', {"source": "openfoodfacts"})
        print(f"\n📁 Categorías disponibles ({len(categories)}):")
        for cat in sorted(categories):
            count = foods_collection.count_documents({"category": cat, "source": "openfoodfacts"})
            print(f"   • {cat}: {count} productos")
        
        # Estadísticas por fuente
        print(f"\n📚 Productos por fuente:")
        total_off = foods_collection.count_documents({"source": "openfoodfacts"})
        total_manual = foods_collection.count_documents({"source": "manual"})
        print(f"   • openfoodfacts: {total_off} productos")
        print(f"   • manual: {total_manual} productos")
        print(f"   • TOTAL: {total_off + total_manual} productos")
        
        print("\n🎉 Base de datos lista para usar!")
        print("="*70 + "\n")
        
        return len(result.inserted_ids)
    else:
        print("\n" + "="*70)
        print("❌ NO SE PUDIERON IMPORTAR PRODUCTOS")
        print("="*70)
        print("\n🔍 Posibles causas:")
        print("   1. Problemas de conexión a Internet")
        print("   2. La API de OpenFoodFacts está caída")
        print("   3. Firewall bloqueando la conexión")
        print("\n💡 Solución alternativa:")
        print("   Usa: python import_extended_sample_foods.py")
        print("   (Ya tienes 54 productos, suficiente para demos)")
        print("="*70 + "\n")
        return 0

if __name__ == "__main__":
    # Importar 500 productos de España
    asyncio.run(import_from_openfoodfacts(500))
