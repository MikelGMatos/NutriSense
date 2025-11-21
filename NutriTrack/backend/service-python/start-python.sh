#!/bin/sh
# ============================================================
# Script de inicio para Backend Python - NutriTrack
# ============================================================

set -e  # Salir si cualquier comando falla

echo "======================================================"
echo "🚀 Iniciando Backend Python - NutriTrack"
echo "======================================================"
echo ""

# Esperar a MongoDB
echo "⏳ Esperando a MongoDB..."
while ! python -c "from pymongo import MongoClient; MongoClient('mongodb://mongodb:27017', serverSelectionTimeoutMS=2000).server_info()" 2>/dev/null; do
    echo "   MongoDB no disponible, reintentando en 2 segundos..."
    sleep 2
done
echo "✅ MongoDB disponible"
echo ""

# Verificar que el archivo existe
if [ -f "/app/etl/import_from_openfoodfacts.py" ]; then
    echo "✅ Archivo import_from_openfoodfacts.py encontrado"
    echo ""
    echo "🌐 Importando alimentos de Open Food Facts (España)..."
    echo "   (Esto puede tardar 2-3 minutos...)"
    echo ""
    
    # Ejecutar el script de importación
    python /app/etl/import_from_openfoodfacts.py
    
    echo ""
    echo "✅ Importación completada"
else
    echo "❌ ERROR: No se encontró /app/etl/import_from_openfoodfacts.py"
    echo "📂 Archivos disponibles en /app/etl:"
    ls -la /app/etl/
    echo ""
    echo "⚠️  Continuando sin importar alimentos..."
fi

echo ""
echo "======================================================"
echo "🚀 Iniciando servidor Uvicorn en puerto 8000"
echo "======================================================"
echo ""

# Iniciar el servidor
exec uvicorn main:app --host 0.0.0.0 --port 8000 --reload
