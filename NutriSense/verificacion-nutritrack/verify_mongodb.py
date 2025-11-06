#!/usr/bin/env python3
# verify_mongodb.py - Script para verificar el estado de MongoDB y la base de datos de alimentos

from pymongo import MongoClient
from pymongo.errors import ConnectionFailure, ServerSelectionTimeoutError
import sys
from datetime import datetime

def print_status(status, message):
    """Imprime mensajes con formato según el estado"""
    symbols = {
        'success': '✓',
        'error': '✗',
        'warning': '⚠',
        'info': 'ℹ'
    }
    
    colors = {
        'success': '\033[92m',
        'error': '\033[91m',
        'warning': '\033[93m',
        'info': '\033[94m',
        'reset': '\033[0m'
    }
    
    print(f"{colors[status]}{symbols[status]} {message}{colors['reset']}")

def verify_mongodb():
    """Verifica la conexión y estado de MongoDB"""
    
    print('=' * 60)
    print('VERIFICACIÓN DE MONGODB PARA NUTRITRACK')
    print('=' * 60)
    print()
    
    # Intentar conectar a MongoDB
    try:
        print_status('info', 'Intentando conectar a MongoDB en localhost:27017...')
        client = MongoClient('mongodb://localhost:27017/', serverSelectionTimeoutMS=3000)
        
        # Hacer ping para verificar la conexión
        client.admin.command('ping')
        print_status('success', 'MongoDB está corriendo y accesible')
        
        # Listar todas las bases de datos
        print()
        print('─' * 60)
        print('BASES DE DATOS DISPONIBLES')
        print('─' * 60)
        
        dbs = client.list_database_names()
        for db_name in dbs:
            db = client[db_name]
            collections = db.list_collection_names()
            print(f"  📁 {db_name}")
            if collections:
                for coll in collections:
                    count = db[coll].count_documents({})
                    print(f"    └─ {coll} ({count} documentos)")
            else:
                print(f"    └─ (sin colecciones)")
        
        # Verificar específicamente la base de datos de NutriTrack
        print()
        print('─' * 60)
        print('BASE DE DATOS NUTRITRACK_FOODS')
        print('─' * 60)
        
        if 'nutritrack_foods' in dbs:
            db = client['nutritrack_foods']
            collections = db.list_collection_names()
            
            print_status('success', f'Base de datos "nutritrack_foods" existe')
            print_status('info', f'Colecciones: {", ".join(collections) if collections else "ninguna"}')
            
            # Verificar colección de alimentos
            if 'foods' in collections:
                foods_collection = db.foods
                total_foods = foods_collection.count_documents({})
                
                print_status('success', f'Colección "foods" existe con {total_foods} alimentos')
                
                if total_foods > 0:
                    # Mostrar estadísticas
                    print()
                    print('  Estadísticas de la colección:')
                    
                    # Alimento de ejemplo
                    sample = foods_collection.find_one()
                    if sample:
                        print(f"  • Ejemplo de alimento: {sample.get('name', 'Sin nombre')}")
                        print(f"    - ID: {sample.get('_id', 'N/A')}")
                        if 'nutrients' in sample:
                            nutrients = sample['nutrients']
                            print(f"    - Calorías: {nutrients.get('calories', 'N/A')} kcal")
                            print(f"    - Proteínas: {nutrients.get('protein', 'N/A')}g")
                            print(f"    - Carbohidratos: {nutrients.get('carbs', 'N/A')}g")
                            print(f"    - Grasas: {nutrients.get('fat', 'N/A')}g")
                    
                    # Contar por categorías si existen
                    categories = foods_collection.distinct('category')
                    if categories:
                        print()
                        print('  Alimentos por categoría:')
                        for cat in categories[:5]:  # Mostrar máximo 5 categorías
                            count = foods_collection.count_documents({'category': cat})
                            print(f"    - {cat or '(sin categoría)'}: {count}")
                        
                        if len(categories) > 5:
                            print(f"    ... y {len(categories) - 5} categorías más")
                    
                    # Verificar fuentes de datos
                    sources = foods_collection.distinct('source')
                    if sources:
                        print()
                        print('  Fuentes de datos:')
                        for source in sources:
                            count = foods_collection.count_documents({'source': source})
                            print(f"    - {source or 'manual'}: {count} alimentos")
                    
                else:
                    print_status('warning', 'La colección "foods" está vacía')
                    print_status('info', 'Ejecuta el script ETL para importar alimentos')
                    print('    python import_sample_foods.py')
                    print('    python import_from_openfoodfacts.py')
            else:
                print_status('warning', 'La colección "foods" no existe')
                print_status('info', 'Se creará automáticamente al insertar el primer documento')
        else:
            print_status('warning', 'La base de datos "nutritrack_foods" no existe aún')
            print_status('info', 'Se creará automáticamente al insertar el primer documento')
        
        # Información del servidor
        print()
        print('─' * 60)
        print('INFORMACIÓN DEL SERVIDOR')
        print('─' * 60)
        
        server_info = client.server_info()
        print(f"  • Versión de MongoDB: {server_info.get('version', 'Desconocida')}")
        print(f"  • Host: localhost:27017")
        
        # Verificar índices en la colección foods
        if 'nutritrack_foods' in dbs and 'foods' in client['nutritrack_foods'].list_collection_names():
            print()
            print('─' * 60)
            print('ÍNDICES EN LA COLECCIÓN FOODS')
            print('─' * 60)
            
            indexes = list(client['nutritrack_foods'].foods.list_indexes())
            if indexes:
                for idx in indexes:
                    print(f"  • {idx['name']}: {idx.get('key', {})}")
            else:
                print_status('info', 'No hay índices personalizados (solo el índice por defecto _id)')
        
        print()
        print('=' * 60)
        print_status('success', 'Verificación completada exitosamente')
        print('=' * 60)
        
        return True
        
    except ServerSelectionTimeoutError:
        print_status('error', 'No se pudo conectar a MongoDB')
        print_status('info', 'Verifica que MongoDB esté corriendo:')
        print('    Windows: net start MongoDB')
        print('    o manualmente: mongod --dbpath C:\\data\\db')
        print()
        return False
        
    except ConnectionFailure as e:
        print_status('error', f'Error de conexión: {e}')
        return False
        
    except Exception as e:
        print_status('error', f'Error inesperado: {e}')
        import traceback
        traceback.print_exc()
        return False

if __name__ == '__main__':
    success = verify_mongodb()
    sys.exit(0 if success else 1)
