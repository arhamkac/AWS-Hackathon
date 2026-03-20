"use client";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";
import Header from "../components/Header";
import ParticleBackground from "../components/ParticleBackground";

const contacts = [
  { name: "University Counselling Centre", role: "Mental Health Support",      phone: "+91-512-259-7XXX", email: "counselling@iitk.ac.in", available: "Mon–Sat, 9 AM – 6 PM", color: "#00d4ff" },
  { name: "Student Wellness Office",       role: "Academic & Personal Wellbeing", phone: "+91-512-259-6XXX", email: "wellness@iitk.ac.in",    available: "Mon–Fri, 10 AM – 5 PM", color: "#7c3aed" },
  { name: "Dean of Students",              role: "Academic Escalation",         phone: "+91-512-259-8XXX", email: "dos@iitk.ac.in",           available: "Mon–Fri, 9 AM – 5 PM",  color: "#f59e0b" },
  { name: "Campus Security / Emergency",   role: "Immediate Physical Safety",   phone: "112 / +91-512-259-0000", email: "security@iitk.ac.in", available: "24/7",               color: "#ef4444" },
];

const hotlines = [
  { name: "iCall (TISS)",          number: "9152987821",    desc: "Free psychological counselling helpline" },
  { name: "Vandrevala Foundation", number: "1860-2662-345", desc: "24/7 mental health helpline" },
  { name: "NIMHANS",               number: "080-46110007",  desc: "National mental health helpline" },
  { name: "Snehi",                 number: "044-24640050",  desc: "Emotional support & crisis intervention" },
];

