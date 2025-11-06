#!/usr/bin/env python3
# check_nutrition_db.py - Ver qué hay en la base de datos nutrition_db

from pymongo import MongoClient

try:
    client = MongoClient('mongodb://localhost:27017/')
    db = client['nutrition_db']
    
    print('=' * 70)
    print('CONTENIDO DE LA BASE DE DATOS: nutrition_db')
    print('=' * 70)
    print()
    
    # Ver colecciones
    collections = db.list_collection_names()
    print(f"📁 Colecciones: {collections}")
    print()
    
    # Ver alimentos
    foods = db.foods
    count = foods.count_documents({})
    print(f"🍎 Total de alimentos: {count}")
    print()
    
    if count > 0:
        print('─' * 70)
        print('EJEMPLOS DE ALIMENTOS:')
        print('─' * 70)
        
        # Mostrar primeros 5 alimentos
        for i, food in enumerate(foods.find().limit(5), 1):
            print(f"\n{i}. {food.get('name', 'Sin nombre')}")
            print(f"   ID: {food.get('_id')}")
            
            if 'nutrients' in food:
                nutrients = food['nutrients']
                print(f"   Calorías: {nutrients.get('calories', 'N/A')} kcal")
                print(f"   Proteínas: {nutrients.get('protein', 'N/A')}g")
                print(f"   Carbohidratos: {nutrients.get('carbs', 'N/A')}g")
                print(f"   Grasas: {nutrients.get('fat', 'N/A')}g")
            
            if 'category' in food:
                print(f"   Categoría: {food.get('category')}")
        
        if count > 5:
            print(f"\n... y {count - 5} alimentos más")
        
        print()
        print('─' * 70)
        
        # Estructura de un documento completo
        print('\nESTRUCTURA DE UN DOCUMENTO (ejemplo):')
        print('─' * 70)
        sample = foods.find_one()
        
        import json
        print(json.dumps({k: v for k, v in sample.items() if k != '_id'}, indent=2, ensure_ascii=False))
    
    print()
    print('=' * 70)
    print('✅ Revisión completada')
    print('=' * 70)
    
except Exception as e:
    print(f"❌ Error: {e}")
