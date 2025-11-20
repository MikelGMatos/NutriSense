#!/bin/bash
# ============================================================
# SCRIPT DE INICIALIZACIÓN - Backend Python
# ============================================================
# Este script se ejecuta al iniciar el contenedor y:
# 1. Importa los 54 alimentos manuales (siempre)
# 2. Importa los 500+ alimentos de Open Food Facts 
# 3. Inicia el servidor Uvicorn

echo "=================================================="
echo "🚀 Iniciando Backend Python - NutriTrack"
echo "=================================================="

# Esperar a que MongoDB esté disponible
echo "⏳ Esperando a MongoDB..."
while ! python -c "from pymongo import MongoClient; MongoClient('mongodb://mongodb:27017').server_info()" 2>/dev/null; do
    echo "   MongoDB no disponible, reintentando en 2 segundos..."
    sleep 2
done
echo "✅ MongoDB disponible"

# Importar alimentos manuales
echo ""
echo "📦 Importando alimentos manuales..."
python etl/import_sample_foods.py
echo "✅ Alimentos manuales importados"

# Importar alimentos de Open Food Facts 
 Descomenta la siguiente línea para importar automáticamente
 echo ""
 echo "🌐 Importando alimentos de Open Food Facts..."
 python etl/import_from_openfoodfacts.py || echo "⚠️  No se pudieron importar alimentos de Open Food Facts (continuando...)"
 echo "✅ Alimentos de Open Food Facts importados"

# Iniciar servidor
echo ""
echo "=================================================="
echo "🚀 Iniciando servidor Uvicorn en puerto 8000"
echo "=================================================="
exec uvicorn main:app --host 0.0.0.0 --port 8000 --reload
