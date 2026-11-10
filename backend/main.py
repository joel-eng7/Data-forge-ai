import os
import sys
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager

from backend.models.database import init_db
from backend.services.dataset_service import ensure_default_dataset
from backend.routes.auth import router as auth_router
from backend.routes.datasets import router as datasets_router
from backend.routes.quality import router as quality_router
from backend.routes.preprocess import router as preprocess_router
from backend.routes.feature_engineering import router as feature_router
from backend.routes.visualizations import router as viz_router
from backend.routes.pipeline import router as pipeline_router
from backend.routes.export import router as export_router

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Initialize SQLite database schema
    init_db()
    # Ensure default UCI Adult Census dataset is seeded
    try:
        ensure_default_dataset()
    except Exception as e:
        print(f"Warning: could not seed default dataset on startup: {e}")
    yield

app = FastAPI(
    title="DataForge AI Backend API",
    description="Production-grade AI Data Collection & Preprocessing Platform Engine",
    version="1.0.0",
    lifespan=lifespan
)

# CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register routes
app.include_router(auth_router)
app.include_router(datasets_router)
app.include_router(quality_router)
app.include_router(preprocess_router)
app.include_router(feature_router)
app.include_router(viz_router)
app.include_router(pipeline_router)
app.include_router(export_router)

@app.get("/api/health")
def health_check():
    return {
        "status": "healthy",
        "service": "DataForge AI Engine",
        "version": "1.0.0",
        "python_version": sys.version
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("backend.main:app", host="127.0.0.1", port=8000, reload=True)
