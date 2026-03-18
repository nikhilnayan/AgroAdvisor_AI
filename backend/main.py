"""
FastAPI Application — Main Entry Point
=======================================
Agent 3 — Backend/API

AI-Based Crop Advisory System backend server.

Run with:
    cd backend
    uvicorn main:app --reload --port 8000
"""

import os
import sys
from pathlib import Path
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

# Add project root to path
BASE_DIR = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(BASE_DIR))

from routes import router

# ── App Configuration ────────────────────────────────────────────────────────

app = FastAPI(
    title="🌾 AI Crop Advisory System",
    description="""
    An AI-powered agricultural advisory system that provides:

    - **Crop Recommendations** based on soil nutrients and climate conditions
    - **Plant Disease Detection** from leaf images using deep learning
    - **Weather Data** from OpenWeatherMap API
    - **Market Prices** for major crops

    Built for farmers to make data-driven agricultural decisions.
    """,
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
)

# ── CORS ─────────────────────────────────────────────────────────────────────
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, restrict to frontend domain
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Routes ───────────────────────────────────────────────────────────────────
app.include_router(router, prefix="/api")


# ── Root Endpoint ────────────────────────────────────────────────────────────

@app.get("/", tags=["Health"])
async def root():
    """Health check endpoint."""
    return {
        "status": "online",
        "service": "AI Crop Advisory System",
        "version": "1.0.0",
        "endpoints": {
            "docs": "/docs",
            "predict_crop": "/api/predict-crop",
            "detect_disease": "/api/detect-disease",
            "weather": "/api/weather",
            "market_prices": "/api/market-prices",
            "predictions": "/api/predictions",
        },
    }


@app.get("/health", tags=["Health"])
async def health_check():
    """Detailed health check."""
    models_dir = BASE_DIR / "models"
    crop_model = models_dir / "crop_recommendation_model.pkl"
    disease_model = models_dir / "plant_disease_model.h5"
    disease_classes = models_dir / "disease_classes.json"

    return {
        "status": "healthy",
        "models": {
            "crop_recommendation": {
                "available": crop_model.exists(),
                "path": str(crop_model),
            },
            "disease_detection": {
                "model_available": disease_model.exists(),
                "classes_available": disease_classes.exists(),
            },
        },
    }


# ── Startup Event ────────────────────────────────────────────────────────────

@app.on_event("startup")
async def startup():
    """Pre-load models on server start."""
    print("\n" + "=" * 50)
    print("🌾 AI Crop Advisory System — Starting")
    print("=" * 50)

    # Try to pre-load crop model
    try:
        from model_inference import load_crop_model
        load_crop_model()
        print("✅ Crop recommendation model loaded")
    except FileNotFoundError:
        print("⚠️  Crop model not found — run train_crop_model.py")
    except Exception as e:
        print(f"⚠️  Crop model load error: {e}")

    # Try to pre-load disease model
    try:
        from model_inference import load_disease_model
        load_disease_model()
        print("✅ Disease detection model loaded")
    except FileNotFoundError:
        print("⚠️  Disease model not found — run train_disease_model.py")
    except Exception as e:
        print(f"⚠️  Disease model load error: {e}")

    print("=" * 50)
    print("🚀 Server ready at http://localhost:8000")
    print("📖 API docs at http://localhost:8000/docs")
    print("=" * 50 + "\n")
