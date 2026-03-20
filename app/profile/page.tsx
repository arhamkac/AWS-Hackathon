"use client";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import axios from "axios";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Header from "../components/Header";
import ParticleBackground from "../components/ParticleBackground";
import { logout } from "@/utils/auth";

interface UserProfile {
  id: string;
  name: string;
  email: string;
  authProvider: string;
  isProfileComplete: boolean;
  lastLoginAt?: string;
  createdAt?: string;
  academic?: {
    university?: string;
    branch?: string;
    semester?: string;
    currentCGPA?: number;
    rollNumber?: string;
    year?: number;
  };
  goals?: {
    selectedGoals?: string[];
    completedAchievements?: string[];
    extraContext?: string;
  };
}

function SidebarItem({ icon, label, href, danger, onClick }: { icon: string; label: string; href?: string; danger?: boolean; onClick?: () => void }) {
  const style: React.CSSProperties = {
    display: "flex", alignItems: "center", gap: 12, padding: "11px 16px",
    borderRadius: 10, fontSize: 14, fontWeight: 500, cursor: "pointer",
    color: danger ? "#ff4d6d" : "#a78bca", border: "none", background: "transparent",
    width: "100%", textAlign: "left", transition: "all 0.2s",
    textDecoration: "none",
  };
  if (href) return (
    <Link href={href} style={style}>
      <span>{icon}</span>{label}
    </Link>
  );
  return (
    <button onClick={onClick} style={style}>
      <span>{icon}</span>{label}
    </button>
  );
}