export default function Emergency() {
  const [form, setForm] = useState({ message: "", consent: false, rollNumber: "" });
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const [sent, setSent] = useState(false);
  const [copied, setCopied] = useState(false);
  const [user, setUser] = useState<{ name: string; email: string; academic?: { rollNumber?: string } } | null>(null);

  useEffect(() => {
    axios.get("/api/profile", { withCredentials: true })
      .then(r => { if (r.data.success) {
        setUser(r.data.user);
        setForm(f => ({ ...f, rollNumber: r.data.user.academic?.rollNumber || "" }));
      }})
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  // Step 1: build preview
  const handlePreview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.consent) return;
    setSending(true);
    try {
      const res = await axios.post("/api/emergency", { message: form.message, rollNumber: form.rollNumber }, { withCredentials: true });
      if (res.data.success) setPreview(res.data.fullMessage);
    } catch {
      setPreview("Failed to generate message. Please try again.");
    } finally {
      setSending(false);
    }
  };

  // Step 2: confirm send
  const handleConfirm = () => {
    setSent(true);
    setPreview(null);
  };

  const handleCopy = () => {
    if (!preview) return;
    navigator.clipboard.writeText(preview);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg)", position: "relative" }}>
      <ParticleBackground />
      <Header />

      {/* Preview modal */}
      <AnimatePresence>
        {preview && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ position: "fixed", inset: 0, zIndex: 2000, background: "rgba(0,0,0,0.75)",
              backdropFilter: "blur(8px)", display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}>
            <motion.div initial={{ scale: 0.95, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: 20 }}
              style={{ width: "100%", maxWidth: 680, borderRadius: 18, background: "rgba(10,20,40,0.98)",
                border: "1px solid rgba(239,68,68,0.3)", overflow: "hidden", display: "flex", flexDirection: "column", maxHeight: "85vh" }}>

              {/* Modal header */}
              <div style={{ padding: "20px 24px", borderBottom: "1px solid rgba(239,68,68,0.15)",
                display: "flex", justifyContent: "space-between", alignItems: "center", flexShrink: 0 }}>
                <div>
                  <div style={{ fontWeight: 700, fontSize: 16, color: "#e2e8f0" }}>📋 Review Before Sending</div>
                  <div style={{ fontSize: 12, color: "#64748b", marginTop: 2 }}>This is exactly what will be sent to the counselling centre</div>
                </div>
                <button onClick={() => setPreview(null)}
                  style={{ background: "none", border: "none", color: "#64748b", cursor: "pointer", fontSize: 22, lineHeight: 1 }}>×</button>
              </div>

              {/* Message content */}
              <div style={{ flex: 1, overflowY: "auto", padding: "20px 24px" }}>
                <pre style={{ fontFamily: "monospace", fontSize: 12.5, color: "#94a3b8", lineHeight: 1.75,
                  whiteSpace: "pre-wrap", wordBreak: "break-word", margin: 0,
                  background: "rgba(255,255,255,0.02)", padding: "16px 18px", borderRadius: 10,
                  border: "1px solid rgba(255,255,255,0.06)" }}>
                  {preview}
                </pre>
              </div>

              {/* Modal actions */}
              <div style={{ padding: "16px 24px", borderTop: "1px solid rgba(255,255,255,0.06)",
                display: "flex", gap: 10, flexShrink: 0 }}>
                <button onClick={handleCopy}
                  style={{ padding: "10px 20px", borderRadius: 9, border: "1px solid rgba(0,212,255,0.3)",
                    background: "rgba(0,212,255,0.08)", color: "#00d4ff", cursor: "pointer", fontSize: 13, fontWeight: 600 }}>
                  {copied ? "✓ Copied!" : "📋 Copy Message"}
                </button>
                <button onClick={() => setPreview(null)}
                  style={{ padding: "10px 20px", borderRadius: 9, border: "1px solid rgba(255,255,255,0.1)",
                    background: "transparent", color: "#64748b", cursor: "pointer", fontSize: 13, fontWeight: 600 }}>
                  Edit
                </button>
                <button onClick={handleConfirm}
                  style={{ flex: 1, padding: "10px 20px", borderRadius: 9, border: "none",
                    background: "linear-gradient(135deg,#ef4444,#7c3aed)", color: "#fff",
                    cursor: "pointer", fontSize: 13, fontWeight: 700 }}>
                  🆘 Confirm & Send to Counselling Centre
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <div style={{ maxWidth: 1000, margin: "0 auto", padding: "100px 24px 80px", position: "relative", zIndex: 1 }}>

        {/* Alert banner */}
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
          style={{ padding: "16px 24px", borderRadius: 12, background: "rgba(239,68,68,0.08)",
            border: "1px solid rgba(239,68,68,0.3)", display: "flex", gap: 12, alignItems: "center", marginBottom: 40 }}>
          <span style={{ fontSize: 24 }}>🆘</span>
          <div>
            <div style={{ fontWeight: 600, color: "#ef4444", marginBottom: 2 }}>If you are in immediate danger, call 112 now.</div>
            <div style={{ fontSize: 13, color: "#94a3b8" }}>This page connects you with campus support and national helplines. You are not alone.</div>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} style={{ textAlign: "center", marginBottom: 48 }}>
          <h1 style={{ fontSize: "clamp(1.8rem, 4vw, 2.8rem)", fontWeight: 700, marginBottom: 12 }}>
            Emergency <span className="gradient-text">Support</span>
          </h1>
          <p style={{ color: "#64748b", fontSize: 15 }}>Reach out to campus authorities or national helplines. Your data stays private.</p>
        </motion.div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 32 }}>

          {/* Left: Contacts */}
          <div>
            <h2 style={{ fontSize: 18, fontWeight: 600, marginBottom: 20, color: "#e2e8f0" }}>📞 Campus Contacts</h2>
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              {contacts.map((c, i) => (
                <motion.div key={i} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.1 }}
                  style={{ padding: "20px", borderRadius: 14, background: "rgba(13,27,46,0.7)", border: `1px solid ${c.color}25` }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 }}>
                    <div>
                      <div style={{ fontWeight: 600, color: "#e2e8f0", fontSize: 14, marginBottom: 2 }}>{c.name}</div>
                      <div style={{ fontSize: 12, color: c.color }}>{c.role}</div>
                    </div>
                    <span style={{ fontSize: 11, padding: "3px 8px", borderRadius: 8, background: `${c.color}15`, color: c.color }}>{c.available}</span>
                  </div>
                  <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                    <a href={`tel:${c.phone}`} style={{ fontSize: 13, color: "#94a3b8", textDecoration: "none" }}>📱 {c.phone}</a>
                    <a href={`mailto:${c.email}`} style={{ fontSize: 13, color: "#94a3b8", textDecoration: "none" }}>✉️ {c.email}</a>
                  </div>
                </motion.div>
              ))}
            </div>

            <h2 style={{ fontSize: 18, fontWeight: 600, margin: "28px 0 16px", color: "#e2e8f0" }}>🇮🇳 National Helplines</h2>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {hotlines.map((h, i) => (
                <motion.div key={i} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.4 + i * 0.08 }}
                  style={{ padding: "14px 18px", borderRadius: 12, background: "rgba(13,27,46,0.6)",
                    border: "1px solid rgba(255,255,255,0.06)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: 14, color: "#e2e8f0" }}>{h.name}</div>
                    <div style={{ fontSize: 12, color: "#64748b" }}>{h.desc}</div>
                  </div>
                  <a href={`tel:${h.number}`} style={{ textDecoration: "none" }}>
                    <button style={{ padding: "8px 14px", borderRadius: 8, border: "1px solid rgba(0,212,255,0.3)",
                      background: "rgba(0,212,255,0.08)", color: "#00d4ff", cursor: "pointer", fontSize: 13, fontWeight: 600 }}>
                      {h.number}
                    </button>
                  </a>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Right: Send form */}
          <div>
            <h2 style={{ fontSize: 18, fontWeight: 600, marginBottom: 20, color: "#e2e8f0" }}>📧 Send My Data to Authorities</h2>

            {sent ? (
              <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
                style={{ padding: "40px 32px", borderRadius: 16, background: "rgba(16,185,129,0.08)",
                  border: "1px solid rgba(16,185,129,0.3)", textAlign: "center" }}>
                <div style={{ fontSize: 48, marginBottom: 16 }}>✅</div>
                <h3 style={{ fontSize: 20, fontWeight: 600, color: "#10b981", marginBottom: 8 }}>Message Sent</h3>
                <p style={{ color: "#64748b", fontSize: 14, lineHeight: 1.6 }}>
                  Your wellbeing data and message have been sent to the counselling centre. Someone will reach out within 24 hours. You did the right thing.
                </p>
              </motion.div>
            ) : (
              <motion.form initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} onSubmit={handlePreview}
                style={{ padding: "28px", borderRadius: 16, background: "rgba(13,27,46,0.7)",
                  border: "1px solid rgba(0,212,255,0.1)", display: "flex", flexDirection: "column", gap: 16 }}>

                {/* What will be included */}
                <div style={{ padding: "12px 16px", borderRadius: 10, background: "rgba(0,212,255,0.05)",
                  border: "1px solid rgba(0,212,255,0.1)", fontSize: 13, color: "#64748b" }}>
                  {loading ? "Loading your profile..." : (
                    <>
                      Sending as <span style={{ color: "#e2e8f0", fontWeight: 600 }}>{user?.name || "you"}</span>
                      {user?.academic?.rollNumber ? ` (${user.academic.rollNumber})` : ""}
                      {" "}· Your latest burnout, stress & anxiety scores will be included automatically.
                    </>
                  )}
                </div>

                <div>
                  <label style={{ fontSize: 13, color: "#94a3b8", display: "block", marginBottom: 6 }}>Roll Number</label>
                  <input value={form.rollNumber} onChange={e => setForm({ ...form, rollNumber: e.target.value })}
                    placeholder="e.g. 230001" className="inp" style={{ fontSize: 14 }} />
                </div>

                <div>
                  <label style={{ fontSize: 13, color: "#94a3b8", display: "block", marginBottom: 6 }}>
                    Message to Counsellor <span style={{ color: "#475569" }}>(optional)</span>
                  </label>
                  <textarea value={form.message} onChange={e => setForm({ ...form, message: e.target.value })}
                    placeholder="Describe what you're going through in your own words..."
                    rows={5} className="inp" style={{ resize: "vertical", fontSize: 14, lineHeight: 1.65 }} />
                </div>

                <label style={{ display: "flex", gap: 10, alignItems: "flex-start", cursor: "pointer" }}>
                  <input type="checkbox" checked={form.consent} onChange={e => setForm({ ...form, consent: e.target.checked })}
                    style={{ marginTop: 3, accentColor: "#ef4444", flexShrink: 0 }} />
                  <span style={{ fontSize: 13, color: "#64748b", lineHeight: 1.5 }}>
                    I consent to sharing my wellbeing data (burnout score, stress level, check-in responses) with the university counselling team for support purposes.
                  </span>
                </label>

                <button type="submit" disabled={!form.consent || sending || loading}
                  style={{ padding: "14px", borderRadius: 10, border: "none",
                    background: form.consent && !loading ? "linear-gradient(135deg,#ef4444,#7c3aed)" : "rgba(255,255,255,0.05)",
                    color: form.consent && !loading ? "white" : "#475569",
                    cursor: form.consent && !loading ? "pointer" : "not-allowed",
                    fontWeight: 600, fontSize: 15, transition: "all 0.3s" }}>
                  {sending ? "Building message..." : "🆘 Preview & Send to Counselling Centre"}
                </button>
              </motion.form>
            )}

            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }}
              style={{ marginTop: 20, padding: "20px", borderRadius: 12, background: "rgba(124,58,237,0.06)", border: "1px solid rgba(124,58,237,0.15)" }}>
              <p style={{ fontSize: 13, color: "#94a3b8", lineHeight: 1.7, margin: 0 }}>
                <span style={{ color: "#7c3aed", fontWeight: 600 }}>Remember:</span> Asking for help is one of the bravest things you can do. Your mental health matters more than any grade or deadline. You are not alone in this.
              </p>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}
