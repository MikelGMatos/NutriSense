from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routes import foods
import os
from dotenv import load_dotenv
import uvicorn

load_dotenv()

# Crear aplicación FastAPI
app = FastAPI(
    title="NutriTrack Food Service",
    description="API de catálogo de alimentos con información nutricional",
    version="1.0.0"
)

# Configurar CORS
origins = os.getenv("CORS_ORIGINS", "http://localhost:5173").split(",")
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Health check
@app.get("/health")
async def health():
    return {"status": "ok", "service": "food-service"}

# Incluir rutas
app.include_router(foods.router)

# Documentación personalizada
@app.get("/")
async def root():
    return {
        "message": "NutriTrack Food Service API",
        "docs": "/docs",
        "health": "/health"
    }

if __name__ == "__main__":
    port = int(os.getenv("PORT", 8000))
    host = os.getenv("HOST", "0.0.0.0")
    
    print("\n" + "="*60)
    print("🚀 NUTRITRACK FOOD SERVICE (PYTHON)")
    print("="*60)
    print(f"📚 Docs: http://localhost:{port}/docs")
    print(f"❤️  Health: http://localhost:{port}/health")
    print("="*60 + "\n")
    
    uvicorn.run(app, host=host, port=port, reload=True)