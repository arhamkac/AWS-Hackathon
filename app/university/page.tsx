"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";
import { useRouter } from "next/navigation";
import ParticleBackground from "../components/ParticleBackground";

type Tab = "login" | "register";

export default function UniversityAuth() {
  const router = useRouter();
  const [tab, setTab] = useState<Tab>("login");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Login state
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");

  // Register state
  const [reg, setReg] = useState({
    name: "", code: "", contactEmail: "", password: "", emailDomain: "",
    departments: "",
  });

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(""); setLoading(true);
    try {
      const res = await axios.post("/api/university/login", { contactEmail: loginEmail, password: loginPassword });
      if (res.data.success) router.push("/university/dashboard");
      else setError(res.data.message || "Login failed");
    } catch (err: any) {
      setError(err.response?.data?.message || "Login failed");
    } finally { setLoading(false); }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(""); setLoading(true);
    try {
      const res = await axios.post("/api/university/register", {
        ...reg,
        departments: reg.departments.split(",").map(d => d.trim()).filter(Boolean),
      });
      if (res.data.success) {
        setTab("login");
        setLoginEmail(reg.contactEmail);
        setError("");
      } else setError(res.data.message || "Registration failed");
    } catch (err: any) {
      setError(err.response?.data?.message || "Registration failed");
    } finally { setLoading(false); }
  };

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg)", position: "relative", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <ParticleBackground />
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
        style={{ width: "100%", maxWidth: 480, padding: "0 24px", position: "relative", zIndex: 1 }}>

        {/* Logo */}
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <div style={{ width: 56, height: 56, borderRadius: 16, background: "linear-gradient(135deg,#00d4ff,#7c3aed)",
            display: "flex", alignItems: "center", justifyContent: "center", fontSize: 26, margin: "0 auto 14px", fontWeight: 900, color: "#fff" }}>🏛️</div>
          <h1 style={{ fontSize: 22, fontWeight: 800, color: "#e2e8f0" }}>University Portal</h1>
          <p style={{ fontSize: 13, color: "#64748b", marginTop: 4 }}>DigitalTwin.AI — Institutional Dashboard</p>
        </div>

        {/* Tabs */}
        <div style={{ display: "flex", background: "rgba(13,27,46,0.8)", borderRadius: 12, padding: 4, marginBottom: 24, border: "1px solid rgba(0,212,255,0.1)" }}>
          {(["login", "register"] as Tab[]).map(t => (
            <button key={t} onClick={() => { setTab(t); setError(""); }}
              style={{ flex: 1, padding: "10px", borderRadius: 9, border: "none", cursor: "pointer", fontSize: 13, fontWeight: 600, transition: "all 0.2s",
                background: tab === t ? "linear-gradient(135deg,#00d4ff22,#7c3aed22)" : "transparent",
                color: tab === t ? "#e2e8f0" : "#64748b",
                boxShadow: tab === t ? "inset 0 0 0 1px rgba(0,212,255,0.2)" : "none" }}>
              {t === "login" ? "Admin Login" : "Register University"}
            </button>
          ))}
        </div>

        <div style={{ padding: "28px 32px", borderRadius: 16, background: "rgba(13,27,46,0.85)", border: "1px solid rgba(0,212,255,0.12)" }}>
          <AnimatePresence mode="wait">
            {tab === "login" ? (
              <motion.form key="login" initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 10 }}
                onSubmit={handleLogin} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                <div>
                  <label style={{ fontSize: 11, fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.08em", display: "block", marginBottom: 6 }}>Admin Email</label>
                  <input className="inp" type="email" value={loginEmail} onChange={e => setLoginEmail(e.target.value)}
                    placeholder="admin@university.ac.in" required />
                </div>
                <div>
                  <label style={{ fontSize: 11, fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.08em", display: "block", marginBottom: 6 }}>Password</label>
                  <input className="inp" type="password" value={loginPassword} onChange={e => setLoginPassword(e.target.value)}
                    placeholder="••••••••" required />
                </div>
                {error && <p style={{ fontSize: 12, color: "#ff4d6d", background: "rgba(255,77,109,0.08)", padding: "8px 12px", borderRadius: 8 }}>{error}</p>}
                <button type="submit" className="btn" disabled={loading} style={{ marginTop: 4 }}>
                  {loading ? "Signing in..." : "Sign In →"}
                </button>
              </motion.form>
            ) : (
              <motion.form key="register" initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }}
                onSubmit={handleRegister} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                  <div style={{ gridColumn: "span 2" }}>
                    <label style={{ fontSize: 11, fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.08em", display: "block", marginBottom: 6 }}>University Full Name</label>
                    <input className="inp" value={reg.name} onChange={e => setReg({ ...reg, name: e.target.value })}
                      placeholder="Indian Institute of Technology Kanpur" required />
                  </div>
                  <div>
                    <label style={{ fontSize: 11, fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.08em", display: "block", marginBottom: 6 }}>Short Code</label>
                    <input className="inp" value={reg.code} onChange={e => setReg({ ...reg, code: e.target.value.toUpperCase() })}
                      placeholder="IITK" maxLength={10} required />
                  </div>
                  <div>
                    <label style={{ fontSize: 11, fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.08em", display: "block", marginBottom: 6 }}>Email Domain</label>
                    <input className="inp" value={reg.emailDomain} onChange={e => setReg({ ...reg, emailDomain: e.target.value })}
                      placeholder="iitk.ac.in" />
                  </div>
                  <div style={{ gridColumn: "span 2" }}>
                    <label style={{ fontSize: 11, fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.08em", display: "block", marginBottom: 6 }}>Admin Email</label>
                    <input className="inp" type="email" value={reg.contactEmail} onChange={e => setReg({ ...reg, contactEmail: e.target.value })}
                      placeholder="counselling@iitk.ac.in" required />
                  </div>
                  <div style={{ gridColumn: "span 2" }}>
                    <label style={{ fontSize: 11, fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.08em", display: "block", marginBottom: 6 }}>Password</label>
                    <input className="inp" type="password" value={reg.password} onChange={e => setReg({ ...reg, password: e.target.value })}
                      placeholder="••••••••" minLength={8} required />
                  </div>
                  <div style={{ gridColumn: "span 2" }}>
                    <label style={{ fontSize: 11, fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.08em", display: "block", marginBottom: 6 }}>Departments <span style={{ color: "#475569", fontWeight: 400 }}>(comma separated)</span></label>
                    <input className="inp" value={reg.departments} onChange={e => setReg({ ...reg, departments: e.target.value })}
                      placeholder="CSE, ECE, ME, Civil, Chemical" />
                  </div>
                </div>
                {error && <p style={{ fontSize: 12, color: "#ff4d6d", background: "rgba(255,77,109,0.08)", padding: "8px 12px", borderRadius: 8 }}>{error}</p>}
                <button type="submit" className="btn" disabled={loading} style={{ marginTop: 4 }}>
                  {loading ? "Registering..." : "Register University →"}
                </button>
              </motion.form>
            )}
          </AnimatePresence>
        </div>

        <p style={{ textAlign: "center", marginTop: 20, fontSize: 12, color: "#475569" }}>
          Student portal? <a href="/login" style={{ color: "#00d4ff", textDecoration: "none" }}>Login here →</a>
        </p>
      </motion.div>
    </div>
  );
}
