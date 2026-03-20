"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { logout } from "@/utils/auth";
import axios from "axios";

const links = [
  { href: "/", label: "Home" },
  { href: "/checkin", label: "Check-In" },
  { href: "/dashboard", label: "Dashboard" },
  { href: "/faq", label: "Guide" },
];

interface User {
  id: string;
  name: string;
  email: string;
  isProfileComplete: boolean;
}

export default function Header() {
  const path = usePathname();
  const [user, setUser] = useState<User | null>(null);
  const [showDropdown, setShowDropdown] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await axios.get("/api/profile", {
          withCredentials: true
        });
        if (response.data.success) {
          setUser(response.data.user);
        }
      } catch (error) {
        // User not logged in
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, []);

  const handleLogout = async () => {
    await logout();
    setUser(null);
  };

  return (
    <motion.header
      initial={{ y: -90, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: [0.4, 0, 0.2, 1] }}
      style={{
        position: "fixed", top: 0, left: 0, right: 0, zIndex: 1000,
        height: 76,
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "0 36px",
        background: "rgba(7,5,15,0.85)",
        backdropFilter: "blur(32px) saturate(180%)",
        borderBottom: "1px solid rgba(192,132,252,0.1)",
      }}
    >
      {/* top shimmer line */}
      <div style={{
        position: "absolute", top: 0, left: "5%", right: "5%", height: 1,
        background: "linear-gradient(90deg,transparent,rgba(255,110,180,0.6),rgba(192,132,252,0.6),rgba(125,211,252,0.4),transparent)",
      }} />

      {/* Logo */}
      <Link href="/" style={{ textDecoration: "none", display: "flex", alignItems: "center", gap: 13 }}>
        <div style={{ position: "relative" }}>
          <div style={{
            width: 42, height: 42, borderRadius: 13,
            background: "linear-gradient(135deg,#ff6eb4,#c084fc,#7dd3fc)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 18, fontWeight: 900, color: "#fff",
            boxShadow: "0 0 24px rgba(255,110,180,0.45), 0 0 48px rgba(192,132,252,0.2)",
          }}>✦</div>
          <div style={{
            position: "absolute", inset: -3, borderRadius: 16,
            border: "1px solid rgba(255,110,180,0.3)",
            animation: "border-glow 3s ease-in-out infinite",
          }} />
        </div>
        <div>
          <div style={{
            fontWeight: 900, fontSize: 17, letterSpacing: "-0.03em",
            background: "linear-gradient(135deg,#ff6eb4,#c084fc)",
            WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
          }}>
            DigitalTwin.AI
          </div>
          <div style={{ fontSize: 9, color: "#4a3860", letterSpacing: "0.2em", textTransform: "uppercase", marginTop: -1 }}>
            Ctrl C Ctrl V Engineers
          </div>
        </div>
      </Link>

      {/* Nav */}
      <nav style={{ display: "flex", gap: 4, alignItems: "center" }}>
        {links.map(l => {
          const active = path === l.href;
          return (
            <Link key={l.href} href={l.href} style={{ textDecoration: "none" }}>
              <div style={{
                padding: "9px 18px", borderRadius: 12, fontSize: 14, fontWeight: active ? 700 : 500,
                color: active ? "#ff6eb4" : "#7c6a9a",
                background: active ? "rgba(255,110,180,0.1)" : "transparent",
                border: `1px solid ${active ? "rgba(255,110,180,0.25)" : "transparent"}`,
                transition: "all 0.2s", cursor: "pointer",
                boxShadow: active ? "0 0 16px rgba(255,110,180,0.12)" : "none",
              }}>
                {l.label}
              </div>
            </Link>
          );
        })}

        <div style={{ width: 1, height: 24, background: "rgba(192,132,252,0.15)", margin: "0 6px" }} />

        {loading ? (
          <div style={{ width: 40, height: 40, borderRadius: "50%", background: "rgba(192,132,252,0.1)" }} />
        ) : user ? (
          <div style={{ position: "relative" }}>
            <button
              onClick={() => setShowDropdown(!showDropdown)}
              style={{
                display: "flex", alignItems: "center", gap: 8, padding: "6px 12px",
                borderRadius: 12, border: "1px solid rgba(255,110,180,0.2)",
                background: "rgba(255,110,180,0.05)", cursor: "pointer",
                transition: "all 0.2s"
              }}
            >
              <div style={{ width: 32, height: 32, borderRadius: "50%", background: "linear-gradient(135deg,#ff6eb4,#c084fc)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 700, color: "#fff" }}>
                {user.name.split(" ").map((n: string) => n[0]).join("").slice(0, 2).toUpperCase()}
              </div>
              <span style={{ color: "#ff6eb4", fontSize: 14, fontWeight: 600 }}>
                {user.name.split(' ')[0]}
              </span>
              <span style={{ color: "#7c6a9a", fontSize: 12 }}>▼</span>
            </button>

            {showDropdown && (
              <div style={{
                position: "absolute", top: "100%", right: 0, marginTop: 8,
                width: 200, borderRadius: 12, padding: 8,
                background: "rgba(7,5,15,0.95)", backdropFilter: "blur(20px)",
                border: "1px solid rgba(255,110,180,0.15)",
                boxShadow: "0 8px 32px rgba(0,0,0,0.4)"
              }}>
                <div style={{ padding: "8px 12px", borderBottom: "1px solid rgba(255,110,180,0.1)" }}>
                  <div style={{ color: "#ff6eb4", fontSize: 14, fontWeight: 600 }}>{user.name}</div>
                  <div style={{ color: "#7c6a9a", fontSize: 12 }}>{user.email}</div>
                </div>
                <Link href="/profile" style={{ textDecoration: "none" }}>
                  <div style={{
                    padding: "8px 12px", color: "#a78bca", fontSize: 13,
                    cursor: "pointer", transition: "all 0.2s",
                    borderRadius: 8, margin: "4px 0"
                  }}>
                    My Profile
                  </div>
                </Link>
                <Link href="/profile-setup" style={{ textDecoration: "none" }}>
                  <div style={{
                    padding: "8px 12px", color: "#a78bca", fontSize: 13,
                    cursor: "pointer", transition: "all 0.2s",
                    borderRadius: 8, margin: "4px 0"
                  }}>
                    Edit Profile
                  </div>
                </Link>
                <button
                  onClick={handleLogout}
                  style={{
                    width: "100%", padding: "8px 12px", color: "#ff4d6d", fontSize: 13,
                    background: "transparent", border: "none", cursor: "pointer",
                    textAlign: "left", borderRadius: 8, margin: "4px 0",
                    transition: "all 0.2s"
                  }}
                >
                  Logout
                </button>
              </div>
            )}
          </div>
        ) : (
          <>
            <Link href="/login" style={{ textDecoration: "none" }}>
              <div style={{
                padding: "9px 18px", borderRadius: 12, fontSize: 14, fontWeight: 600,
                color: "#a78bca", border: "1px solid rgba(192,132,252,0.15)",
                background: "rgba(192,132,252,0.05)", cursor: "pointer", transition: "all 0.2s",
              }}>
                Login
              </div>
            </Link>

            <Link href="/signup" style={{ textDecoration: "none", marginLeft: 4 }}>
              <div style={{
                padding: "9px 20px", borderRadius: 12, fontSize: 14, fontWeight: 800,
                background: "linear-gradient(135deg,#ff6eb4,#c084fc)",
                color: "#fff", cursor: "pointer", transition: "all 0.2s",
                boxShadow: "0 4px 20px rgba(255,110,180,0.3)",
              }}>
                Get Started
              </div>
            </Link>

            <Link href="/university" style={{ textDecoration: "none", marginLeft: 4 }}>
              <div style={{
                padding: "9px 16px", borderRadius: 12, fontSize: 13, fontWeight: 600,
                color: "#00d4ff", border: "1px solid rgba(0,212,255,0.2)",
                background: "rgba(0,212,255,0.05)", cursor: "pointer", transition: "all 0.2s",
              }}>
                🏛️ University
              </div>
            </Link>
          </>
        )}

        <Link href="/emergency" style={{ textDecoration: "none", marginLeft: 6 }}>
          <div style={{
            padding: "9px 16px", borderRadius: 12, fontSize: 13, fontWeight: 700,
            color: "#ff4d6d", border: "1px solid rgba(255,77,109,0.25)",
            background: "rgba(255,77,109,0.06)", cursor: "pointer",
            display: "flex", alignItems: "center", gap: 6, transition: "all 0.2s",
          }}>
            <span style={{
              width: 6, height: 6, borderRadius: "50%", background: "#ff4d6d",
              boxShadow: "0 0 8px #ff4d6d", display: "inline-block",
            }} className="pulse-dot" />
            SOS
          </div>
        </Link>
      </nav>
    </motion.header>
  );
}
