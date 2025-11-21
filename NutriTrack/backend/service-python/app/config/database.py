from pymongo import MongoClient
from motor.motor_asyncio import AsyncIOMotorClient
import os
from dotenv import load_dotenv

load_dotenv()

# Configuración de MongoDB
MONGO_URI = os.getenv('MONGO_URI', 'mongodb://localhost:27017')
MONGO_DB = os.getenv('MONGO_DB', 'nutrition_db')

# Cliente síncrono para ETL
sync_client = MongoClient(MONGO_URI)
sync_db = sync_client[MONGO_DB]
foods_collection = sync_db['foods']

# Cliente asíncrono para API
async_client = AsyncIOMotorClient(MONGO_URI)
async_db = async_client[MONGO_DB]
async_foods_collection = async_db['foods']

def get_database():
    return sync_db

def get_async_database():
    return async_db