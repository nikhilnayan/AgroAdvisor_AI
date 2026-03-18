"use client";

import { useState, useRef, useCallback } from "react";
import { detectDisease, DiseaseResponse } from "../../services/api";
import {
  Upload, Search, Shield, ShieldAlert, AlertTriangle, ImageIcon,
  Activity, Pill, Bug, Leaf, Droplets, ThermometerSun,
  CheckCircle, X, Sprout, Microscope, FlaskConical, Apple,
  Layers, BookOpen, ShieldCheck,
} from "lucide-react";

export default function DiseaseDetectionPage() {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string>("");
  const [result, setResult] = useState<DiseaseResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [dragOver, setDragOver] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = useCallback((f: File) => {
    if (!f.type.startsWith("image/")) {
      setError("Please upload an image file (JPEG, PNG, or WebP)");
      return;
    }
    setFile(f);
    setPreview(URL.createObjectURL(f));
    setResult(null);
    setError("");
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragOver(false);
      const f = e.dataTransfer.files[0];
      if (f) handleFile(f);
    },
    [handleFile]
  );

  const handleSubmit = async () => {
    if (!file) return;
    setLoading(true);
    setError("");
    try {
      const res = await detectDisease(file);
      setResult(res);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to detect disease. Is the backend running?";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const resetAnalysis = () => {
    setFile(null);
    setPreview("");
    setResult(null);
    setError("");
  };

  const detail = result?.detail;
  const hasDetail = detail && !result?.is_healthy && detail.causes;

  // Helper for rendering tag lists
  const TagList = ({ items, color, bg }: { items: string[]; color: string; bg: string }) => (
    <div style={{ display: "flex", flexWrap: "wrap", gap: 5 }}>
      {items.map((item, i) => (
        <span key={i} style={{
          fontSize: "0.76rem", padding: "3px 10px", borderRadius: 6,
          background: bg, color: color, fontWeight: 500, lineHeight: 1.45,
        }}>
          {item}
        </span>
      ))}
    </div>
  );

  // Helper for section cards
  const InfoSection = ({ icon: Icon, title, color, bg, children }: {
    icon: React.ElementType; title: string; color: string; bg: string;
    children: React.ReactNode;
  }) => (
    <div style={{
      padding: "16px 18px", background: "#f8faf6",
      border: "1px solid #e2e8d8", borderRadius: 12, marginBottom: 12,
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
        <div style={{
          width: 26, height: 26, borderRadius: 7, background: bg,
          display: "flex", alignItems: "center", justifyContent: "center",
        }}>
          <Icon size={13} color={color} />
        </div>
        <span style={{ fontSize: "0.72rem", fontWeight: 700, letterSpacing: "0.04em", textTransform: "uppercase", color: "#7a937a" }}>
          {title}
        </span>
      </div>
      {children}
    </div>
  );

  return (
    <div className="page-container">
      <div className="page-header animate-in">
        <h1 className="page-title">Disease Detection</h1>
        <p className="page-subtitle">
          Upload a plant leaf photograph to identify diseases using deep learning analysis
        </p>
      </div>

      {/* Upload + Primary Results Row */}
      <div className="split-layout" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24, alignItems: "start", marginBottom: 20 }}>
        {/* Upload */}
        <div className="card animate-in delay-1">
          <p className="section-label">Upload Image</p>

          <div
            className={`drop-zone ${dragOver ? "drag-over" : ""}`}
            onClick={() => inputRef.current?.click()}
            onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onDrop={handleDrop}
          >
            {preview ? (
              <div>
                <img
                  src={preview}
                  alt="Leaf preview"
                  style={{ maxWidth: "100%", maxHeight: 260, borderRadius: 12, objectFit: "cover" }}
                />
                <p style={{ marginTop: 12, fontSize: "0.8rem", color: "var(--text-muted)" }}>
                  {file?.name}
                  <span style={{ margin: "0 6px", opacity: 0.4 }}>|</span>
                  Click or drag to replace
                </p>
              </div>
            ) : (
              <div>
                <div style={{
                  width: 52, height: 52, borderRadius: 14, background: "#e6f4e8",
                  display: "inline-flex", alignItems: "center", justifyContent: "center", marginBottom: 16,
                }}>
                  <Upload size={22} color="#2e8b3c" />
                </div>
                <p style={{ fontSize: "0.95rem", fontWeight: 550, marginBottom: 6, color: "var(--text-primary)" }}>
                  Drag and drop a leaf image here
                </p>
                <p style={{ color: "var(--text-muted)", fontSize: "0.82rem" }}>
                  or click to browse — JPEG, PNG, WebP supported
                </p>
              </div>
            )}
          </div>

          <input
            ref={inputRef} type="file" accept="image/*" style={{ display: "none" }}
            onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); }}
          />

          <div style={{ display: "flex", gap: 8, marginTop: 16 }}>
            <button className="btn-primary" onClick={handleSubmit} disabled={!file || loading} style={{ flex: 1 }}>
              {loading ? (
                <><div className="loading-pulse" style={{ width: 14, height: 14, borderRadius: "50%", background: "#fff" }} /> Analyzing...</>
              ) : (
                <><Microscope size={15} /> Detect Disease</>
              )}
            </button>
            {result && (
              <button className="btn-outline" onClick={resetAnalysis} style={{ padding: "10px 14px", borderColor: "#c5d6b4" }}>
                <X size={15} />
              </button>
            )}
          </div>

          {error && (
            <div style={{
              marginTop: 14, padding: "10px 14px", background: "#fdecea",
              border: "1px solid #f5c6c0", borderRadius: "var(--radius-sm)", color: "#c0392b",
              fontSize: "0.84rem", display: "flex", alignItems: "center", gap: 8,
            }}>
              <AlertTriangle size={14} /> {error}
            </div>
          )}

          {/* Model info */}
          {result?.source && (
            <div style={{ marginTop: 14 }}>
              <span style={{
                display: "inline-flex", alignItems: "center", gap: 4,
                fontSize: "0.68rem", fontWeight: 600, padding: "3px 10px", borderRadius: 99,
                background: "#e6f4e8", color: "#2e8b3c",
              }}>
                <span style={{ width: 5, height: 5, borderRadius: "50%", background: "#2e8b3c" }} />
                {result.model_type} — {result.source}
              </span>
            </div>
          )}
        </div>

        {/* Primary Result */}
        <div className="card animate-in delay-2">
          <p className="section-label">Diagnosis</p>

          {!result && !loading && (
            <div style={{ textAlign: "center", padding: "56px 0", color: "var(--text-muted)" }}>
              <ImageIcon size={36} style={{ marginBottom: 14, opacity: 0.25 }} />
              <p style={{ fontSize: "0.88rem" }}>Upload an image to begin analysis</p>
            </div>
          )}

          {loading && (
            <div style={{ textAlign: "center", padding: "56px 0" }}>
              <div className="loading-pulse">
                <Microscope size={36} color="#2e8b3c" style={{ marginBottom: 14 }} />
              </div>
              <p style={{ color: "var(--text-secondary)", fontSize: "0.88rem" }}>Running MobileNetV2 deep learning analysis...</p>
              <p style={{ color: "var(--text-muted)", fontSize: "0.76rem", marginTop: 6 }}>Analyzing leaf patterns and comparing against trained disease signatures</p>
            </div>
          )}

          {result && (
            <div className="animate-in" style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              {/* Status banner */}
              <div style={{
                padding: "12px 16px", borderRadius: 10, display: "flex", alignItems: "center", gap: 8,
                background: result.is_healthy ? "#e6f4e8" : "#fdecea",
                border: `1px solid ${result.is_healthy ? "#c5d6b4" : "#f5c6c0"}`,
                color: result.is_healthy ? "#2e8b3c" : "#c0392b",
                fontWeight: 600, fontSize: "0.88rem",
              }}>
                {result.is_healthy ? <Shield size={16} /> : <ShieldAlert size={16} />}
                {result.is_healthy ? "Plant appears healthy" : "Disease detected"}
              </div>

              {/* Disease name card */}
              <div style={{
                padding: "16px 18px", background: "#f8faf6",
                border: "1px solid #e2e8d8", borderRadius: 12,
              }}>
                <div style={{ fontSize: "0.68rem", fontWeight: 700, letterSpacing: "0.05em", textTransform: "uppercase", color: "#7a937a", marginBottom: 5 }}>
                  Detected Condition
                </div>
                <div style={{ fontSize: "1.2rem", fontWeight: 700, color: "var(--text-primary)" }}>
                  {result.disease}
                </div>
                {hasDetail && (
                  <div style={{ display: "flex", gap: 6, marginTop: 8, flexWrap: "wrap" }}>
                    {detail.pathogen_type && (
                      <span style={{ fontSize: "0.7rem", padding: "2px 8px", borderRadius: 4, background: "#e8f1fb", color: "#2563a8", fontWeight: 600 }}>
                        {detail.pathogen_type}
                      </span>
                    )}
                    {detail.severity && (
                      <span style={{
                        fontSize: "0.7rem", padding: "2px 8px", borderRadius: 4, fontWeight: 600,
                        background: detail.severity.includes("High") ? "#fdecea" : "#fdf5e0",
                        color: detail.severity.includes("High") ? "#c0392b" : "#b8860b",
                      }}>
                        Severity: {detail.severity}
                      </span>
                    )}
                    {detail.scientific_name && (
                      <span style={{ fontSize: "0.7rem", padding: "2px 8px", borderRadius: 4, background: "#f0f3ea", color: "#7a937a", fontWeight: 500, fontStyle: "italic" }}>
                        {detail.scientific_name}
                      </span>
                    )}
                  </div>
                )}
              </div>

              {/* Confidence */}
              <div style={{
                padding: "16px 18px", background: "#f8faf6",
                border: "1px solid #e2e8d8", borderRadius: 12,
              }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    <Activity size={13} color="#7a937a" />
                    <span style={{ fontSize: "0.68rem", fontWeight: 700, letterSpacing: "0.05em", textTransform: "uppercase", color: "#7a937a" }}>
                      Confidence
                    </span>
                  </div>
                  <span style={{ fontWeight: 700, fontVariantNumeric: "tabular-nums", color: result.confidence > 0.7 ? "#2e8b3c" : "#b8860b" }}>
                    {(result.confidence * 100).toFixed(1)}%
                  </span>
                </div>
                <div className="confidence-bar">
                  <div className="confidence-fill" style={{ width: `${result.confidence * 100}%` }} />
                </div>
              </div>

              {/* Quick treatment */}
              <div style={{
                padding: "16px 18px", background: "#e8f1fb",
                border: "1px solid #c5d8ef", borderRadius: 12,
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 8 }}>
                  <Pill size={13} color="#2563a8" />
                  <span style={{ fontSize: "0.68rem", fontWeight: 700, letterSpacing: "0.05em", textTransform: "uppercase", color: "#2563a8" }}>
                    Quick Treatment
                  </span>
                </div>
                <p style={{ color: "#3a5060", lineHeight: 1.7, fontSize: "0.87rem" }}>
                  {result.treatment}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Detailed Disease Information — shown only when disease is detected and detail available */}
      {hasDetail && (
        <div className="animate-in delay-3">
          {/* Description */}
          <div className="card" style={{ marginBottom: 20 }}>
            <p className="section-label" style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <BookOpen size={12} /> Detailed Analysis
            </p>
            <p style={{ fontSize: "0.9rem", color: "var(--text-secondary)", lineHeight: 1.7 }}>
              {detail.description}
            </p>
          </div>

          {/* Two-column grid: Causes + Symptoms */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, marginBottom: 20 }}>
            <div className="card">
              <InfoSection icon={Bug} title="What Causes This Disease" color="#c0392b" bg="#fdecea">
                <ul style={{ margin: 0, paddingLeft: 16 }}>
                  {detail.causes?.map((c, i) => (
                    <li key={i} style={{ fontSize: "0.84rem", color: "var(--text-secondary)", lineHeight: 1.6, marginBottom: 4 }}>{c}</li>
                  ))}
                </ul>
              </InfoSection>

              {detail.affected_plants && detail.affected_plants.length > 0 && (
                <InfoSection icon={Sprout} title="Plants Commonly Affected" color="#2e8b3c" bg="#e6f4e8">
                  <TagList items={detail.affected_plants} color="#2e8b3c" bg="#e6f4e8" />
                </InfoSection>
              )}
            </div>

            <div className="card">
              <InfoSection icon={Search} title="Symptoms to Watch For" color="#b8860b" bg="#fdf5e0">
                <ul style={{ margin: 0, paddingLeft: 16 }}>
                  {detail.symptoms?.map((s, i) => (
                    <li key={i} style={{ fontSize: "0.84rem", color: "var(--text-secondary)", lineHeight: 1.6, marginBottom: 4 }}>{s}</li>
                  ))}
                </ul>
              </InfoSection>
            </div>
          </div>

          {/* Treatment Section */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, marginBottom: 20 }}>
            {/* Eco-friendly treatments */}
            <div className="card">
              <p className="section-label" style={{ display: "flex", alignItems: "center", gap: 6, color: "#2e8b3c" }}>
                <Leaf size={12} /> Eco-Friendly Treatments
              </p>
              <p style={{ fontSize: "0.78rem", color: "#7a937a", marginBottom: 12 }}>
                Sustainable solutions that do not harm soil health or reduce crop nutritional value
              </p>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {detail.eco_friendly_treatment?.map((t, i) => (
                  <div key={i} style={{
                    display: "flex", alignItems: "flex-start", gap: 8,
                    padding: "10px 12px", background: "#f5f9f2",
                    border: "1px solid #e2e8d8", borderRadius: 8,
                  }}>
                    <CheckCircle size={14} color="#2e8b3c" style={{ marginTop: 2, flexShrink: 0 }} />
                    <span style={{ fontSize: "0.84rem", color: "var(--text-secondary)", lineHeight: 1.5 }}>{t}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Chemical treatments */}
            <div className="card">
              <p className="section-label" style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <FlaskConical size={12} /> Chemical Treatments
              </p>
              <p style={{ fontSize: "0.78rem", color: "#7a937a", marginBottom: 12 }}>
                Use only as a last resort. Always follow recommended dosage and safety guidelines
              </p>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {detail.chemical_treatment?.map((t, i) => (
                  <div key={i} style={{
                    display: "flex", alignItems: "flex-start", gap: 8,
                    padding: "10px 12px", background: "#f8faf6",
                    border: "1px solid #e2e8d8", borderRadius: 8,
                  }}>
                    <Pill size={14} color="#b8860b" style={{ marginTop: 2, flexShrink: 0 }} />
                    <span style={{ fontSize: "0.84rem", color: "var(--text-secondary)", lineHeight: 1.5 }}>{t}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Nutritional Impact + Best Practices + Prevention */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 20, marginBottom: 20 }}>
            {/* Nutritional Impact */}
            <div className="card">
              <InfoSection icon={Apple} title="Impact on Nutrition" color="#6b21a8" bg="#f3eef8">
                <p style={{ fontSize: "0.84rem", color: "var(--text-secondary)", lineHeight: 1.65 }}>
                  {detail.nutritional_impact}
                </p>
              </InfoSection>
            </div>

            {/* Best Practices */}
            <div className="card">
              <InfoSection icon={ShieldCheck} title="Best Practices" color="#2563a8" bg="#e8f1fb">
                <ul style={{ margin: 0, paddingLeft: 16 }}>
                  {detail.best_practices?.map((p, i) => (
                    <li key={i} style={{ fontSize: "0.82rem", color: "var(--text-secondary)", lineHeight: 1.55, marginBottom: 4 }}>{p}</li>
                  ))}
                </ul>
              </InfoSection>
            </div>

            {/* Prevention */}
            <div className="card">
              <InfoSection icon={Shield} title="Prevention Tips" color="#2e8b3c" bg="#e6f4e8">
                <ul style={{ margin: 0, paddingLeft: 16 }}>
                  {detail.prevention?.map((p, i) => (
                    <li key={i} style={{ fontSize: "0.82rem", color: "var(--text-secondary)", lineHeight: 1.55, marginBottom: 4 }}>{p}</li>
                  ))}
                </ul>
              </InfoSection>
            </div>
          </div>
        </div>
      )}

      {/* Healthy plant info */}
      {result?.is_healthy && detail && (
        <div className="card animate-in delay-3" style={{ marginBottom: 20 }}>
          <p className="section-label" style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <Leaf size={12} /> Plant Care Recommendations
          </p>
          <p style={{ fontSize: "0.9rem", color: "var(--text-secondary)", lineHeight: 1.7, marginBottom: 16 }}>
            {detail.description}
          </p>
          {detail.best_practices && detail.best_practices.length > 0 && (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 8 }}>
              {detail.best_practices.map((p, i) => (
                <div key={i} style={{
                  display: "flex", alignItems: "flex-start", gap: 8,
                  padding: "10px 12px", background: "#f5f9f2",
                  border: "1px solid #e2e8d8", borderRadius: 8,
                }}>
                  <CheckCircle size={14} color="#2e8b3c" style={{ marginTop: 2, flexShrink: 0 }} />
                  <span style={{ fontSize: "0.84rem", color: "var(--text-secondary)", lineHeight: 1.5 }}>{p}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
