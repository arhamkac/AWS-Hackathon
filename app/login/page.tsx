"use client";
import axios from "axios";
import { useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { useRouter } from "next/navigation";
import ParticleBackground from "../components/ParticleBackground";
import { signInWithPopup } from "firebase/auth";
import { auth, provider } from "@/lib/firebase";

const GoogleIcon = () => (
  <svg width="18" height="18" viewBox="0 0 48 48" style={{ flexShrink: 0, display: "block" }}>
    <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
    <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
    <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
    <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
    <path fill="none" d="M0 0h48v48H0z"/>
  </svg>
);

const Spinner = () => (
  <motion.span animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 0.8, ease: "linear" }}
    style={{ display: "inline-block", width: 14, height: 14, border: "2px solid currentColor",
      borderTopColor: "transparent", borderRadius: "50%" }} />
);

const lbl = (text: string) => (
  <label style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase" as const,
    color: "#6b5a80", display: "block", marginBottom: 8 }}>{text}</label>
);

export default function Login() {
  const router = useRouter();
  const [form, setForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [gLoading, setGLoading] = useState(false);
  const [err, setErr] = useState("");

  const handle = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.email || !form.password) { setErr("Please fill all fields."); return; }
    setLoading(true); setErr("");
    try {
      const res = await axios.post("/api/auth/login", form, { withCredentials: true });
      if (res.data.success) {
        router.push(res.data.needsProfileSetup ? "/profile-setup" : "/dashboard");
      }
    } catch (e: any) {
      setErr(e.response?.data?.message || "Login failed");
    }
    setLoading(false);
  };

  const handleGoogle = async () => {
    setGLoading(true); setErr("");
    try {
      const result = await signInWithPopup(auth, provider);
      const u = result.user;
      const res = await axios.post("/api/auth/google",
        { name: u.displayName, email: u.email, firebaseUID: u.uid, photoURL: u.photoURL },
        { withCredentials: true }
      );
      if (res.data.success) {
        router.push(res.data.needsProfileSetup ? "/profile-setup" : "/dashboard");
      }
    } catch (e: any) {
      setErr("Google sign-in failed. Try again.");
    }
    setGLoading(false);
  };

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg)", display: "flex", alignItems: "center",
      justifyContent: "center", position: "relative", padding: "24px" }}>
      <ParticleBackground />
      <div style={{ position: "fixed", top: "20%", left: "15%", width: 400, height: 400, borderRadius: "50%",
        background: "radial-gradient(circle,rgba(255,110,180,0.07) 0%,transparent 70%)", filter: "blur(60px)", pointerEvents: "none" }} />
      <div style={{ position: "fixed", bottom: "20%", right: "15%", width: 500, height: 500, borderRadius: "50%",
        background: "radial-gradient(circle,rgba(192,132,252,0.08) 0%,transparent 70%)", filter: "blur(80px)", pointerEvents: "none" }} />

      <motion.div initial={{ opacity: 0, y: 30, scale: 0.97 }} animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.6, ease: [0.4, 0, 0.2, 1] }}
        style={{ width: "100%", maxWidth: 440, position: "relative", zIndex: 1 }}>

        {/* Logo */}
        <div style={{ textAlign: "center", marginBottom: 36 }}>
          <div style={{ display: "inline-flex", alignItems: "center", justifyContent: "center",
            width: 52, height: 52, borderRadius: 14,
            background: "linear-gradient(135deg,#ff6eb4,#c084fc)",
            fontSize: 22, fontWeight: 900, color: "#fff",
            boxShadow: "0 0 30px rgba(255,110,180,0.35)", marginBottom: 16 }}>✦</div>
          <h1 style={{ fontSize: 26, fontWeight: 900, letterSpacing: "-0.03em", marginBottom: 6 }}>Welcome back</h1>
          <p style={{ color: "#6b5a80", fontSize: 14 }}>Sign in to your Digital Twin</p>
        </div>

        <div className="glass" style={{ padding: "36px 32px" }}>
          <div style={{ position: "absolute", top: 0, left: "15%", right: "15%", height: 1,
            background: "linear-gradient(90deg,transparent,rgba(255,110,180,0.4),transparent)" }} />

          {/* Google button */}
          <button className="btn-google" onClick={handleGoogle} disabled={gLoading} style={{ marginBottom: 20 }}>
            {gLoading ? <Spinner /> : <GoogleIcon />}
            {gLoading ? "Signing in..." : "Continue with Google"}
          </button>

          {/* Divider */}
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20 }}>
            <div style={{ flex: 1, height: 1, background: "rgba(255,255,255,0.06)" }} />
            <span style={{ fontSize: 11, color: "#4a3860", letterSpacing: "0.08em" }}>OR</span>
            <div style={{ flex: 1, height: 1, background: "rgba(255,255,255,0.06)" }} />
          </div>

          <form onSubmit={handle} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <div>
              {lbl("Email")}
              <input className="inp" type="email" placeholder="you@university.edu"
                value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} />
            </div>
            <div>
              {lbl("Password")}
              <input className="inp" type="password" placeholder="••••••••"
                value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} />
            </div>

            {err && (
              <div style={{ padding: "10px 14px", borderRadius: 10, background: "rgba(255,77,109,0.08)",
                border: "1px solid rgba(255,77,109,0.25)", color: "#ff4d6d", fontSize: 13 }}>{err}</div>
            )}

            <button type="submit" className="btn" disabled={loading}
              style={{ width: "100%", justifyContent: "center", marginTop: 4, opacity: loading ? 0.7 : 1 }}>
              {loading ? <><Spinner /> Signing in...</> : "Sign In →"}
            </button>
          </form>
        </div>

        <p style={{ textAlign: "center", marginTop: 20, fontSize: 13, color: "#6b5a80" }}>
          New here?{" "}
          <Link href="/signup" style={{ color: "#ff6eb4", textDecoration: "none", fontWeight: 600 }}>
            Create your Digital Twin →
          </Link>
        </p>
        <p style={{ textAlign: "center", marginTop: 10, fontSize: 12, color: "#4a3860" }}>
          University admin?{" "}
          <Link href="/university" style={{ color: "#00d4ff", textDecoration: "none", fontWeight: 600 }}>
            University Portal →
          </Link>
        </p>
      </motion.div>
    </div>
  );
}
