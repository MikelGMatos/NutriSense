from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routes import foods
import os
from dotenv import load_dotenv
import uvicorn

load_dotenv()

# Crear aplicación FastAPI con documentación completa
app = FastAPI(
    title="NutriTrack Food Service API",
    description="""
    ## 🍎 API de Catálogo de Alimentos
    
    Esta API proporciona acceso completo al catálogo de alimentos de NutriTrack con información nutricional detallada.
    
    ### Características principales:
    * 🔍 **Búsqueda de alimentos** - Busca por nombre, marca o categoría
    * 📊 **Información nutricional** - Datos completos de macronutrientes
    * 🏷️ **Categorías** - Organización por tipo de alimento
    * 📏 **Porciones** - Diferentes tamaños y medidas
    * ➕ **Gestión de alimentos** - Crear y consultar alimentos
    
    ### Tecnologías:
    * MongoDB para almacenamiento de datos
    * FastAPI para la API REST
    * Datos importados desde Open Food Facts
    
    ### Base de datos:
    * **MongoDB** - Almacenamiento de catálogo de alimentos
    * **Colección**: `foods`
    * **Documentos**: ~500+ alimentos españoles
    """,
    version="1.0.0",
    contact={
        "name": "NutriTrack Team",
        "email": "info@nutritrack.com",
    },
    license_info={
        "name": "MIT License",
        "url": "https://opensource.org/licenses/MIT",
    },
    openapi_tags=[
        {
            "name": "foods",
            "description": "Operaciones relacionadas con alimentos y su información nutricional"
        },
        {
            "name": "health",
            "description": "Endpoints de monitoreo y estado del servicio"
        }
    ]
)

# Configurar CORS
origins = os.getenv("CORS_ORIGINS", "http://localhost:5173,http://localhost:3000").split(",")
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Health check
@app.get(
    "/health",
    tags=["health"],
    summary="Verificar estado del servicio",
    description="Endpoint para verificar que el servicio está funcionando correctamente",
    response_description="Estado del servicio y versión"
)
async def health():
    """
    ## Health Check
    
    Verifica que el servicio está funcionando correctamente.
    
    ### Respuesta:
    - **status**: Estado del servicio (ok/error)
    - **service**: Nombre del servicio
    - **version**: Versión actual del servicio
    """
    return {
        "status": "ok", 
        "service": "food-service",
        "version": "1.0.0"
    }

# Incluir rutas
app.include_router(foods.router)

# Documentación personalizada
@app.get(
    "/",
    tags=["health"],
    summary="Información de la API",
    description="Obtener información básica y enlaces de documentación",
    response_description="Información general de la API"
)
async def root():
    """
    ## Root Endpoint
    
    Proporciona información básica sobre la API y enlaces útiles.
    
    ### Respuesta:
    - **message**: Mensaje de bienvenida
    - **docs**: URL de la documentación Swagger
    - **health**: URL del health check
    - **version**: Versión de la API
    """
    return {
        "message": "NutriTrack Food Service API",
        "docs": "/docs",
        "health": "/health",
        "version": "1.0.0"
    }

if __name__ == "__main__":
    port = int(os.getenv("PORT", 8000))
    host = os.getenv("HOST", "0.0.0.0")
    
    print("\n" + "="*60)
    print("🚀 NUTRITRACK FOOD SERVICE (PYTHON)")
    print("="*60)
    print(f"🌐 URL: http://localhost:{port}")
    print(f"📚 Docs: http://localhost:{port}/docs")
    print(f"❤️  Health: http://localhost:{port}/health")
    print(f"🔍 Search: http://localhost:{port}/api/foods/search?q=pollo")
    print("="*60 + "\n")
    
    # ⭐ SOLUCIÓN: Usar string "main:app" en lugar del objeto app directamente
    # Esto permite que --reload funcione correctamente
    uvicorn.run(
        "main:app",           # ← String, no objeto
        host=host, 
        port=port, 
        reload=True           # ← Ahora sí funciona el reload
    )
