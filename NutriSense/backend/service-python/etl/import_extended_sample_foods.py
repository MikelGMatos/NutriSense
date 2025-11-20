"""Script ALTERNATIVO: Importar alimentos de muestra extendidos (sin necesidad de API externa)"""
import sys
import os
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from app.config.database import foods_collection
from datetime import datetime

# Base de datos extendida con 100+ alimentos comunes en España
EXTENDED_FOODS = [
    # CARNES Y EMBUTIDOS
    {"name": "Pechuga de pollo", "category": "Carnes y Embutidos", "brand": None, "nutritional_info_per_100g": {"calories": 165, "protein": 31, "carbohydrates": 0, "fat": 3.6, "fiber": 0, "sugar": 0, "sodium": 74}, "portions": [{"name": "filete (150g)", "weight_grams": 150, "multiplier": 1.5}, {"name": "100g", "weight_grams": 100, "multiplier": 1}], "source": "manual"},
    {"name": "Muslo de pollo", "category": "Carnes y Embutidos", "brand": None, "nutritional_info_per_100g": {"calories": 209, "protein": 26, "carbohydrates": 0, "fat": 10.9, "fiber": 0, "sugar": 0, "sodium": 82}, "portions": [{"name": "unidad (150g)", "weight_grams": 150, "multiplier": 1.5}, {"name": "100g", "weight_grams": 100, "multiplier": 1}], "source": "manual"},
    {"name": "Ternera picada", "category": "Carnes y Embutidos", "brand": None, "nutritional_info_per_100g": {"calories": 250, "protein": 20, "carbohydrates": 0, "fat": 19, "fiber": 0, "sugar": 0, "sodium": 65}, "portions": [{"name": "porción (150g)", "weight_grams": 150, "multiplier": 1.5}, {"name": "100g", "weight_grams": 100, "multiplier": 1}], "source": "manual"},
    {"name": "Lomo de cerdo", "category": "Carnes y Embutidos", "brand": None, "nutritional_info_per_100g": {"calories": 143, "protein": 20, "carbohydrates": 0, "fat": 6.7, "fiber": 0, "sugar": 0, "sodium": 62}, "portions": [{"name": "filete (120g)", "weight_grams": 120, "multiplier": 1.2}, {"name": "100g", "weight_grams": 100, "multiplier": 1}], "source": "manual"},
    {"name": "Jamón serrano", "category": "Carnes y Embutidos", "brand": None, "nutritional_info_per_100g": {"calories": 241, "protein": 30, "carbohydrates": 0.5, "fat": 13, "fiber": 0, "sugar": 0.5, "sodium": 2500}, "portions": [{"name": "loncha (25g)", "weight_grams": 25, "multiplier": 0.25}, {"name": "100g", "weight_grams": 100, "multiplier": 1}], "source": "manual"},
    {"name": "Chorizo", "category": "Carnes y Embutidos", "brand": None, "nutritional_info_per_100g": {"calories": 455, "protein": 24, "carbohydrates": 2, "fat": 38, "fiber": 0, "sugar": 2, "sodium": 1200}, "portions": [{"name": "rodaja (15g)", "weight_grams": 15, "multiplier": 0.15}, {"name": "100g", "weight_grams": 100, "multiplier": 1}], "source": "manual"},
    
    # PESCADOS Y MARISCOS
    {"name": "Salmón fresco", "category": "Pescados y Mariscos", "brand": None, "nutritional_info_per_100g": {"calories": 208, "protein": 20, "carbohydrates": 0, "fat": 13, "fiber": 0, "sugar": 0, "sodium": 59}, "portions": [{"name": "filete (150g)", "weight_grams": 150, "multiplier": 1.5}, {"name": "100g", "weight_grams": 100, "multiplier": 1}], "source": "manual"},
    {"name": "Atún en lata", "category": "Pescados y Mariscos", "brand": None, "nutritional_info_per_100g": {"calories": 116, "protein": 26, "carbohydrates": 0, "fat": 1, "fiber": 0, "sugar": 0, "sodium": 400}, "portions": [{"name": "lata (80g)", "weight_grams": 80, "multiplier": 0.8}, {"name": "100g", "weight_grams": 100, "multiplier": 1}], "source": "manual"},
    {"name": "Merluza", "category": "Pescados y Mariscos", "brand": None, "nutritional_info_per_100g": {"calories": 86, "protein": 17, "carbohydrates": 0, "fat": 2, "fiber": 0, "sugar": 0, "sodium": 76}, "portions": [{"name": "filete (150g)", "weight_grams": 150, "multiplier": 1.5}, {"name": "100g", "weight_grams": 100, "multiplier": 1}], "source": "manual"},
    {"name": "Gambas", "category": "Pescados y Mariscos", "brand": None, "nutritional_info_per_100g": {"calories": 99, "protein": 24, "carbohydrates": 0, "fat": 0.3, "fiber": 0, "sugar": 0, "sodium": 111}, "portions": [{"name": "ración (80g)", "weight_grams": 80, "multiplier": 0.8}, {"name": "100g", "weight_grams": 100, "multiplier": 1}], "source": "manual"},
    
    # LÁCTEOS
    {"name": "Leche entera", "category": "Lácteos", "brand": None, "nutritional_info_per_100g": {"calories": 61, "protein": 3.2, "carbohydrates": 4.8, "fat": 3.3, "fiber": 0, "sugar": 5, "sodium": 43}, "portions": [{"name": "vaso (250ml)", "weight_grams": 250, "multiplier": 2.5}, {"name": "taza (200ml)", "weight_grams": 200, "multiplier": 2}, {"name": "100ml", "weight_grams": 100, "multiplier": 1}], "source": "manual"},
    {"name": "Leche desnatada", "category": "Lácteos", "brand": None, "nutritional_info_per_100g": {"calories": 34, "protein": 3.4, "carbohydrates": 5, "fat": 0.1, "fiber": 0, "sugar": 5, "sodium": 42}, "portions": [{"name": "vaso (250ml)", "weight_grams": 250, "multiplier": 2.5}, {"name": "100ml", "weight_grams": 100, "multiplier": 1}], "source": "manual"},
    {"name": "Yogur natural", "category": "Lácteos", "brand": None, "nutritional_info_per_100g": {"calories": 59, "protein": 10, "carbohydrates": 3.6, "fat": 0.4, "fiber": 0, "sugar": 3.6, "sodium": 46}, "portions": [{"name": "unidad (125g)", "weight_grams": 125, "multiplier": 1.25}, {"name": "100g", "weight_grams": 100, "multiplier": 1}], "source": "manual"},
    {"name": "Yogur griego", "category": "Lácteos", "brand": None, "nutritional_info_per_100g": {"calories": 133, "protein": 9, "carbohydrates": 5, "fat": 9, "fiber": 0, "sugar": 5, "sodium": 35}, "portions": [{"name": "unidad (150g)", "weight_grams": 150, "multiplier": 1.5}, {"name": "100g", "weight_grams": 100, "multiplier": 1}], "source": "manual"},
    {"name": "Queso fresco", "category": "Lácteos", "brand": None, "nutritional_info_per_100g": {"calories": 264, "protein": 18, "carbohydrates": 3, "fat": 21, "fiber": 0, "sugar": 3, "sodium": 400}, "portions": [{"name": "porción (50g)", "weight_grams": 50, "multiplier": 0.5}, {"name": "100g", "weight_grams": 100, "multiplier": 1}], "source": "manual"},
    {"name": "Queso manchego", "category": "Lácteos", "brand": None, "nutritional_info_per_100g": {"calories": 392, "protein": 26, "carbohydrates": 1.3, "fat": 32, "fiber": 0, "sugar": 0.5, "sodium": 850}, "portions": [{"name": "loncha (30g)", "weight_grams": 30, "multiplier": 0.3}, {"name": "100g", "weight_grams": 100, "multiplier": 1}], "source": "manual"},
    
    # FRUTAS
    {"name": "Manzana", "category": "Frutas", "brand": None, "nutritional_info_per_100g": {"calories": 52, "protein": 0.3, "carbohydrates": 14, "fat": 0.2, "fiber": 2.4, "sugar": 10, "sodium": 1}, "portions": [{"name": "unidad (182g)", "weight_grams": 182, "multiplier": 1.82}, {"name": "100g", "weight_grams": 100, "multiplier": 1}], "source": "manual"},
    {"name": "Plátano", "category": "Frutas", "brand": None, "nutritional_info_per_100g": {"calories": 89, "protein": 1.1, "carbohydrates": 23, "fat": 0.3, "fiber": 2.6, "sugar": 12, "sodium": 1}, "portions": [{"name": "unidad (120g)", "weight_grams": 120, "multiplier": 1.2}, {"name": "100g", "weight_grams": 100, "multiplier": 1}], "source": "manual"},
    {"name": "Naranja", "category": "Frutas", "brand": None, "nutritional_info_per_100g": {"calories": 47, "protein": 0.9, "carbohydrates": 12, "fat": 0.1, "fiber": 2.4, "sugar": 9, "sodium": 0}, "portions": [{"name": "unidad (150g)", "weight_grams": 150, "multiplier": 1.5}, {"name": "100g", "weight_grams": 100, "multiplier": 1}], "source": "manual"},
    {"name": "Fresa", "category": "Frutas", "brand": None, "nutritional_info_per_100g": {"calories": 32, "protein": 0.7, "carbohydrates": 7.7, "fat": 0.3, "fiber": 2, "sugar": 4.9, "sodium": 1}, "portions": [{"name": "ración (150g)", "weight_grams": 150, "multiplier": 1.5}, {"name": "100g", "weight_grams": 100, "multiplier": 1}], "source": "manual"},
    {"name": "Melón", "category": "Frutas", "brand": None, "nutritional_info_per_100g": {"calories": 34, "protein": 0.8, "carbohydrates": 8, "fat": 0.2, "fiber": 0.9, "sugar": 7.9, "sodium": 16}, "portions": [{"name": "rodaja (200g)", "weight_grams": 200, "multiplier": 2}, {"name": "100g", "weight_grams": 100, "multiplier": 1}], "source": "manual"},
    {"name": "Sandía", "category": "Frutas", "brand": None, "nutritional_info_per_100g": {"calories": 30, "protein": 0.6, "carbohydrates": 7.6, "fat": 0.2, "fiber": 0.4, "sugar": 6.2, "sodium": 1}, "portions": [{"name": "rodaja (250g)", "weight_grams": 250, "multiplier": 2.5}, {"name": "100g", "weight_grams": 100, "multiplier": 1}], "source": "manual"},
    {"name": "Kiwi", "category": "Frutas", "brand": None, "nutritional_info_per_100g": {"calories": 61, "protein": 1.1, "carbohydrates": 15, "fat": 0.5, "fiber": 3, "sugar": 9, "sodium": 3}, "portions": [{"name": "unidad (70g)", "weight_grams": 70, "multiplier": 0.7}, {"name": "100g", "weight_grams": 100, "multiplier": 1}], "source": "manual"},
    {"name": "Aguacate", "category": "Frutas", "brand": None, "nutritional_info_per_100g": {"calories": 160, "protein": 2, "carbohydrates": 9, "fat": 15, "fiber": 7, "sugar": 0.7, "sodium": 7}, "portions": [{"name": "unidad (200g)", "weight_grams": 200, "multiplier": 2}, {"name": "mitad (100g)", "weight_grams": 100, "multiplier": 1}], "source": "manual"},
    
    # VERDURAS Y HORTALIZAS
    {"name": "Tomate", "category": "Verduras y Hortalizas", "brand": None, "nutritional_info_per_100g": {"calories": 18, "protein": 0.9, "carbohydrates": 3.9, "fat": 0.2, "fiber": 1.2, "sugar": 2.6, "sodium": 5}, "portions": [{"name": "unidad (150g)", "weight_grams": 150, "multiplier": 1.5}, {"name": "100g", "weight_grams": 100, "multiplier": 1}], "source": "manual"},
    {"name": "Lechuga", "category": "Verduras y Hortalizas", "brand": None, "nutritional_info_per_100g": {"calories": 15, "protein": 1.4, "carbohydrates": 2.9, "fat": 0.2, "fiber": 1.3, "sugar": 0.8, "sodium": 28}, "portions": [{"name": "ración (80g)", "weight_grams": 80, "multiplier": 0.8}, {"name": "100g", "weight_grams": 100, "multiplier": 1}], "source": "manual"},
    {"name": "Pepino", "category": "Verduras y Hortalizas", "brand": None, "nutritional_info_per_100g": {"calories": 15, "protein": 0.7, "carbohydrates": 3.6, "fat": 0.1, "fiber": 0.5, "sugar": 1.7, "sodium": 2}, "portions": [{"name": "unidad (200g)", "weight_grams": 200, "multiplier": 2}, {"name": "100g", "weight_grams": 100, "multiplier": 1}], "source": "manual"},
    {"name": "Zanahoria", "category": "Verduras y Hortalizas", "brand": None, "nutritional_info_per_100g": {"calories": 41, "protein": 0.9, "carbohydrates": 10, "fat": 0.2, "fiber": 2.8, "sugar": 4.7, "sodium": 69}, "portions": [{"name": "unidad (60g)", "weight_grams": 60, "multiplier": 0.6}, {"name": "100g", "weight_grams": 100, "multiplier": 1}], "source": "manual"},
    {"name": "Brócoli", "category": "Verduras y Hortalizas", "brand": None, "nutritional_info_per_100g": {"calories": 35, "protein": 2.4, "carbohydrates": 7, "fat": 0.4, "fiber": 3.3, "sugar": 1.4, "sodium": 41}, "portions": [{"name": "ración (150g)", "weight_grams": 150, "multiplier": 1.5}, {"name": "100g", "weight_grams": 100, "multiplier": 1}], "source": "manual"},
    {"name": "Espinacas", "category": "Verduras y Hortalizas", "brand": None, "nutritional_info_per_100g": {"calories": 23, "protein": 2.9, "carbohydrates": 3.6, "fat": 0.4, "fiber": 2.2, "sugar": 0.4, "sodium": 79}, "portions": [{"name": "ración (100g)", "weight_grams": 100, "multiplier": 1}], "source": "manual"},
    {"name": "Pimiento rojo", "category": "Verduras y Hortalizas", "brand": None, "nutritional_info_per_100g": {"calories": 31, "protein": 1, "carbohydrates": 6, "fat": 0.3, "fiber": 2.1, "sugar": 4.2, "sodium": 4}, "portions": [{"name": "unidad (120g)", "weight_grams": 120, "multiplier": 1.2}, {"name": "100g", "weight_grams": 100, "multiplier": 1}], "source": "manual"},
    {"name": "Cebolla", "category": "Verduras y Hortalizas", "brand": None, "nutritional_info_per_100g": {"calories": 40, "protein": 1.1, "carbohydrates": 9, "fat": 0.1, "fiber": 1.7, "sugar": 4.2, "sodium": 4}, "portions": [{"name": "unidad (110g)", "weight_grams": 110, "multiplier": 1.1}, {"name": "100g", "weight_grams": 100, "multiplier": 1}], "source": "manual"},
    
    # CEREALES Y GRANOS
    {"name": "Arroz blanco cocido", "category": "Cereales y Granos", "brand": None, "nutritional_info_per_100g": {"calories": 130, "protein": 2.7, "carbohydrates": 28, "fat": 0.3, "fiber": 0.4, "sugar": 0.1, "sodium": 1}, "portions": [{"name": "plato (200g)", "weight_grams": 200, "multiplier": 2}, {"name": "taza (158g)", "weight_grams": 158, "multiplier": 1.58}, {"name": "100g", "weight_grams": 100, "multiplier": 1}], "source": "manual"},
    {"name": "Arroz integral cocido", "category": "Cereales y Granos", "brand": None, "nutritional_info_per_100g": {"calories": 111, "protein": 2.6, "carbohydrates": 23, "fat": 0.9, "fiber": 1.8, "sugar": 0.4, "sodium": 5}, "portions": [{"name": "plato (200g)", "weight_grams": 200, "multiplier": 2}, {"name": "100g", "weight_grams": 100, "multiplier": 1}], "source": "manual"},
    {"name": "Pasta cocida", "category": "Cereales y Granos", "brand": None, "nutritional_info_per_100g": {"calories": 131, "protein": 5, "carbohydrates": 25, "fat": 1.1, "fiber": 1.8, "sugar": 0.6, "sodium": 1}, "portions": [{"name": "plato (200g)", "weight_grams": 200, "multiplier": 2}, {"name": "taza (140g)", "weight_grams": 140, "multiplier": 1.4}, {"name": "100g", "weight_grams": 100, "multiplier": 1}], "source": "manual"},
    {"name": "Quinoa cocida", "category": "Cereales y Granos", "brand": None, "nutritional_info_per_100g": {"calories": 120, "protein": 4.4, "carbohydrates": 21, "fat": 1.9, "fiber": 2.8, "sugar": 0.9, "sodium": 7}, "portions": [{"name": "ración (150g)", "weight_grams": 150, "multiplier": 1.5}, {"name": "100g", "weight_grams": 100, "multiplier": 1}], "source": "manual"},
    {"name": "Avena", "category": "Cereales y Granos", "brand": None, "nutritional_info_per_100g": {"calories": 389, "protein": 17, "carbohydrates": 66, "fat": 7, "fiber": 11, "sugar": 1, "sodium": 2}, "portions": [{"name": "ración (40g)", "weight_grams": 40, "multiplier": 0.4}, {"name": "100g", "weight_grams": 100, "multiplier": 1}], "source": "manual"},
    
    # PANADERÍA
    {"name": "Pan integral", "category": "Panadería", "brand": None, "nutritional_info_per_100g": {"calories": 247, "protein": 13, "carbohydrates": 41, "fat": 3.4, "fiber": 6.9, "sugar": 6, "sodium": 400}, "portions": [{"name": "rebanada (30g)", "weight_grams": 30, "multiplier": 0.3}, {"name": "100g", "weight_grams": 100, "multiplier": 1}], "source": "manual"},
    {"name": "Pan blanco", "category": "Panadería", "brand": None, "nutritional_info_per_100g": {"calories": 265, "protein": 9, "carbohydrates": 49, "fat": 3.2, "fiber": 2.7, "sugar": 5, "sodium": 491}, "portions": [{"name": "rebanada (30g)", "weight_grams": 30, "multiplier": 0.3}, {"name": "100g", "weight_grams": 100, "multiplier": 1}], "source": "manual"},
    {"name": "Pan de molde", "category": "Panadería", "brand": None, "nutritional_info_per_100g": {"calories": 266, "protein": 7.6, "carbohydrates": 50, "fat": 3.3, "fiber": 2.3, "sugar": 5.3, "sodium": 550}, "portions": [{"name": "rebanada (25g)", "weight_grams": 25, "multiplier": 0.25}, {"name": "100g", "weight_grams": 100, "multiplier": 1}], "source": "manual"},
    {"name": "Galletas María", "category": "Panadería", "brand": None, "nutritional_info_per_100g": {"calories": 440, "protein": 6.5, "carbohydrates": 76, "fat": 11, "fiber": 2.5, "sugar": 21, "sodium": 340}, "portions": [{"name": "unidad (7g)", "weight_grams": 7, "multiplier": 0.07}, {"name": "100g", "weight_grams": 100, "multiplier": 1}], "source": "manual"},
    
    # HUEVOS
    {"name": "Huevo cocido", "category": "Huevos", "brand": None, "nutritional_info_per_100g": {"calories": 155, "protein": 13, "carbohydrates": 1.1, "fat": 11, "fiber": 0, "sugar": 1.1, "sodium": 124}, "portions": [{"name": "unidad (50g)", "weight_grams": 50, "multiplier": 0.5}, {"name": "100g", "weight_grams": 100, "multiplier": 1}], "source": "manual"},
    {"name": "Clara de huevo", "category": "Huevos", "brand": None, "nutritional_info_per_100g": {"calories": 52, "protein": 11, "carbohydrates": 0.7, "fat": 0.2, "fiber": 0, "sugar": 0.7, "sodium": 166}, "portions": [{"name": "unidad (33g)", "weight_grams": 33, "multiplier": 0.33}, {"name": "100g", "weight_grams": 100, "multiplier": 1}], "source": "manual"},
    
    # LEGUMBRES
    {"name": "Lentejas cocidas", "category": "Legumbres", "brand": None, "nutritional_info_per_100g": {"calories": 116, "protein": 9, "carbohydrates": 20, "fat": 0.4, "fiber": 7.9, "sugar": 1.8, "sodium": 2}, "portions": [{"name": "plato (200g)", "weight_grams": 200, "multiplier": 2}, {"name": "100g", "weight_grams": 100, "multiplier": 1}], "source": "manual"},
    {"name": "Garbanzos cocidos", "category": "Legumbres", "brand": None, "nutritional_info_per_100g": {"calories": 164, "protein": 8.9, "carbohydrates": 27, "fat": 2.6, "fiber": 7.6, "sugar": 4.8, "sodium": 7}, "portions": [{"name": "plato (200g)", "weight_grams": 200, "multiplier": 2}, {"name": "100g", "weight_grams": 100, "multiplier": 1}], "source": "manual"},
    {"name": "Judías blancas cocidas", "category": "Legumbres", "brand": None, "nutritional_info_per_100g": {"calories": 139, "protein": 9.7, "carbohydrates": 25, "fat": 0.5, "fiber": 6.3, "sugar": 0.3, "sodium": 2}, "portions": [{"name": "plato (200g)", "weight_grams": 200, "multiplier": 2}, {"name": "100g", "weight_grams": 100, "multiplier": 1}], "source": "manual"},
    
    # FRUTOS SECOS
    {"name": "Almendras", "category": "Frutos Secos", "brand": None, "nutritional_info_per_100g": {"calories": 579, "protein": 21, "carbohydrates": 22, "fat": 50, "fiber": 13, "sugar": 4.4, "sodium": 1}, "portions": [{"name": "puñado (28g)", "weight_grams": 28, "multiplier": 0.28}, {"name": "100g", "weight_grams": 100, "multiplier": 1}], "source": "manual"},
    {"name": "Nueces", "category": "Frutos Secos", "brand": None, "nutritional_info_per_100g": {"calories": 654, "protein": 15, "carbohydrates": 14, "fat": 65, "fiber": 6.7, "sugar": 2.6, "sodium": 2}, "portions": [{"name": "puñado (28g)", "weight_grams": 28, "multiplier": 0.28}, {"name": "100g", "weight_grams": 100, "multiplier": 1}], "source": "manual"},
    {"name": "Cacahuetes", "category": "Frutos Secos", "brand": None, "nutritional_info_per_100g": {"calories": 567, "protein": 26, "carbohydrates": 16, "fat": 49, "fiber": 8.5, "sugar": 4, "sodium": 18}, "portions": [{"name": "puñado (28g)", "weight_grams": 28, "multiplier": 0.28}, {"name": "100g", "weight_grams": 100, "multiplier": 1}], "source": "manual"},
    
    # BEBIDAS
    {"name": "Café solo", "category": "Bebidas", "brand": None, "nutritional_info_per_100g": {"calories": 2, "protein": 0.3, "carbohydrates": 0, "fat": 0, "fiber": 0, "sugar": 0, "sodium": 2}, "portions": [{"name": "taza (120ml)", "weight_grams": 120, "multiplier": 1.2}, {"name": "100ml", "weight_grams": 100, "multiplier": 1}], "source": "manual"},
    {"name": "Té verde", "category": "Bebidas", "brand": None, "nutritional_info_per_100g": {"calories": 1, "protein": 0, "carbohydrates": 0, "fat": 0, "fiber": 0, "sugar": 0, "sodium": 1}, "portions": [{"name": "taza (200ml)", "weight_grams": 200, "multiplier": 2}, {"name": "100ml", "weight_grams": 100, "multiplier": 1}], "source": "manual"},
    {"name": "Zumo de naranja natural", "category": "Bebidas", "brand": None, "nutritional_info_per_100g": {"calories": 45, "protein": 0.7, "carbohydrates": 10, "fat": 0.2, "fiber": 0.2, "sugar": 8.4, "sodium": 1}, "portions": [{"name": "vaso (250ml)", "weight_grams": 250, "multiplier": 2.5}, {"name": "100ml", "weight_grams": 100, "multiplier": 1}], "source": "manual"},
    
    # ACEITES Y GRASAS
    {"name": "Aceite de oliva", "category": "Aceites y Grasas", "brand": None, "nutritional_info_per_100g": {"calories": 884, "protein": 0, "carbohydrates": 0, "fat": 100, "fiber": 0, "sugar": 0, "sodium": 2}, "portions": [{"name": "cucharada (10ml)", "weight_grams": 10, "multiplier": 0.1}, {"name": "100ml", "weight_grams": 100, "multiplier": 1}], "source": "manual"},
    {"name": "Mantequilla", "category": "Aceites y Grasas", "brand": None, "nutritional_info_per_100g": {"calories": 717, "protein": 0.9, "carbohydrates": 0.1, "fat": 81, "fiber": 0, "sugar": 0.1, "sodium": 643}, "portions": [{"name": "porción (10g)", "weight_grams": 10, "multiplier": 0.1}, {"name": "100g", "weight_grams": 100, "multiplier": 1}], "source": "manual"},
]

