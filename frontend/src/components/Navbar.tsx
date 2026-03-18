"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Leaf, BarChart3, Search, LayoutDashboard } from "lucide-react";

export default function Navbar() {
  const pathname = usePathname();

  const links = [
    { href: "/", label: "Home", icon: Leaf },
    { href: "/crop-recommendation", label: "Crop Advisory", icon: BarChart3 },
    { href: "/disease-detection", label: "Disease Detection", icon: Search },
    { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  ];

  return (
    <nav
      style={{
        position: "sticky",
        top: 0,
        zIndex: 50,
        background: "rgba(255, 255, 255, 0.92)",
        backdropFilter: "blur(16px)",
        borderBottom: "1px solid #e2e8d8",
      }}
    >
      <div
        style={{
          maxWidth: 1180,
          margin: "0 auto",
          padding: "0 24px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          height: 58,
        }}
      >
        <Link
          href="/"
          style={{
            display: "flex",
            alignItems: "center",
            gap: 9,
            textDecoration: "none",
            color: "inherit",
          }}
        >
          <div
            style={{
              width: 32,
              height: 32,
              borderRadius: 9,
              background: "linear-gradient(135deg, #3ca84e, #2e8b3c)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: "0 2px 8px rgba(46, 139, 60, 0.2)",
            }}
          >
            <Leaf size={16} color="#fff" />
          </div>
          <span
            style={{
              fontSize: "1rem",
              fontWeight: 700,
              letterSpacing: "-0.02em",
              color: "#1a2e1a",
            }}
          >
            AgroAdvisor
            <span style={{ color: "#2e8b3c", marginLeft: 2 }}>AI</span>
          </span>
        </Link>

        <div style={{ display: "flex", gap: 2 }}>
          {links.map((link) => {
            const Icon = link.icon;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`nav-link ${pathname === link.href ? "active" : ""}`}
              >
                <Icon size={15} />
                <span>{link.label}</span>
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
