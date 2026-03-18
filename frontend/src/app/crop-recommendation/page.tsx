"use client";

import { useState } from "react";
import { predictCrop, CropInput, CropResult } from "../../services/api";
import { Sprout, Send, Trophy, CheckCircle, AlertTriangle, Thermometer, Droplets, FlaskConical, CloudRain, Atom, TestTubes, Beaker } from "lucide-react";

export default function CropRecommendationPage() {
  const [form, setForm] = useState<CropInput>({
    N: 90, P: 42, K: 43,
    temperature: 20.8, humidity: 82, ph: 6.5, rainfall: 202.9,
  });
  const [results, setResults] = useState<CropResult[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const fields: { key: keyof CropInput; label: string; unit: string; min: number; max: number; icon: typeof Sprout; step?: number }[] = [
    { key: "N", label: "Nitrogen (N)", unit: "kg/ha", min: 0, max: 200, icon: FlaskConical },
    { key: "P", label: "Phosphorus (P)", unit: "kg/ha", min: 0, max: 200, icon: TestTubes },
    { key: "K", label: "Potassium (K)", unit: "kg/ha", min: 0, max: 300, icon: Beaker },
    { key: "temperature", label: "Temperature", unit: "°C", min: -10, max: 55, icon: Thermometer },
    { key: "humidity", label: "Humidity", unit: "%", min: 0, max: 100, icon: Droplets },
    { key: "ph", label: "Soil pH", unit: "pH", min: 0, max: 14, icon: Atom, step: 0.1 },
    { key: "rainfall", label: "Rainfall", unit: "mm", min: 0, max: 600, icon: CloudRain },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setResults(null);
    try {
      const res = await predictCrop(form);
      setResults(res.recommendations);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to get recommendations. Is the backend running?";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-container">
      <div className="page-header animate-in">
        <h1 className="page-title">Crop Recommendation</h1>
        <p className="page-subtitle">
          Enter soil nutrient levels and climate conditions to receive AI-powered crop recommendations
        </p>
      </div>

      <div className="split-layout" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24, alignItems: "start" }}>
        {/* Input Form */}
        <form onSubmit={handleSubmit} className="card animate-in delay-1">
          <p className="section-label">Input Parameters</p>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
            {fields.map((field) => {
              const Icon = field.icon;
              return (
                <div key={field.key}>
                  <label className="input-label">
                    <span style={{ display: "inline-flex", alignItems: "center", gap: 4 }}>
                      <Icon size={11} color="#7a937a" />
                      {field.label}
                      <span style={{ fontWeight: 400, opacity: 0.6 }}>({field.unit})</span>
                    </span>
                  </label>
                  <input
                    type="number"
                    className="input-field"
                    value={form[field.key]}
                    min={field.min}
                    max={field.max}
                    step={field.step || 1}
                    onChange={(e) =>
                      setForm({ ...form, [field.key]: parseFloat(e.target.value) || 0 })
                    }
                    required
                  />
                </div>
              );
            })}
          </div>

          <button type="submit" className="btn-primary" disabled={loading} style={{ width: "100%", marginTop: 20 }}>
            {loading ? (
              <>
                <div className="loading-pulse" style={{ width: 14, height: 14, borderRadius: "50%", background: "#fff" }} />
                Analyzing...
              </>
            ) : (
              <>
                <Send size={15} />
                Get Recommendations
              </>
            )}
          </button>

          {error && (
            <div style={{
              marginTop: 14, padding: "10px 14px", background: "var(--red-light)",
              border: "1px solid #f5c6c0", borderRadius: "var(--radius-sm)",
              color: "var(--red)", fontSize: "0.84rem", display: "flex", alignItems: "center", gap: 8,
            }}>
              <AlertTriangle size={14} /> {error}
            </div>
          )}
        </form>

        {/* Results */}
        <div className="card animate-in delay-2">
          <p className="section-label">Results</p>

          {!results && !loading && (
            <div style={{ textAlign: "center", padding: "56px 0", color: "var(--text-muted)" }}>
              <Sprout size={36} style={{ marginBottom: 14, opacity: 0.25 }} />
              <p style={{ fontSize: "0.88rem" }}>Submit parameters to view crop recommendations</p>
            </div>
          )}

          {loading && (
            <div style={{ textAlign: "center", padding: "56px 0" }}>
              <div className="loading-pulse">
                <Sprout size={36} color="var(--accent)" style={{ marginBottom: 14 }} />
              </div>
              <p style={{ color: "var(--text-secondary)", fontSize: "0.88rem" }}>Analyzing soil and climate data...</p>
            </div>
          )}

          {results && (
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {results.map((r, i) => (
                <div
                  key={r.crop}
                  className="animate-in"
                  style={{
                    animationDelay: `${i * 0.1}s`,
                    padding: "16px 18px",
                    background: i === 0 ? "#e6f4e8" : "#f8faf6",
                    border: `1px solid ${i === 0 ? "#b7dbb9" : "#e2e8d8"}`,
                    borderRadius: "var(--radius-md)",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <div style={{
                        width: 32, height: 32, borderRadius: 8,
                        background: i === 0 ? "#d0ebd3" : "#eef3e8",
                        display: "flex", alignItems: "center", justifyContent: "center",
                      }}>
                        {i === 0 ? <Trophy size={15} color="#2e8b3c" /> : <CheckCircle size={15} color="#7a937a" />}
                      </div>
                      <div>
                        <div style={{ fontSize: "0.95rem", fontWeight: 600, textTransform: "capitalize" }}>{r.crop}</div>
                        <div style={{ fontSize: "0.72rem", color: "var(--text-muted)" }}>
                          {i === 0 ? "Top recommendation" : `Alternative #${i + 1}`}
                        </div>
                      </div>
                    </div>
                    <div style={{
                      fontSize: "1.1rem", fontWeight: 700, fontVariantNumeric: "tabular-nums",
                      color: r.confidence > 0.5 ? "#2e8b3c" : "#b8860b",
                    }}>
                      {(r.confidence * 100).toFixed(1)}%
                    </div>
                  </div>
                  <div className="confidence-bar">
                    <div className="confidence-fill" style={{ width: `${r.confidence * 100}%` }} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
