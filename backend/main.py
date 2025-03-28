# filepath: d:\AI Business Agent\ai-agentic-product\backend\main.py
from fastapi import FastAPI, HTTPException, Depends, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import OAuth2PasswordBearer
from fastapi.responses import JSONResponse
from fastapi.middleware.gzip import GZipMiddleware
from pydantic_settings import BaseSettings
from typing import Optional
import uvicorn
from datetime import datetime, timedelta
from jose import JWTError, jwt
from passlib.context import CryptContext
import logging
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded
import redis
from functools import lru_cache

# Import routers
from erp.router import router as erp_router
from crm.router import router as crm_router
from marketing.router import router as marketing_router
from sales.router import router as sales_router
from support.router import router as support_router
from workflows.router import router as workflows_router

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

class Settings(BaseSettings):
    PROJECT_NAME: str = "AI Business Agent"
    VERSION: str = "1.0.0"
    API_V1_STR: str = "/api/v1"
    SECRET_KEY: str
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    DATABASE_URL: str
    MONGODB_URL: str
    REDIS_URL: str
    OPENAI_API_KEY: str
    PINECONE_API_KEY: str
    PINECONE_ENVIRONMENT: str
    RATE_LIMIT_PER_MINUTE: int = 60
    RATE_LIMIT_PER_HOUR: int = 1000
    CACHE_TTL: int = 3600
    CACHE_ENABLED: bool = True

    class Config:
        env_file = ".env"

settings = Settings()

# Initialize Redis for caching
redis_client = redis.from_url(settings.REDIS_URL)

# Initialize rate limiter
limiter = Limiter(key_func=get_remote_address)
limiter.exempt("/health")

# Security
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    openapi_url=f"{settings.API_V1_STR}/openapi.json"
)

# Add GZip compression
app.add_middleware(GZipMiddleware, minimum_size=1000)

# CORS middleware with proper configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # Configure appropriately for production
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["*"],
)

# Add rate limiting
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

# Include routers with rate limiting
app.include_router(erp_router, prefix=f"{settings.API_V1_STR}/erp", tags=["ERP"])
app.include_router(crm_router, prefix=f"{settings.API_V1_STR}/crm", tags=["CRM"])
app.include_router(marketing_router, prefix=f"{settings.API_V1_STR}/marketing", tags=["Marketing"])
app.include_router(sales_router, prefix=f"{settings.API_V1_STR}/sales", tags=["Sales"])
app.include_router(support_router, prefix=f"{settings.API_V1_STR}/support", tags=["Support"])
app.include_router(workflows_router, prefix=f"{settings.API_V1_STR}/workflows", tags=["Workflows"])

@app.get("/")
@limiter.limit(f"{settings.RATE_LIMIT_PER_MINUTE}/minute")
async def root(request: Request):
    return {
        "message": "Welcome to AI Business Agent API",
        "version": settings.VERSION,
        "docs_url": "/docs",
        "redoc_url": "/redoc"
    }

@app.get("/health")
async def health_check():
    try:
        # Check Redis connection
        redis_client.ping()
        return {
            "status": "healthy",
            "timestamp": datetime.utcnow().isoformat(),
            "services": {
                "redis": "up",
                "api": "up"
            }
        }
    except Exception as e:
        logger.error(f"Health check failed: {str(e)}")
        return JSONResponse(
            status_code=503,
            content={
                "status": "unhealthy",
                "error": str(e)
            }
        )

@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    logger.error(f"Global error: {str(exc)}")
    return JSONResponse(
        status_code=500,
        content={
            "error": "Internal server error",
            "message": str(exc)
        }
    )

if __name__ == "__main__":
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8000,
        reload=True,
        workers=4,  # Number of worker processes
        limit_concurrency=1000,  # Maximum number of concurrent connections
        backlog=2048,  # Maximum number of pending connections
        timeout_keep_alive=30  # Keep-alive timeout in seconds
    )
