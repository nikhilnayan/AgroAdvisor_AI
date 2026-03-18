"use client";

import Link from "next/link";
import {
  ArrowRight, Sprout, Search, BarChart3,
  Target, Microscope, Zap, ChevronRight, Leaf,
} from "lucide-react";

export default function HomePage() {
  const features = [
    {
      icon: Sprout,
      title: "Smart Crop Recommendation",
      desc: "AI-powered recommendations based on soil nutrient levels, climate conditions, and pH. Optimize yield with data-driven decisions.",
      href: "/crop-recommendation",
      color: "#2e8b3c",
      bgColor: "#e6f4e8",
    },
    {
      icon: Microscope,
      title: "Disease Detection",
      desc: "Upload a photograph of a plant leaf and instantly identify diseases using a convolutional neural network trained on agricultural data.",
      href: "/disease-detection",
      color: "#2563a8",
      bgColor: "#e8f1fb",
    },
    {
      icon: BarChart3,
      title: "Market Intelligence",
      desc: "Access real-time weather forecasts and crop market prices. Make informed agricultural decisions backed by live data.",
      href: "/dashboard",
      color: "#b8860b",
      bgColor: "#fdf5e0",
    },
  ];

  const stats = [
    { label: "Crop Classes", value: "22", icon: Sprout },
    { label: "Disease Classes", value: "15", icon: Search },
    { label: "Model Accuracy", value: "95%+", icon: Target },
    { label: "API Endpoints", value: "5", icon: Zap },
  ];

  return (
    <div>
      {/* Hero */}
      <section
        style={{
          position: "relative",
          minHeight: "86vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "var(--bg-hero)",
          overflow: "hidden",
        }}
      >
        {/* Decorative leaf shapes */}
        <div style={{ position: "absolute", top: 60, right: "8%", opacity: 0.06 }}>
          <Leaf size={220} color="#2e8b3c" strokeWidth={0.8} />
        </div>
        <div style={{ position: "absolute", bottom: 40, left: "5%", opacity: 0.04, transform: "rotate(45deg)" }}>
          <Leaf size={180} color="#2e8b3c" strokeWidth={0.8} />
        </div>

        <div style={{ textAlign: "center", maxWidth: 680, padding: "0 24px", position: "relative", zIndex: 1 }}>
          <div
            className="animate-in"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
              background: "#e6f4e8",
              border: "1px solid #b7dbb9",
              borderRadius: 99,
              padding: "6px 16px",
              marginBottom: 28,
              fontSize: "0.78rem",
              fontWeight: 600,
              color: "#2e8b3c",
            }}
          >
            <Zap size={12} />
            Powered by Machine Learning
          </div>

          <h1
            className="animate-in delay-1"
            style={{
              fontSize: "clamp(2.2rem, 5vw, 3.4rem)",
              fontWeight: 800,
              lineHeight: 1.1,
              letterSpacing: "-0.035em",
              marginBottom: 18,
              color: "#1a2e1a",
            }}
          >
            AI-Powered Crop
            <br />
            <span style={{ color: "#2e8b3c" }}>Advisory System</span>
          </h1>

          <p
            className="animate-in delay-2"
            style={{
              fontSize: "1.05rem",
              color: "#4a6248",
              maxWidth: 520,
              margin: "0 auto 36px",
              lineHeight: 1.65,
            }}
          >
            Intelligent crop recommendations, instant plant disease detection,
            and real-time market data — built for modern agriculture.
          </p>

          <div
            className="animate-in delay-3"
            style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}
          >
            <Link href="/crop-recommendation" style={{ textDecoration: "none" }}>
              <button className="btn-primary" style={{ padding: "13px 30px" }}>
                <Sprout size={16} />
                Get Crop Advice
              </button>
            </Link>
            <Link href="/disease-detection" style={{ textDecoration: "none" }}>
              <button className="btn-outline" style={{ padding: "13px 30px" }}>
                <Search size={16} />
                Detect Disease
              </button>
            </Link>
          </div>
        </div>
      </section>

      {/* Stats */}
      {/* <section
        style={{
          borderTop: "1px solid #e2e8d8",
          borderBottom: "1px solid #e2e8d8",
          padding: "36px 24px",
          background: "#fff",
        }}
      >
        <div
          className="stats-grid"
          style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 24, maxWidth: 860, margin: "0 auto" }}
        >
          {stats.map((stat, i) => {
            const Icon = stat.icon;
            return (
              <div key={stat.label} className={`animate-in delay-${i + 1}`} style={{ textAlign: "center" }}>
                <div
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: 10,
                    background: "#e6f4e8",
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                    marginBottom: 10,
                  }}
                >
                  <Icon size={18} color="#2e8b3c" />
                </div>
                <div style={{ fontSize: "1.5rem", fontWeight: 700, color: "#1a2e1a", letterSpacing: "-0.02em" }}>
                  {stat.value}
                </div>
                <div style={{ fontSize: "0.78rem", color: "#7a937a", marginTop: 2 }}>
                  {stat.label}
                </div>
              </div>
            );
          })}
        </div>
      </section> */}

      {/* Features */}
      <section style={{ padding: "72px 24px" }}>
        <div style={{ maxWidth: 1180, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 48 }}>
            <p className="section-label" style={{ color: "#2e8b3c" }}>CAPABILITIES</p>
            <h2 style={{ fontSize: "1.55rem", fontWeight: 700, letterSpacing: "-0.02em", color: "#1a2e1a" }}>
              Core Features
            </h2>
          </div>

          <div className="stats-grid" style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 20 }}>
            {features.map((feature, i) => {
              const Icon = feature.icon;
              return (
                <Link key={feature.title} href={feature.href} style={{ textDecoration: "none", color: "inherit" }}>
                  <div
                    className={`card card-interactive animate-in delay-${i + 1}`}
                    style={{ height: "100%", cursor: "pointer" }}
                  >
                    <div
                      style={{
                        width: 46,
                        height: 46,
                        borderRadius: 12,
                        background: feature.bgColor,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        marginBottom: 18,
                      }}
                    >
                      <Icon size={22} color={feature.color} />
                    </div>
                    <h3 style={{ fontSize: "1.02rem", fontWeight: 650, marginBottom: 8 }}>
                      {feature.title}
                    </h3>
                    <p style={{ color: "#4a6248", lineHeight: 1.6, fontSize: "0.87rem", marginBottom: 14 }}>
                      {feature.desc}
                    </p>
                    <div style={{ display: "flex", alignItems: "center", gap: 4, color: feature.color, fontSize: "0.82rem", fontWeight: 600 }}>
                      Explore <ChevronRight size={14} />
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer
        style={{
          borderTop: "1px solid #e2e8d8",
          padding: "28px 24px",
          textAlign: "center",
          background: "#fff",
        }}
      >
        <p style={{ color: "#7a937a", fontSize: "0.78rem" }}>
          AgroAdvisor AI — AI-Based Crop Advisory System
          <span style={{ margin: "0 8px", opacity: 0.3 }}>|</span>
          FastAPI, scikit-learn, TensorFlow, Next.js
        </p>
      </footer>
    </div>
  );
}
