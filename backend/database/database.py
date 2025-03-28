from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from pymongo import MongoClient
from ..main import settings

# PostgreSQL Configuration
SQLALCHEMY_DATABASE_URL = settings.DATABASE_URL

engine = create_engine(SQLALCHEMY_DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# MongoDB Configuration
mongo_client = MongoClient(settings.MONGODB_URL)
mongodb = mongo_client.ai_business_agent

# Dependency to get DB session
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# MongoDB collections
ai_interactions = mongodb.ai_interactions
content_generation = mongodb.content_generation
analytics_data = mongodb.analytics_data
vector_embeddings = mongodb.vector_embeddings

# Initialize database tables
from .models import Base
Base.metadata.create_all(bind=engine) 