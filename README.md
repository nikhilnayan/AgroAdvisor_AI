# 🌿 AI-Based Crop Advisory System

An AI-powered agricultural advisory platform that provides **smart crop recommendations** and **plant disease detection** for farmers, backed by machine learning models and a modern web interface.

## 🏗️ Architecture

```
Capstone_project/
├── data/                          # Datasets
│   ├── raw/                       # Raw datasets
│   └── processed/                 # Cleaned, engineered datasets
├── models/                        # Trained ML models
├── scripts/                       # Data & ML scripts
│   ├── data_preprocessing.py      # Data cleaning pipeline
│   ├── feature_engineering.py     # Feature creation & train/test split
│   ├── train_crop_model.py        # Crop recommendation model training
│   ├── train_disease_model.py     # Disease detection model training
│   └── inference.py               # Inference functions
├── backend/                       # FastAPI REST API
│   ├── main.py                    # Server entrypoint
│   ├── routes.py                  # API endpoints
│   ├── model_inference.py         # Model loading & prediction
│   ├── database.py                # SQLite database models
│   └── requirements.txt           # Python dependencies
└── frontend/                      # Next.js web application
    └── src/
        ├── app/                   # Pages (Home, Crop, Disease, Dashboard)
        ├── components/            # Reusable UI components
        └── services/              # API client layer
```

## 🚀 Quick Start

### 1. Install Python Dependencies

```bash
pip install -r backend/requirements.txt
```

### 2. Run Data Pipeline

```bash
python scripts/data_preprocessing.py
python scripts/feature_engineering.py
```

### 3. Train Models

```bash
python scripts/train_crop_model.py
python scripts/train_disease_model.py --demo
```

### 4. Start Backend Server

```bash
cd backend
uvicorn main:app --reload --port 8000
```

### 5. Start Frontend

```bash
cd frontend
npm install
npm run dev
```

Visit **http://localhost:3000** for the web app and **http://localhost:8000/docs** for API documentation.

## 📡 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/predict-crop` | Crop recommendation based on soil/climate |
| POST | `/api/detect-disease` | Disease detection from leaf image |
| GET | `/api/weather?city=Mumbai` | Weather data (OpenWeatherMap) |
| GET | `/api/market-prices` | Crop market prices |
| GET | `/api/predictions` | Prediction history |

## 🤖 ML Models

- **Crop Recommendation**: Random Forest classifier trained on 22 crop classes with 7 soil/climate features + engineered features. Achieves 95%+ accuracy.
- **Disease Detection**: MobileNetV2 CNN with transfer learning for 15 plant disease classes from the PlantVillage dataset.

## ⚙️ Configuration

- **Weather Data**: Set `OPENWEATHERMAP_API_KEY` environment variable for live weather (free at [openweathermap.org](https://openweathermap.org/api))
- **Disease Model**: Run `python scripts/train_disease_model.py --train` with PlantVillage dataset for production accuracy

## 🛠️ Tech Stack

- **Backend**: Python, FastAPI, SQLAlchemy, SQLite
- **ML**: scikit-learn, TensorFlow/Keras, pandas, numpy
- **Frontend**: Next.js, TypeScript, Tailwind CSS, Axios
