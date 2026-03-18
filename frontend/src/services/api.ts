import axios from "axios";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";

const api = axios.create({
  baseURL: API_BASE,
  timeout: 30000,
  headers: { "Content-Type": "application/json" },
});

// ── Crop Prediction ─────────────────────────────────────────────────────────

export interface CropInput {
  N: number;
  P: number;
  K: number;
  temperature: number;
  humidity: number;
  ph: number;
  rainfall: number;
}

export interface CropResult {
  crop: string;
  confidence: number;
}

export interface CropResponse {
  success: boolean;
  recommendations: CropResult[];
  message: string;
}

export async function predictCrop(data: CropInput): Promise<CropResponse> {
  const res = await api.post<CropResponse>("/predict-crop", data);
  return res.data;
}

export interface DiseaseDetail {
  name?: string;
  plant?: string;
  scientific_name?: string;
  pathogen_type?: string;
  severity?: string;
  description?: string;
  causes?: string[];
  symptoms?: string[];
  affected_plants?: string[];
  chemical_treatment?: string[];
  eco_friendly_treatment?: string[];
  nutritional_impact?: string;
  best_practices?: string[];
  prevention?: string[];
}

export interface DiseaseResponse {
  success: boolean;
  disease: string;
  disease_key: string;
  confidence: number;
  treatment: string;
  is_healthy: boolean;
  source?: string;
  model_type?: string;
  detail?: DiseaseDetail;
}

export async function detectDisease(file: File): Promise<DiseaseResponse> {
  const formData = new FormData();
  formData.append("file", file);
  const res = await api.post<DiseaseResponse>("/detect-disease", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return res.data;
}

// ── Weather ─────────────────────────────────────────────────────────────────

export interface WeatherData {
  city: string;
  temperature: number;
  humidity: number;
  pressure: number;
  description: string;
  wind_speed: number;
  icon: string;
  source: string;
  forecast?: {
    datetime: string;
    temperature: number;
    humidity: number;
    description: string;
  }[];
}

export async function getWeather(city: string = "Mumbai"): Promise<WeatherData> {
  const res = await api.get("/weather", { params: { city } });
  return res.data.data;
}

// ── Market Prices ───────────────────────────────────────────────────────────

export interface MarketPrice {
  crop: string;
  market: string;
  price_per_quintal: number;
  unit: string;
  trend: string;
  change: number;
}

export async function getMarketPrices(): Promise<MarketPrice[]> {
  const res = await api.get("/market-prices");
  return res.data.data;
}

// ── History ─────────────────────────────────────────────────────────────────

export async function getPredictionHistory(limit: number = 10) {
  const res = await api.get("/predictions", { params: { limit } });
  return res.data.data;
}

// ── Crop Info ───────────────────────────────────────────────────────────────

export interface CropInfo {
  name: string;
  scientific_name: string;
  family: string;
  category: string;
  description: string;
  growing_conditions: {
    temperature: { min: number; max: number; optimal: string; unit: string };
    rainfall: { min: number; max: number; unit: string };
    soil_ph: { min: number; max: number; optimal: string };
    altitude: string;
  };
  soil: { type: string; drainage: string; organic_matter: string; nutrients: string };
  water: { requirement: string; detail: string; critical_stages: string };
  cultivation: {
    season: string; sowing_months: string; harvesting_months: string;
    duration_days: { min: number; max: number }; method: string;
  };
  harvest: { indicator: string; yield_per_hectare: string };
  major_states: string[];
  common_diseases: string[];
  nutritional_value: {
    calories_per_100g: number | null; protein_g: number | null;
    carbohydrates_g: number | null; fiber_g: number | null;
  };
}

export async function getCropInfo(cropName: string): Promise<CropInfo> {
  const res = await api.get(`/crop-info/${encodeURIComponent(cropName)}`);
  return res.data.data;
}