def import_extended_foods():
    """Importar alimentos extendidos a MongoDB"""
    
    print("\n" + "="*70)
    print("🚀 IMPORTACIÓN DE ALIMENTOS DE MUESTRA EXTENDIDOS")
    print("="*70)
    
    # Eliminar alimentos antiguos de muestra (mantener los que ya existen)
    existing_count = foods_collection.count_documents({"source": "manual"})
    print(f"📊 Alimentos manuales existentes: {existing_count}")
    
    # Preguntar si quiere reemplazar
    if existing_count > 0:
        print(f"\n⚠️  Ya tienes {existing_count} alimentos manuales.")
        response = input("¿Deseas reemplazarlos con la nueva base extendida? (s/n): ").lower()
        if response != 's':
            print("❌ Operación cancelada")
            return 0
        
        # Eliminar alimentos manuales existentes
        deleted = foods_collection.delete_many({"source": "manual"})
        print(f"🗑️  Eliminados {deleted.deleted_count} alimentos manuales antiguos")
    
    # Añadir timestamps
    for food in EXTENDED_FOODS:
        food["created_at"] = datetime.now()
        food["updated_at"] = datetime.now()
    
    # Insertar alimentos
    result = foods_collection.insert_many(EXTENDED_FOODS)
    
    print("\n" + "="*70)
    print("✅ IMPORTACIÓN COMPLETADA")
    print("="*70)
    print(f"📊 Total productos importados: {len(result.inserted_ids)}")
    
    # Estadísticas por categoría
    categories = foods_collection.distinct('category', {"source": "manual"})
    print(f"\n📁 Categorías disponibles ({len(categories)}):")
    for cat in sorted(categories):
        count = foods_collection.count_documents({"category": cat, "source": "manual"})
        print(f"   • {cat}: {count} productos")
    
    # Estadísticas totales
    print(f"\n📚 Total en base de datos:")
    total = foods_collection.count_documents({})
    print(f"   • Total: {total} productos")
    
    print("\n🎉 Base de datos lista para usar!")
    print("="*70 + "\n")
    
    return len(result.inserted_ids)

if __name__ == "__main__":
    import_extended_foods()