export default function ProfilePage() {
  const router = useRouter();
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios.get("/api/profile", { withCredentials: true })
      .then(r => { if (r.data.success) setUser(r.data.user); })
      .catch(() => router.push("/login"))
      .finally(() => setLoading(false));
  }, []);

  const handleLogout = async () => {
    await logout();
  };

  if (loading) return (
    <div style={{ minHeight: "100vh", background: "var(--bg)", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ color: "#64748b", fontSize: 14 }}>Loading profile...</div>
    </div>
  );

  if (!user) return null;

  const initials = user.name.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase();

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg)", position: "relative" }}>
      <ParticleBackground />
      <Header />

      <div style={{ paddingTop: 96, padding: "96px 24px 60px", maxWidth: 1100, margin: "0 auto", position: "relative", zIndex: 1 }}>
        <div style={{ display: "grid", gridTemplateColumns: "220px 1fr", gap: 24 }}>

          {/* Sidebar */}
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}
            style={{ borderRadius: 16, background: "rgba(13,27,46,0.8)", border: "1px solid rgba(192,132,252,0.12)", padding: 16, height: "fit-content" }}>

            {/* Avatar */}
            <div style={{ textAlign: "center", padding: "16px 0 20px", borderBottom: "1px solid rgba(192,132,252,0.08)" }}>
              <div style={{ width: 72, height: 72, borderRadius: "50%", background: "linear-gradient(135deg,#ff6eb4,#c084fc)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24, fontWeight: 700, color: "#fff", margin: "0 auto 10px", border: "2px solid rgba(192,132,252,0.3)" }}>
                {initials}
              </div>
              <div style={{ fontWeight: 700, fontSize: 14, color: "#e2e8f0" }}>{user.name}</div>
              <div style={{ fontSize: 11, color: "#64748b", marginTop: 2 }}>{user.email}</div>
              <div style={{ marginTop: 8, display: "inline-block", fontSize: 10, padding: "2px 10px", borderRadius: 100,
                background: user.isProfileComplete ? "rgba(16,185,129,0.1)" : "rgba(245,158,11,0.1)",
                color: user.isProfileComplete ? "#10b981" : "#f59e0b",
                border: `1px solid ${user.isProfileComplete ? "rgba(16,185,129,0.3)" : "rgba(245,158,11,0.3)"}` }}>
                {user.isProfileComplete ? "Profile Complete" : "Incomplete"}
              </div>
            </div>

            {/* Nav */}
            <div style={{ marginTop: 12, display: "flex", flexDirection: "column", gap: 2 }}>
              <SidebarItem icon="🏠" label="Dashboard" href="/dashboard" />
              <SidebarItem icon="✏️" label="Edit Profile" href="/profile-setup" />
              <SidebarItem icon="📊" label="Check-In" href="/checkin" />
              <SidebarItem icon="🆘" label="Emergency" href="/emergency" />
              <div style={{ height: 1, background: "rgba(192,132,252,0.08)", margin: "8px 0" }} />
              <SidebarItem icon="🚪" label="Logout" danger onClick={handleLogout} />
            </div>
          </motion.div>

          {/* Main content */}
          <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>

            {/* Header card */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
              style={{ padding: "28px 32px", borderRadius: 16, background: "rgba(13,27,46,0.8)", border: "1px solid rgba(0,212,255,0.1)" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12 }}>
                <div>
                  <h1 style={{ fontSize: 24, fontWeight: 800, color: "#e2e8f0", marginBottom: 4 }}>
                    {user.name}
                  </h1>
                  <p style={{ color: "#64748b", fontSize: 13 }}>
                    {user.authProvider === "google" ? "🔵 Google Account" : "📧 Email Account"} ·
                    Joined {user.createdAt ? new Date(user.createdAt).toLocaleDateString("en-IN", { month: "long", year: "numeric" }) : "—"}
                  </p>
                </div>
                <Link href="/profile-setup">
                  <button style={{ padding: "9px 20px", borderRadius: 10, border: "1px solid rgba(0,212,255,0.25)",
                    background: "rgba(0,212,255,0.06)", color: "#00d4ff", cursor: "pointer", fontSize: 13, fontWeight: 600 }}>
                    Edit Profile →
                  </button>
                </Link>
              </div>
            </motion.div>

            {/* Academic info */}
            {user.academic && (
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
                style={{ padding: "24px 28px", borderRadius: 16, background: "rgba(13,27,46,0.8)", border: "1px solid rgba(0,212,255,0.1)" }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: "#00d4ff", marginBottom: 16, letterSpacing: "0.08em", textTransform: "uppercase" }}>
                  🎓 Academic Profile
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 16 }}>
                  {[
                    { label: "University", value: user.academic.university },
                    { label: "Branch", value: user.academic.branch },
                    { label: "Semester", value: user.academic.semester },
                    { label: "CGPA", value: user.academic.currentCGPA },
                    { label: "Roll Number", value: user.academic.rollNumber },
                    { label: "Year", value: user.academic.year ? `Year ${user.academic.year}` : undefined },
                  ].filter(f => f.value).map((f, i) => (
                    <div key={i} style={{ padding: "14px 16px", borderRadius: 10, background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.05)" }}>
                      <div style={{ fontSize: 10, color: "#475569", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 4 }}>{f.label}</div>
                      <div style={{ fontSize: 15, fontWeight: 600, color: "#e2e8f0" }}>{String(f.value)}</div>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Goals */}
            {user.goals?.selectedGoals && user.goals.selectedGoals.length > 0 && (
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
                style={{ padding: "24px 28px", borderRadius: 16, background: "rgba(13,27,46,0.8)", border: "1px solid rgba(0,212,255,0.1)" }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: "#a855f7", marginBottom: 16, letterSpacing: "0.08em", textTransform: "uppercase" }}>
                  🎯 Goals
                </div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                  {user.goals.selectedGoals.map((g, i) => (
                    <span key={i} style={{ padding: "6px 14px", borderRadius: 100, fontSize: 12, fontWeight: 500,
                      background: "rgba(168,85,247,0.08)", border: "1px solid rgba(168,85,247,0.2)", color: "#c084fc" }}>
                      {g}
                    </span>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Achievements */}
            {user.goals?.completedAchievements && user.goals.completedAchievements.length > 0 && (
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
                style={{ padding: "24px 28px", borderRadius: 16, background: "rgba(13,27,46,0.8)", border: "1px solid rgba(0,212,255,0.1)" }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: "#10b981", marginBottom: 16, letterSpacing: "0.08em", textTransform: "uppercase" }}>
                  ✅ Achievements
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {user.goals.completedAchievements.map((a, i) => (
                    <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 13, color: "#94a3b8" }}>
                      <span style={{ color: "#10b981" }}>✓</span> {a}
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Account info */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}
              style={{ padding: "24px 28px", borderRadius: 16, background: "rgba(13,27,46,0.8)", border: "1px solid rgba(255,77,109,0.1)" }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: "#ff4d6d", marginBottom: 16, letterSpacing: "0.08em", textTransform: "uppercase" }}>
                ⚙️ Account
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12 }}>
                <div style={{ fontSize: 13, color: "#64748b" }}>
                  Last login: {user.lastLoginAt ? new Date(user.lastLoginAt).toLocaleString("en-IN") : "—"}
                </div>
                <button onClick={handleLogout}
                  style={{ padding: "9px 20px", borderRadius: 10, border: "1px solid rgba(255,77,109,0.3)",
                    background: "rgba(255,77,109,0.06)", color: "#ff4d6d", cursor: "pointer", fontSize: 13, fontWeight: 600 }}>
                  🚪 Logout
                </button>
              </div>
            </motion.div>

          </div>
        </div>
      </div>
    </div>
  );
}
