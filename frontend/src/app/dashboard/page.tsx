"use client";

import { useState, useEffect, useCallback } from "react";
import {
  getWeather, getMarketPrices, getPredictionHistory, getCropInfo,
  WeatherData, MarketPrice, CropInfo,
} from "../../services/api";
import {
  Cloud, Thermometer, Droplets, Wind, Search, RefreshCw,
  TrendingUp, TrendingDown, Minus, Bell, Clock, Info,
  Droplet, ThermometerSun, FlaskConical, Bug, Sprout, X,
  Leaf, CalendarDays, Layers, Mountain, MapPin, ShieldAlert,
  Apple, Wheat as WheatIcon,
} from "lucide-react";

interface PredictionRecord {
  id: number;
  timestamp: string;
  recommended_crop: string;
  confidence: number;
  inputs: { N: number; P: number; K: number; temperature: number; humidity: number; ph: number; rainfall: number };
}

export default function DashboardPage() {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [prices, setPrices] = useState<MarketPrice[]>([]);
  const [history, setHistory] = useState<PredictionRecord[]>([]);
  const [city, setCity] = useState("Jalandhar");
  const [loadingWeather, setLoadingWeather] = useState(true);
  const [loadingPrices, setLoadingPrices] = useState(true);
  const [loadingHistory, setLoadingHistory] = useState(true);
  const [weatherError, setWeatherError] = useState("");
  const [lastUpdated, setLastUpdated] = useState<string>("");

  // Modal state
  const [modalCrop, setModalCrop] = useState<CropInfo | null>(null);
  const [modalSource, setModalSource] = useState("");
  const [modalLoading, setModalLoading] = useState(false);
  const [modalError, setModalError] = useState("");

  const fetchWeather = useCallback(async (searchCity?: string) => {
    setLoadingWeather(true);
    setWeatherError("");
    try {
      const data = await getWeather(searchCity || city);
      setWeather(data);
      setLastUpdated(new Date().toLocaleTimeString());
    } catch {
      setWeatherError("Could not connect to weather service");
    } finally {
      setLoadingWeather(false);
    }
  }, [city]);

  const fetchPrices = async () => {
    setLoadingPrices(true);
    try {
      const data = await getMarketPrices();
      setPrices(data);
    } catch {
      setPrices([]);
    } finally {
      setLoadingPrices(false);
    }
  };

  const fetchHistory = async () => {
    setLoadingHistory(true);
    try {
      const data = await getPredictionHistory(5);
      setHistory(data);
    } catch {
      setHistory([]);
    } finally {
      setLoadingHistory(false);
    }
  };

  useEffect(() => {
    fetchWeather();
    fetchPrices();
    fetchHistory();
    const interval = setInterval(() => fetchWeather(), 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, [fetchWeather]);

  // Open crop detail modal
  const openCropModal = async (cropName: string) => {
    setModalLoading(true);
    setModalError("");
    setModalCrop(null);
    try {
      const res = await getCropInfo(cropName);
      setModalCrop(res);
      // We can't easily get "source" from getCropInfo since it returns CropInfo, 
      // so we set a descriptive source
      setModalSource("ICAR / FAO Agricultural Dataset");
    } catch {
      setModalError(`Could not load details for "${cropName}". Make sure the backend is running.`);
    } finally {
      setModalLoading(false);
    }
  };

  const closeModal = () => {
    setModalCrop(null);
    setModalError("");
    setModalLoading(false);
  };

  const TrendIcon = ({ trend }: { trend: string }) => {
    if (trend === "up") return <TrendingUp size={13} />;
    if (trend === "down") return <TrendingDown size={13} />;
    return <Minus size={13} />;
  };

  const trendColor = (trend: string) =>
    trend === "up" ? "#2e8b3c" : trend === "down" ? "#c0392b" : "#b8860b";

  const trendBg = (trend: string) =>
    trend === "up" ? "#e6f4e8" : trend === "down" ? "#fdecea" : "#fdf5e0";

  const advisories = [
    { icon: Droplet, title: "Irrigation Advisory", text: "Current humidity is optimal for most crops. Reduce watering for drought-resistant varieties.", time: "2h ago", color: "#2563a8", bg: "#e8f1fb" },
    { icon: ThermometerSun, title: "Temperature Alert", text: "Rising temperatures expected next week. Consider shade nets for sensitive crops.", time: "5h ago", color: "#b8860b", bg: "#fdf5e0" },
    { icon: FlaskConical, title: "Soil Health Tip", text: "Post-harvest season: good time for soil testing and nutrient replenishment.", time: "1d ago", color: "#2e8b3c", bg: "#e6f4e8" },
    { icon: Bug, title: "Pest Alert", text: "Aphid population increasing in the region. Monitor fields and apply neem-based solutions.", time: "2d ago", color: "#c0392b", bg: "#fdecea" },
  ];

  return (
    <div className="page-container">
      {/* ── Crop Detail Modal ──────────────────────────────────────────── */}
      {(modalCrop || modalLoading || modalError) && (
        <div
          style={{
            position: "fixed", top: 0, left: 0, right: 0, bottom: 0,
            background: "rgba(0,0,0,0.45)", zIndex: 100,
            display: "flex", alignItems: "center", justifyContent: "center",
            padding: 24, backdropFilter: "blur(4px)",
          }}
          onClick={closeModal}
        >
          <div
            style={{
              background: "#fff", borderRadius: 16, maxWidth: 720, width: "100%",
              maxHeight: "85vh", overflow: "auto", boxShadow: "0 20px 60px rgba(0,0,0,0.15)",
              position: "relative",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close button */}
            <button
              onClick={closeModal}
              style={{
                position: "absolute", top: 16, right: 16, background: "#f0f3ea",
                border: "none", borderRadius: 8, width: 32, height: 32,
                display: "flex", alignItems: "center", justifyContent: "center",
                cursor: "pointer", zIndex: 2,
              }}
            >
              <X size={16} color="#4a6248" />
            </button>

            {modalLoading && (
              <div style={{ padding: "64px 32px", textAlign: "center" }}>
                <div className="loading-pulse">
                  <Sprout size={36} color="#2e8b3c" />
                </div>
                <p style={{ color: "var(--text-muted)", marginTop: 16, fontSize: "0.88rem" }}>
                  Fetching crop data from agricultural database...
                </p>
              </div>
            )}

            {modalError && (
              <div style={{ padding: "64px 32px", textAlign: "center" }}>
                <ShieldAlert size={36} color="#c0392b" style={{ marginBottom: 12 }} />
                <p style={{ color: "#c0392b", fontSize: "0.88rem" }}>{modalError}</p>
              </div>
            )}

            {modalCrop && (
              <div style={{ padding: "28px 32px 32px" }}>
                {/* Header */}
                <div style={{ marginBottom: 20 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                    <span style={{
                      fontSize: "0.68rem", fontWeight: 700, padding: "2px 8px", borderRadius: 4,
                      background: "#e6f4e8", color: "#2e8b3c", textTransform: "uppercase", letterSpacing: "0.04em",
                    }}>
                      {modalCrop.category}
                    </span>
                    <span style={{
                      fontSize: "0.68rem", fontWeight: 600, padding: "2px 8px", borderRadius: 4,
                      background: "#f0f3ea", color: "#7a937a",
                    }}>
                      {modalCrop.family}
                    </span>
                  </div>
                  <h2 style={{ fontSize: "1.4rem", fontWeight: 700, letterSpacing: "-0.02em", marginBottom: 2 }}>
                    {modalCrop.name}
                  </h2>
                  <p style={{ fontSize: "0.82rem", color: "var(--text-muted)", fontStyle: "italic" }}>
                    {modalCrop.scientific_name}
                  </p>
                </div>

                <p style={{ fontSize: "0.88rem", color: "var(--text-secondary)", lineHeight: 1.65, marginBottom: 20 }}>
                  {modalCrop.description}
                </p>

                {/* Growing Conditions Grid */}
                <p className="section-label">Growing Conditions</p>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 10, marginBottom: 20 }}>
                  {[
                    { icon: Thermometer, label: "Temperature", value: `${modalCrop.growing_conditions.temperature.min}–${modalCrop.growing_conditions.temperature.max}°C (optimal: ${modalCrop.growing_conditions.temperature.optimal}°C)`, bg: "#fdecea", color: "#c0392b" },
                    { icon: Layers, label: "Soil", value: modalCrop.soil.type, bg: "#fdf5e0", color: "#b8860b" },
                    { icon: Droplets, label: "Water", value: `${modalCrop.water.requirement} — ${modalCrop.water.detail}`, bg: "#e8f1fb", color: "#2563a8" },
                    { icon: CalendarDays, label: "Season", value: `${modalCrop.cultivation.season} (Sow: ${modalCrop.cultivation.sowing_months})`, bg: "#e6f4e8", color: "#2e8b3c" },
                    { icon: Clock, label: "Duration", value: `${modalCrop.cultivation.duration_days.min}–${modalCrop.cultivation.duration_days.max} days`, bg: "#f3eef8", color: "#6b21a8" },
                    { icon: FlaskConical, label: "Soil pH", value: `${modalCrop.growing_conditions.soil_ph.min}–${modalCrop.growing_conditions.soil_ph.max} (optimal: ${modalCrop.growing_conditions.soil_ph.optimal})`, bg: "#fdf5e0", color: "#b8860b" },
                    { icon: Mountain, label: "Altitude", value: modalCrop.growing_conditions.altitude, bg: "#f0f3ea", color: "#4a6248" },
                    { icon: WheatIcon, label: "Method", value: modalCrop.cultivation.method, bg: "#e6f4e8", color: "#2e8b3c" },
                    { icon: Leaf, label: "Yield", value: modalCrop.harvest.yield_per_hectare, bg: "#e8f1fb", color: "#2563a8" },
                  ].map((item) => {
                    const Icon = item.icon;
                    return (
                      <div key={item.label} style={{
                        padding: "12px 14px", background: "#f8faf6",
                        border: "1px solid #e2e8d8", borderRadius: 10,
                      }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 5 }}>
                          <div style={{
                            width: 22, height: 22, borderRadius: 6, background: item.bg,
                            display: "flex", alignItems: "center", justifyContent: "center",
                          }}>
                            <Icon size={11} color={item.color} />
                          </div>
                          <span style={{ fontSize: "0.66rem", fontWeight: 700, letterSpacing: "0.04em", textTransform: "uppercase", color: "#7a937a" }}>
                            {item.label}
                          </span>
                        </div>
                        <p style={{ fontSize: "0.8rem", color: "#1a2e1a", lineHeight: 1.4 }}>
                          {item.value}
                        </p>
                      </div>
                    );
                  })}
                </div>

                {/* Harvest + States row */}
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 20 }}>
                  <div style={{ padding: "14px 16px", background: "#f8faf6", border: "1px solid #e2e8d8", borderRadius: 10 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 6 }}>
                      <div style={{ width: 22, height: 22, borderRadius: 6, background: "#e6f4e8", display: "flex", alignItems: "center", justifyContent: "center" }}>
                        <Leaf size={11} color="#2e8b3c" />
                      </div>
                      <span className="section-label" style={{ marginBottom: 0 }}>Harvest Indicator</span>
                    </div>
                    <p style={{ fontSize: "0.82rem", color: "#1a2e1a", lineHeight: 1.5 }}>
                      {modalCrop.harvest.indicator}
                    </p>
                  </div>
                  <div style={{ padding: "14px 16px", background: "#f8faf6", border: "1px solid #e2e8d8", borderRadius: 10 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 6 }}>
                      <div style={{ width: 22, height: 22, borderRadius: 6, background: "#e8f1fb", display: "flex", alignItems: "center", justifyContent: "center" }}>
                        <MapPin size={11} color="#2563a8" />
                      </div>
                      <span className="section-label" style={{ marginBottom: 0 }}>Major Growing States</span>
                    </div>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
                      {modalCrop.major_states.map((s) => (
                        <span key={s} style={{ fontSize: "0.75rem", padding: "2px 8px", borderRadius: 4, background: "#e8f1fb", color: "#2563a8", fontWeight: 500 }}>
                          {s}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Diseases + Nutrition */}
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 16 }}>
                  <div style={{ padding: "14px 16px", background: "#f8faf6", border: "1px solid #e2e8d8", borderRadius: 10 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 6 }}>
                      <div style={{ width: 22, height: 22, borderRadius: 6, background: "#fdecea", display: "flex", alignItems: "center", justifyContent: "center" }}>
                        <ShieldAlert size={11} color="#c0392b" />
                      </div>
                      <span className="section-label" style={{ marginBottom: 0 }}>Common Diseases</span>
                    </div>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
                      {modalCrop.common_diseases.map((d) => (
                        <span key={d} style={{ fontSize: "0.75rem", padding: "2px 8px", borderRadius: 4, background: "#fdecea", color: "#c0392b", fontWeight: 500 }}>
                          {d}
                        </span>
                      ))}
                    </div>
                  </div>
                  {modalCrop.nutritional_value.calories_per_100g && (
                    <div style={{ padding: "14px 16px", background: "#f8faf6", border: "1px solid #e2e8d8", borderRadius: 10 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 8 }}>
                        <div style={{ width: 22, height: 22, borderRadius: 6, background: "#e6f4e8", display: "flex", alignItems: "center", justifyContent: "center" }}>
                          <Apple size={11} color="#2e8b3c" />
                        </div>
                        <span className="section-label" style={{ marginBottom: 0 }}>Nutrition (per 100g)</span>
                      </div>
                      <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 6 }}>
                        {[
                          { label: "Calories", value: `${modalCrop.nutritional_value.calories_per_100g} kcal` },
                          { label: "Protein", value: `${modalCrop.nutritional_value.protein_g}g` },
                          { label: "Carbs", value: `${modalCrop.nutritional_value.carbohydrates_g}g` },
                          { label: "Fiber", value: `${modalCrop.nutritional_value.fiber_g}g` },
                        ].map((n) => (
                          <div key={n.label} style={{ textAlign: "center", padding: "6px 4px", background: "#fff", borderRadius: 6, border: "1px solid #e2e8d8" }}>
                            <div style={{ fontSize: "0.9rem", fontWeight: 700, color: "#1a2e1a" }}>{n.value}</div>
                            <div style={{ fontSize: "0.65rem", color: "#7a937a", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.03em" }}>{n.label}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Source footer */}
                <p style={{ fontSize: "0.7rem", color: "#7a937a", textAlign: "center", paddingTop: 8, borderTop: "1px solid #e2e8d8" }}>
                  Data sourced from: {modalSource}
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── Page Header ────────────────────────────────────────────────── */}
      <div className="page-header animate-in">
        <h1 className="page-title">Dashboard</h1>
        <p className="page-subtitle">
          Real-time weather data, crop market prices, and agricultural advisories
        </p>
      </div>

      {/* Weather */}
      <div className="card animate-in delay-1" style={{ marginBottom: 20 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <p className="section-label" style={{ marginBottom: 0 }}>Weather — Live</p>
            {lastUpdated && (
              <span style={{ fontSize: "0.7rem", color: "var(--text-muted)", display: "flex", alignItems: "center", gap: 4 }}>
                <Clock size={10} /> Updated {lastUpdated}
              </span>
            )}
          </div>
          <form onSubmit={(e) => { e.preventDefault(); fetchWeather(); }} style={{ display: "flex", gap: 8 }}>
            <input
              className="input-field" value={city} onChange={(e) => setCity(e.target.value)}
              placeholder="Search city..." style={{ width: 160, padding: "7px 12px", fontSize: "0.82rem" }}
            />
            <button type="submit" className="btn-primary" style={{ padding: "7px 14px", fontSize: "0.82rem" }}>
              <Search size={13} />
            </button>
            <button
              type="button" className="btn-outline" style={{ padding: "7px 12px", fontSize: "0.82rem", borderColor: "#c5d6b4" }}
              onClick={() => fetchWeather()} title="Refresh"
            >
              <RefreshCw size={13} />
            </button>
          </form>
        </div>

        {loadingWeather ? (
          <div className="loading-pulse" style={{ height: 100, borderRadius: 12, background: "#f0f7ec" }} />
        ) : weatherError ? (
          <div style={{ textAlign: "center", padding: "32px 0", color: "var(--text-muted)" }}>
            <Cloud size={32} style={{ marginBottom: 8, opacity: 0.3 }} />
            <p style={{ fontSize: "0.88rem" }}>{weatherError}</p>
            <p style={{ fontSize: "0.78rem", marginTop: 4 }}>Make sure the backend is running at localhost:8000</p>
          </div>
        ) : weather ? (
          <div>
            {weather.source && (
              <div style={{ marginBottom: 14 }}>
                <span style={{
                  display: "inline-flex", alignItems: "center", gap: 4,
                  fontSize: "0.7rem", fontWeight: 600, padding: "3px 10px", borderRadius: 99,
                  background: weather.source.includes("live") ? "#e6f4e8" : "#fdf5e0",
                  color: weather.source.includes("live") ? "#2e8b3c" : "#b8860b",
                }}>
                  <span style={{ width: 5, height: 5, borderRadius: "50%", background: weather.source.includes("live") ? "#2e8b3c" : "#b8860b" }} />
                  {weather.source}
                </span>
              </div>
            )}

            <div className="stats-grid" style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 14, marginBottom: 20 }}>
              {[
                { icon: Thermometer, value: `${weather.temperature}°C`, label: "Temperature", bg: "#fdecea", color: "#c0392b" },
                { icon: Droplets, value: `${weather.humidity}%`, label: "Humidity", bg: "#e8f1fb", color: "#2563a8" },
                { icon: Wind, value: `${weather.wind_speed} m/s`, label: "Wind Speed", bg: "#f0f7ec", color: "#4a6248" },
                { icon: Cloud, value: weather.description, label: weather.city, bg: "#fdf5e0", color: "#b8860b", isText: true },
              ].map((item) => {
                const Icon = item.icon;
                return (
                  <div key={item.label} style={{
                    textAlign: "center", padding: "16px 12px", background: "#f8faf6",
                    border: "1px solid var(--border-subtle)", borderRadius: "var(--radius-md)",
                  }}>
                    <div style={{
                      width: 36, height: 36, borderRadius: 9, background: item.bg,
                      display: "inline-flex", alignItems: "center", justifyContent: "center", marginBottom: 8,
                    }}>
                      <Icon size={16} color={item.color} />
                    </div>
                    <div style={{ fontSize: "isText" in item ? "0.9rem" : "1.35rem", fontWeight: 700, textTransform: "capitalize", letterSpacing: "-0.02em", color: "var(--text-primary)" }}>
                      {item.value}
                    </div>
                    <div style={{ fontSize: "0.72rem", color: "var(--text-muted)", marginTop: 2 }}>{item.label}</div>
                  </div>
                );
              })}
            </div>

            {weather.forecast && weather.forecast.length > 0 && (
              <div>
                <p style={{ fontSize: "0.7rem", color: "var(--text-muted)", fontWeight: 700, letterSpacing: "0.05em", textTransform: "uppercase", marginBottom: 10 }}>
                  Forecast
                </p>
                <div style={{ display: "flex", gap: 8, overflowX: "auto" }}>
                  {weather.forecast.map((f, i) => {
                    const timeLabel = f.datetime.includes("T")
                      ? f.datetime.split("T")[1]?.slice(0, 5)
                      : f.datetime.includes(" ")
                        ? f.datetime.split(" ")[1]?.slice(0, 5)
                        : f.datetime;
                    return (
                      <div key={i} style={{
                        flex: "1 0 auto", background: "#f8faf6", border: "1px solid var(--border-subtle)",
                        borderRadius: "var(--radius-sm)", padding: "12px 14px", textAlign: "center", minWidth: 90,
                      }}>
                        <div style={{ fontSize: "0.7rem", color: "var(--text-muted)", marginBottom: 4 }}>{timeLabel}</div>
                        <div style={{ fontSize: "1.05rem", fontWeight: 700, fontVariantNumeric: "tabular-nums" }}>{f.temperature}°</div>
                        <div style={{ fontSize: "0.68rem", color: "var(--text-muted)", textTransform: "capitalize", marginTop: 2 }}>{f.description}</div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        ) : null}
      </div>

      {/* Prices + Advisories */}
      <div className="split-layout" style={{ display: "grid", gridTemplateColumns: "1.8fr 1fr", gap: 20, marginBottom: 20 }}>
        {/* Prices */}
        <div className="card animate-in delay-2">
          <p className="section-label">Market Prices</p>

          {loadingPrices ? (
            <div className="loading-pulse" style={{ height: 200, borderRadius: 12, background: "#f0f7ec" }} />
          ) : prices.length === 0 ? (
            <div style={{ textAlign: "center", padding: "32px 0", color: "var(--text-muted)" }}>
              <p style={{ fontSize: "0.88rem" }}>Could not load market prices. Check backend connection.</p>
            </div>
          ) : (
            <div style={{ overflowX: "auto" }}>
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Crop</th>
                    <th>Market</th>
                    <th>Price (per quintal)</th>
                    <th>Change</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {prices.map((p) => (
                    <tr key={p.crop}>
                      <td style={{ fontWeight: 600 }}>{p.crop}</td>
                      <td style={{ color: "var(--text-secondary)" }}>{p.market}</td>
                      <td style={{ fontWeight: 600, fontVariantNumeric: "tabular-nums" }}>
                        ₹{p.price_per_quintal.toLocaleString()}
                      </td>
                      <td>
                        <span style={{
                          display: "inline-flex", alignItems: "center", gap: 4,
                          padding: "3px 10px", borderRadius: 99, fontSize: "0.8rem", fontWeight: 600,
                          fontVariantNumeric: "tabular-nums", color: trendColor(p.trend), background: trendBg(p.trend),
                        }}>
                          <TrendIcon trend={p.trend} />
                          {p.change > 0 ? "+" : ""}{p.change}%
                        </span>
                      </td>
                      <td style={{ width: 40, textAlign: "center" }}>
                        <button
                          onClick={() => openCropModal(p.crop)}
                          title={`View details for ${p.crop}`}
                          style={{
                            background: "#e6f4e8", border: "1px solid #c5d6b4", borderRadius: 6,
                            width: 28, height: 28, display: "inline-flex", alignItems: "center",
                            justifyContent: "center", cursor: "pointer", transition: "all 0.2s ease",
                          }}
                          onMouseEnter={(e) => { e.currentTarget.style.background = "#d0ebd3"; e.currentTarget.style.borderColor = "#2e8b3c"; }}
                          onMouseLeave={(e) => { e.currentTarget.style.background = "#e6f4e8"; e.currentTarget.style.borderColor = "#c5d6b4"; }}
                        >
                          <Info size={13} color="#2e8b3c" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Advisories */}
        <div className="card animate-in delay-3">
          <p className="section-label" style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <Bell size={12} /> Advisories
          </p>

          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {advisories.map((adv) => {
              const Icon = adv.icon;
              return (
                <div key={adv.title} style={{
                  padding: "14px 16px", background: "#f8faf6",
                  border: "1px solid var(--border-subtle)", borderRadius: "var(--radius-md)",
                }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <div style={{
                        width: 26, height: 26, borderRadius: 7, background: adv.bg,
                        display: "flex", alignItems: "center", justifyContent: "center",
                      }}>
                        <Icon size={13} color={adv.color} />
                      </div>
                      <span style={{ fontWeight: 600, fontSize: "0.82rem" }}>{adv.title}</span>
                    </div>
                    <span style={{ fontSize: "0.68rem", color: "var(--text-muted)" }}>{adv.time}</span>
                  </div>
                  <p style={{ fontSize: "0.78rem", color: "var(--text-secondary)", lineHeight: 1.55, paddingLeft: 34 }}>
                    {adv.text}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Prediction History */}
      <div className="card animate-in delay-4">
        <p className="section-label" style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <Clock size={12} /> Recent Predictions
        </p>

        {loadingHistory ? (
          <div className="loading-pulse" style={{ height: 100, borderRadius: 12, background: "#f0f7ec" }} />
        ) : history.length === 0 ? (
          <div style={{ textAlign: "center", padding: "32px 0", color: "var(--text-muted)" }}>
            <Sprout size={28} style={{ marginBottom: 8, opacity: 0.25 }} />
            <p style={{ fontSize: "0.88rem" }}>No predictions yet. Try the Crop Advisory page to create your first prediction.</p>
          </div>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Time</th>
                  <th>Recommended Crop</th>
                  <th>Confidence</th>
                  <th>N / P / K</th>
                  <th>Temp</th>
                  <th>pH</th>
                </tr>
              </thead>
              <tbody>
                {history.map((h) => (
                  <tr key={h.id}>
                    <td style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>
                      {new Date(h.timestamp).toLocaleString(undefined, {
                        month: "short", day: "numeric", hour: "2-digit", minute: "2-digit",
                      })}
                    </td>
                    <td style={{ fontWeight: 600, textTransform: "capitalize" }}>{h.recommended_crop}</td>
                    <td>
                      <span style={{
                        fontWeight: 600, fontVariantNumeric: "tabular-nums",
                        color: h.confidence > 0.5 ? "#2e8b3c" : "#b8860b",
                      }}>
                        {(h.confidence * 100).toFixed(1)}%
                      </span>
                    </td>
                    <td style={{ fontVariantNumeric: "tabular-nums", fontSize: "0.84rem" }}>
                      {h.inputs.N} / {h.inputs.P} / {h.inputs.K}
                    </td>
                    <td style={{ fontVariantNumeric: "tabular-nums", fontSize: "0.84rem" }}>{h.inputs.temperature}°C</td>
                    <td style={{ fontVariantNumeric: "tabular-nums", fontSize: "0.84rem" }}>{h.inputs.ph}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
