#!/usr/bin/env python3
"""
Script de importación de alimentos de muestra para NutriTrack
Versión sin confirmación interactiva para Docker
"""

import sys
from pymongo import MongoClient
from datetime import datetime

# Configuración de MongoDB
MONGO_URI = "mongodb://mongodb:27017"
MONGO_DB = "nutrition_db"
COLLECTION_NAME = "foods"

def get_mongo_client():
    """Obtener cliente de MongoDB"""
    try:
        client = MongoClient(MONGO_URI)
        # Verificar conexión
        client.server_info()
        return client
    except Exception as e:
        print(f"❌ Error conectando a MongoDB: {e}")
        sys.exit(1)

def import_extended_foods():
    """Importar base de datos extendida de alimentos españoles"""
    
    print("\n" + "="*70)
    print("🚀 IMPORTACIÓN DE ALIMENTOS DE MUESTRA EXTENDIDOS")
    print("="*70)
    
    client = get_mongo_client()
    db = client[MONGO_DB]
    collection = db[COLLECTION_NAME]
    
    # Verificar si ya hay alimentos
    existing_count = collection.count_documents({"source": "manual"})
    print(f"📊 Alimentos manuales existentes: {existing_count}\n")
    
    # Si ya existen alimentos, salir sin hacer nada
    if existing_count > 0:
        print("⚠️  Ya tienes alimentos en la base de datos.")
        print("✅ Saltando importación para evitar duplicados.\n")
        print("💡 Si deseas reimportar, primero elimina la base de datos:")
        print("   docker-compose exec backend-python python -c \"from pymongo import MongoClient; MongoClient('mongodb://mongodb:27017')['nutrition_db']['foods'].delete_many({'source': 'manual'})\"")
        print("="*70)
        client.close()
        return
    
    # Base de datos extendida de alimentos españoles
    extended_foods = [
        # LÁCTEOS
        {"name": "Leche entera", "category": "Lácteos", "nutrients": {"calories": 61, "protein": 3.2, "carbs": 4.8, "fat": 3.3, "fiber": 0}, "portions": [{"name": "vaso", "grams": 250}], "source": "manual"},
        {"name": "Leche desnatada", "category": "Lácteos", "nutrients": {"calories": 34, "protein": 3.4, "carbs": 5.0, "fat": 0.1, "fiber": 0}, "portions": [{"name": "vaso", "grams": 250}], "source": "manual"},
        {"name": "Yogur natural", "category": "Lácteos", "nutrients": {"calories": 61, "protein": 3.5, "carbs": 4.7, "fat": 3.3, "fiber": 0}, "portions": [{"name": "unidad", "grams": 125}], "source": "manual"},
        {"name": "Queso manchego", "category": "Lácteos", "nutrients": {"calories": 392, "protein": 29, "carbs": 0.5, "fat": 32, "fiber": 0}, "portions": [{"name": "loncha", "grams": 30}], "source": "manual"},
        {"name": "Requesón", "category": "Lácteos", "nutrients": {"calories": 98, "protein": 11, "carbs": 3.4, "fat": 4.3, "fiber": 0}, "portions": [{"name": "tarrina", "grams": 100}], "source": "manual"},
        {"name": "Queso fresco", "category": "Lácteos", "nutrients": {"calories": 174, "protein": 13.6, "carbs": 3.9, "fat": 13, "fiber": 0}, "portions": [{"name": "porción", "grams": 50}], "source": "manual"},
        
        # CARNES Y EMBUTIDOS
        {"name": "Pechuga de pollo", "category": "Carnes y Embutidos", "nutrients": {"calories": 165, "protein": 31, "carbs": 0, "fat": 3.6, "fiber": 0}, "portions": [{"name": "filete", "grams": 150}], "source": "manual"},
        {"name": "Muslo de pollo", "category": "Carnes y Embutidos", "nutrients": {"calories": 209, "protein": 26, "carbs": 0, "fat": 11, "fiber": 0}, "portions": [{"name": "pieza", "grams": 125}], "source": "manual"},
        {"name": "Ternera", "category": "Carnes y Embutidos", "nutrients": {"calories": 250, "protein": 26, "carbs": 0, "fat": 16, "fiber": 0}, "portions": [{"name": "filete", "grams": 150}], "source": "manual"},
        {"name": "Cerdo", "category": "Carnes y Embutidos", "nutrients": {"calories": 242, "protein": 27, "carbs": 0, "fat": 14, "fiber": 0}, "portions": [{"name": "chuleta", "grams": 150}], "source": "manual"},
        {"name": "Jamón serrano", "category": "Carnes y Embutidos", "nutrients": {"calories": 163, "protein": 30.5, "carbs": 0, "fat": 4.2, "fiber": 0}, "portions": [{"name": "loncha", "grams": 20}], "source": "manual"},
        {"name": "Chorizo", "category": "Carnes y Embutidos", "nutrients": {"calories": 455, "protein": 24, "carbs": 2, "fat": 38, "fiber": 0}, "portions": [{"name": "rodaja", "grams": 30}], "source": "manual"},
        
        # PESCADOS Y MARISCOS
        {"name": "Salmón", "category": "Pescados y Mariscos", "nutrients": {"calories": 208, "protein": 20, "carbs": 0, "fat": 13, "fiber": 0}, "portions": [{"name": "filete", "grams": 150}], "source": "manual"},
        {"name": "Merluza", "category": "Pescados y Mariscos", "nutrients": {"calories": 86, "protein": 17, "carbs": 0, "fat": 1.8, "fiber": 0}, "portions": [{"name": "filete", "grams": 150}], "source": "manual"},
        {"name": "Atún en lata", "category": "Pescados y Mariscos", "nutrients": {"calories": 116, "protein": 26, "carbs": 0, "fat": 1, "fiber": 0}, "portions": [{"name": "lata", "grams": 80}], "source": "manual"},
        {"name": "Gambas", "category": "Pescados y Mariscos", "nutrients": {"calories": 71, "protein": 13.6, "carbs": 0.9, "fat": 0.6, "fiber": 0}, "portions": [{"name": "ración", "grams": 100}], "source": "manual"},
        
        # HUEVOS
        {"name": "Huevo entero", "category": "Huevos", "nutrients": {"calories": 155, "protein": 13, "carbs": 1.1, "fat": 11, "fiber": 0}, "portions": [{"name": "unidad", "grams": 60}], "source": "manual"},
        {"name": "Clara de huevo", "category": "Huevos", "nutrients": {"calories": 52, "protein": 11, "carbs": 0.7, "fat": 0.2, "fiber": 0}, "portions": [{"name": "clara", "grams": 33}], "source": "manual"},
        
        # CEREALES Y GRANOS
        {"name": "Arroz blanco", "category": "Cereales y Granos", "nutrients": {"calories": 130, "protein": 2.7, "carbs": 28, "fat": 0.3, "fiber": 0.4}, "portions": [{"name": "taza cocido", "grams": 150}], "source": "manual"},
        {"name": "Pasta", "category": "Cereales y Granos", "nutrients": {"calories": 158, "protein": 5.8, "carbs": 31, "fat": 0.9, "fiber": 1.8}, "portions": [{"name": "plato cocida", "grams": 100}], "source": "manual"},
        {"name": "Pan integral", "category": "Cereales y Granos", "nutrients": {"calories": 247, "protein": 7.9, "carbs": 41, "fat": 3.5, "fiber": 7.4}, "portions": [{"name": "rebanada", "grams": 30}], "source": "manual"},
        {"name": "Avena", "category": "Cereales y Granos", "nutrients": {"calories": 389, "protein": 16.9, "carbs": 66, "fat": 6.9, "fiber": 10.6}, "portions": [{"name": "taza", "grams": 80}], "source": "manual"},
        {"name": "Quinoa", "category": "Cereales y Granos", "nutrients": {"calories": 120, "protein": 4.4, "carbs": 21, "fat": 1.9, "fiber": 2.8}, "portions": [{"name": "taza cocida", "grams": 185}], "source": "manual"},
        
        # LEGUMBRES
        {"name": "Lentejas", "category": "Legumbres", "nutrients": {"calories": 116, "protein": 9, "carbs": 20, "fat": 0.4, "fiber": 7.9}, "portions": [{"name": "taza cocida", "grams": 200}], "source": "manual"},
        {"name": "Garbanzos", "category": "Legumbres", "nutrients": {"calories": 164, "protein": 8.9, "carbs": 27, "fat": 2.6, "fiber": 7.6}, "portions": [{"name": "taza cocida", "grams": 165}], "source": "manual"},
        {"name": "Alubias", "category": "Legumbres", "nutrients": {"calories": 127, "protein": 8.7, "carbs": 23, "fat": 0.5, "fiber": 6.4}, "portions": [{"name": "taza cocida", "grams": 180}], "source": "manual"},
        
        # VERDURAS Y HORTALIZAS
        {"name": "Tomate", "category": "Verduras y Hortalizas", "nutrients": {"calories": 18, "protein": 0.9, "carbs": 3.9, "fat": 0.2, "fiber": 1.2}, "portions": [{"name": "unidad mediana", "grams": 150}], "source": "manual"},
        {"name": "Lechuga", "category": "Verduras y Hortalizas", "nutrients": {"calories": 15, "protein": 1.4, "carbs": 2.9, "fat": 0.2, "fiber": 1.3}, "portions": [{"name": "bol", "grams": 100}], "source": "manual"},
        {"name": "Zanahoria", "category": "Verduras y Hortalizas", "nutrients": {"calories": 41, "protein": 0.9, "carbs": 10, "fat": 0.2, "fiber": 2.8}, "portions": [{"name": "unidad", "grams": 120}], "source": "manual"},
        {"name": "Brócoli", "category": "Verduras y Hortalizas", "nutrients": {"calories": 34, "protein": 2.8, "carbs": 7, "fat": 0.4, "fiber": 2.6}, "portions": [{"name": "taza", "grams": 90}], "source": "manual"},
        {"name": "Espinacas", "category": "Verduras y Hortalizas", "nutrients": {"calories": 23, "protein": 2.9, "carbs": 3.6, "fat": 0.4, "fiber": 2.2}, "portions": [{"name": "taza cocida", "grams": 180}], "source": "manual"},
        {"name": "Pimiento", "category": "Verduras y Hortalizas", "nutrients": {"calories": 20, "protein": 0.9, "carbs": 4.6, "fat": 0.2, "fiber": 1.7}, "portions": [{"name": "unidad", "grams": 120}], "source": "manual"},
        {"name": "Cebolla", "category": "Verduras y Hortalizas", "nutrients": {"calories": 40, "protein": 1.1, "carbs": 9.3, "fat": 0.1, "fiber": 1.7}, "portions": [{"name": "unidad", "grams": 110}], "source": "manual"},
        {"name": "Pepino", "category": "Verduras y Hortalizas", "nutrients": {"calories": 15, "protein": 0.7, "carbs": 3.6, "fat": 0.1, "fiber": 0.5}, "portions": [{"name": "unidad", "grams": 300}], "source": "manual"},
        
        # FRUTAS
        {"name": "Manzana", "category": "Frutas", "nutrients": {"calories": 52, "protein": 0.3, "carbs": 14, "fat": 0.2, "fiber": 2.4}, "portions": [{"name": "unidad", "grams": 182}], "source": "manual"},
        {"name": "Plátano", "category": "Frutas", "nutrients": {"calories": 89, "protein": 1.1, "carbs": 23, "fat": 0.3, "fiber": 2.6}, "portions": [{"name": "unidad", "grams": 118}], "source": "manual"},
        {"name": "Naranja", "category": "Frutas", "nutrients": {"calories": 47, "protein": 0.9, "carbs": 12, "fat": 0.1, "fiber": 2.4}, "portions": [{"name": "unidad", "grams": 140}], "source": "manual"},
        {"name": "Fresas", "category": "Frutas", "nutrients": {"calories": 32, "protein": 0.7, "carbs": 7.7, "fat": 0.3, "fiber": 2}, "portions": [{"name": "taza", "grams": 150}], "source": "manual"},
        {"name": "Kiwi", "category": "Frutas", "nutrients": {"calories": 61, "protein": 1.1, "carbs": 15, "fat": 0.5, "fiber": 3}, "portions": [{"name": "unidad", "grams": 69}], "source": "manual"},
        {"name": "Uvas", "category": "Frutas", "nutrients": {"calories": 69, "protein": 0.7, "carbs": 18, "fat": 0.2, "fiber": 0.9}, "portions": [{"name": "racimo", "grams": 150}], "source": "manual"},
        {"name": "Sandía", "category": "Frutas", "nutrients": {"calories": 30, "protein": 0.6, "carbs": 7.6, "fat": 0.2, "fiber": 0.4}, "portions": [{"name": "rodaja", "grams": 280}], "source": "manual"},
        {"name": "Pera", "category": "Frutas", "nutrients": {"calories": 57, "protein": 0.4, "carbs": 15, "fat": 0.1, "fiber": 3.1}, "portions": [{"name": "unidad", "grams": 178}], "source": "manual"},
        
        # FRUTOS SECOS
        {"name": "Almendras", "category": "Frutos Secos", "nutrients": {"calories": 579, "protein": 21, "carbs": 22, "fat": 50, "fiber": 12}, "portions": [{"name": "puñado", "grams": 30}], "source": "manual"},
        {"name": "Nueces", "category": "Frutos Secos", "nutrients": {"calories": 654, "protein": 15, "carbs": 14, "fat": 65, "fiber": 6.7}, "portions": [{"name": "puñado", "grams": 30}], "source": "manual"},
        {"name": "Cacahuetes", "category": "Frutos Secos", "nutrients": {"calories": 567, "protein": 26, "carbs": 16, "fat": 49, "fiber": 8.5}, "portions": [{"name": "puñado", "grams": 30}], "source": "manual"},
        
        # ACEITES Y GRASAS
        {"name": "Aceite de oliva", "category": "Aceites y Grasas", "nutrients": {"calories": 884, "protein": 0, "carbs": 0, "fat": 100, "fiber": 0}, "portions": [{"name": "cucharada", "grams": 14}], "source": "manual"},
        {"name": "Aguacate", "category": "Aceites y Grasas", "nutrients": {"calories": 160, "protein": 2, "carbs": 8.5, "fat": 15, "fiber": 6.7}, "portions": [{"name": "mitad", "grams": 100}], "source": "manual"},
        
        # PANADERÍA
        {"name": "Pan blanco", "category": "Panadería", "nutrients": {"calories": 265, "protein": 9, "carbs": 49, "fat": 3.2, "fiber": 2.7}, "portions": [{"name": "rebanada", "grams": 30}], "source": "manual"},
        {"name": "Croissant", "category": "Panadería", "nutrients": {"calories": 406, "protein": 8.2, "carbs": 46, "fat": 21, "fiber": 2.6}, "portions": [{"name": "unidad", "grams": 50}], "source": "manual"},
        {"name": "Galletas María", "category": "Panadería", "nutrients": {"calories": 436, "protein": 7, "carbs": 75, "fat": 12, "fiber": 2.5}, "portions": [{"name": "galleta", "grams": 8}], "source": "manual"},
        {"name": "Tostadas", "category": "Panadería", "nutrients": {"calories": 373, "protein": 11, "carbs": 72, "fat": 5, "fiber": 4.5}, "portions": [{"name": "unidad", "grams": 10}], "source": "manual"},
        
        # BEBIDAS
        {"name": "Café solo", "category": "Bebidas", "nutrients": {"calories": 2, "protein": 0.1, "carbs": 0, "fat": 0, "fiber": 0}, "portions": [{"name": "taza", "grams": 240}], "source": "manual"},
        {"name": "Té verde", "category": "Bebidas", "nutrients": {"calories": 1, "protein": 0, "carbs": 0, "fat": 0, "fiber": 0}, "portions": [{"name": "taza", "grams": 240}], "source": "manual"},
        {"name": "Zumo de naranja", "category": "Bebidas", "nutrients": {"calories": 45, "protein": 0.7, "carbs": 10, "fat": 0.2, "fiber": 0.2}, "portions": [{"name": "vaso", "grams": 240}], "source": "manual"},
    ]
    
    # Insertar alimentos
    result = collection.insert_many(extended_foods)
    
    print("="*70)
    print("✅ IMPORTACIÓN COMPLETADA")
    print("="*70)
    print(f"📊 Total productos importados: {len(result.inserted_ids)}")
    
    # Mostrar estadísticas por categoría
    pipeline = [
        {"$match": {"source": "manual"}},
        {"$group": {"_id": "$category", "count": {"$sum": 1}}},
        {"$sort": {"_id": 1}}
    ]
    
    categories = list(collection.aggregate(pipeline))
    
    print(f"\n📁 Categorías disponibles ({len(categories)}):")
    for cat in categories:
        print(f"   • {cat['_id']}: {cat['count']} productos")
    
    # Total de alimentos
    total = collection.count_documents({"source": "manual"})
    print(f"\n📚 Total en base de datos:")
    print(f"   • Total: {total} productos")
    
    print("\n🎉 Base de datos lista para usar!")
    print("="*70 + "\n")
    
    client.close()

if __name__ == "__main__":
    import_extended_foods()
