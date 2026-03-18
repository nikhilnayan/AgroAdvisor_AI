"""
Database Models & Connection
============================
Agent 3 — Backend/API

SQLite database with SQLAlchemy ORM for storing:
  - Crop prediction history
  - Disease detection logs
  - Advisory logs
"""

import os
from datetime import datetime
from sqlalchemy import create_engine, Column, Integer, Float, String, DateTime, Text, Boolean
from sqlalchemy.orm import declarative_base, sessionmaker
from pathlib import Path

# ── Database Setup ───────────────────────────────────────────────────────────
BASE_DIR = Path(__file__).resolve().parent.parent
DB_PATH = BASE_DIR / "data" / "advisory.db"
DB_URL = f"sqlite:///{DB_PATH}"

engine = create_engine(DB_URL, echo=False, connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()


# ── ORM Models ───────────────────────────────────────────────────────────────

class CropPrediction(Base):
    """Stores crop recommendation prediction history."""
    __tablename__ = "crop_predictions"

    id = Column(Integer, primary_key=True, autoincrement=True)
    timestamp = Column(DateTime, default=datetime.utcnow)
    nitrogen = Column(Float, nullable=False)
    phosphorus = Column(Float, nullable=False)
    potassium = Column(Float, nullable=False)
    temperature = Column(Float, nullable=False)
    humidity = Column(Float, nullable=False)
    ph = Column(Float, nullable=False)
    rainfall = Column(Float, nullable=False)
    recommended_crop = Column(String(100), nullable=False)
    confidence = Column(Float)
    top_3_crops = Column(Text)  # JSON string of top 3 results


class DiseaseDetection(Base):
    """Stores plant disease detection logs."""
    __tablename__ = "disease_detections"

    id = Column(Integer, primary_key=True, autoincrement=True)
    timestamp = Column(DateTime, default=datetime.utcnow)
    image_filename = Column(String(255))
    detected_disease = Column(String(200), nullable=False)
    confidence = Column(Float)
    treatment = Column(Text)
    is_healthy = Column(Boolean, default=False)


class AdvisoryLog(Base):
    """Stores advisory and activity logs."""
    __tablename__ = "advisory_logs"

    id = Column(Integer, primary_key=True, autoincrement=True)
    timestamp = Column(DateTime, default=datetime.utcnow)
    action_type = Column(String(50), nullable=False)  # crop_prediction, disease_detection, weather, market
    request_summary = Column(Text)
    response_summary = Column(Text)
    user_ip = Column(String(45))


# ── Database Helpers ─────────────────────────────────────────────────────────

def init_db():
    """Create all tables."""
    DB_PATH.parent.mkdir(parents=True, exist_ok=True)
    Base.metadata.create_all(bind=engine)


def get_db():
    """FastAPI dependency — yields a database session."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


# Initialize on import
init_db()
