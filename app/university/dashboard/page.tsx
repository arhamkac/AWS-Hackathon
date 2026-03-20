"use client";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";
import { useRouter } from "next/navigation";

type AlertSeverity = "warning" | "critical" | "emergency";
type AlertStatus   = "pending" | "reviewed" | "resolved";

interface Alert {
  _id: string;
  studentName: string;
  studentRoll: string;
  studentBranch: string;
  severity: AlertSeverity;
  status: AlertStatus;
  scores: { stress: number; burnout: number; anxiety: number; wellbeing: number };
  summary: string;
  reviewNote?: string;
  createdAt: string;
}

interface University {
  name: string;
  code: string;
  contactEmail: string;
}

const SEV_COLOR: Record<AlertSeverity, string> = {
  warning:   "#f59e0b",
  critical:  "#ef4444",
  emergency: "#ff0055",
};
const SEV_BG: Record<AlertSeverity, string> = {
  warning:   "rgba(245,158,11,0.08)",
  critical:  "rgba(239,68,68,0.08)",
  emergency: "rgba(255,0,85,0.12)",
};
const STATUS_COLOR: Record<AlertStatus, string> = {
  pending:  "#f59e0b",
  reviewed: "#00d4ff",
  resolved: "#10b981",
};

function ScorePill({ label, value, warn }: { label: string; value: number; warn: number }) {
  const color = value >= warn ? "#ef4444" : value >= warn * 0.75 ? "#f59e0b" : "#10b981";
  return (
    <div style={{ textAlign: "center" }}>
      <div style={{ fontSize: 18, fontWeight: 800, color }}>{value}</div>
      <div style={{ fontSize: 10, color: "#64748b", marginTop: 1 }}>{label}</div>
    </div>
  );
}

export default function UniversityDashboard() {
  const router = useRouter();
  const [uni, setUni] = useState<University | null>(null);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [counts, setCounts] = useState({ pending: 0, reviewed: 0, resolved: 0 });
  const [filter, setFilter] = useState<"all" | AlertStatus>("all");
  const [expanded, setExpanded] = useState<string | null>(null);
  const [resolving, setResolving] = useState<string | null>(null);
  const [reviewNote, setReviewNote] = useState("");
  const [loading, setLoading] = useState(true);

  const fetchData = async (status = filter) => {
    try {
      const res = await axios.get(`/api/university/dashboard?status=${status}`);
      if (res.data.success) {
        setUni(res.data.university);
        setAlerts(res.data.alerts);
        setCounts(res.data.counts);
      } else {
        router.push("/university");
      }
    } catch {
      router.push("/university");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const handleFilter = (f: typeof filter) => {
    setFilter(f);
    fetchData(f);
  };

  const handleResolve = async (alertId: string, status: AlertStatus) => {
    setResolving(alertId);
    try {
      await axios.patch("/api/university/alert/resolve", { alertId, status, reviewNote: reviewNote || undefined });
      setReviewNote("");
      setExpanded(null);
      fetchData();
    } catch { /* ignore */ }
    finally { setResolving(null); }
  };

  const handleLogout = async () => {
    await axios.delete("/api/university/login");
    router.push("/university");
  };

  if (loading) return (
    <div style={{ minHeight: "100vh", background: "var(--bg)", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ color: "#64748b", fontSize: 14 }}>Loading dashboard...</div>
    </div>
  );

  const total = counts.pending + counts.reviewed + counts.resolved;

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg)", color: "#e2e8f0" }}>

      {/* Top nav */}
      <div style={{ position: "sticky", top: 0, zIndex: 50, background: "rgba(7,15,30,0.95)", backdropFilter: "blur(12px)",
        borderBottom: "1px solid rgba(0,212,255,0.1)", padding: "0 32px" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", height: 60, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{ width: 36, height: 36, borderRadius: 10, background: "linear-gradient(135deg,#00d4ff,#7c3aed)",
              display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18 }}>🏛️</div>
            <div>
              <div style={{ fontWeight: 700, fontSize: 15, color: "#e2e8f0" }}>{uni?.name}</div>
              <div style={{ fontSize: 11, color: "#64748b" }}>{uni?.code} · Counselling Dashboard</div>
            </div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <div style={{ fontSize: 12, color: "#64748b" }}>{uni?.contactEmail}</div>
            <button onClick={handleLogout}
              style={{ padding: "7px 16px", borderRadius: 8, border: "1px solid rgba(255,77,109,0.3)",
                background: "rgba(255,77,109,0.06)", color: "#ff4d6d", cursor: "pointer", fontSize: 12, fontWeight: 600 }}>
              Logout
            </button>
          </div>
        </div>
      </div>

      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "32px 32px 60px" }}>

        {/* Stats row */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16, marginBottom: 28 }}>
          {[
            { label: "Total Alerts",    value: total,           color: "#00d4ff", icon: "🔔" },
            { label: "Pending",         value: counts.pending,  color: "#f59e0b", icon: "⏳" },
            { label: "Reviewed",        value: counts.reviewed, color: "#00d4ff", icon: "👁️" },
            { label: "Resolved",        value: counts.resolved, color: "#10b981", icon: "✅" },
          ].map((s, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
              style={{ padding: "20px 24px", borderRadius: 14, background: "rgba(13,27,46,0.8)", border: `1px solid ${s.color}20` }}>
              <div style={{ fontSize: 22, marginBottom: 8 }}>{s.icon}</div>
              <div style={{ fontSize: 30, fontWeight: 800, color: s.color }}>{s.value}</div>
              <div style={{ fontSize: 13, color: "#64748b", marginTop: 2 }}>{s.label}</div>
            </motion.div>
          ))}
        </div>

        {/* Filter tabs */}
        <div style={{ display: "flex", gap: 8, marginBottom: 20 }}>
          {(["all", "pending", "reviewed", "resolved"] as const).map(f => (
            <button key={f} onClick={() => handleFilter(f)}
              style={{ padding: "7px 18px", borderRadius: 20, border: "1px solid",
                borderColor: filter === f ? "#00d4ff" : "rgba(255,255,255,0.08)",
                background: filter === f ? "rgba(0,212,255,0.1)" : "transparent",
                color: filter === f ? "#00d4ff" : "#64748b",
                cursor: "pointer", fontSize: 13, fontWeight: 600, transition: "all 0.2s", textTransform: "capitalize" }}>
              {f === "all" ? `All (${total})` : `${f} (${counts[f as AlertStatus] ?? 0})`}
            </button>
          ))}
        </div>

        {/* Alert list */}
        {alerts.length === 0 ? (
          <div style={{ textAlign: "center", padding: "60px 0", color: "#475569" }}>
            <div style={{ fontSize: 40, marginBottom: 12 }}>✅</div>
            <div style={{ fontSize: 16, fontWeight: 600, color: "#64748b" }}>No alerts in this category</div>
            <div style={{ fontSize: 13, marginTop: 6 }}>Students are doing well, or no check-ins have triggered thresholds yet.</div>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {alerts.map((alert, i) => (
              <motion.div key={alert._id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}
                style={{ borderRadius: 14, background: SEV_BG[alert.severity], border: `1px solid ${SEV_COLOR[alert.severity]}30`, overflow: "hidden" }}>

                {/* Alert header */}
                <div style={{ padding: "18px 24px", display: "flex", alignItems: "center", gap: 16, cursor: "pointer" }}
                  onClick={() => setExpanded(expanded === alert._id ? null : alert._id)}>

                  {/* Severity badge */}
                  <div style={{ width: 10, height: 10, borderRadius: "50%", background: SEV_COLOR[alert.severity],
                    boxShadow: `0 0 8px ${SEV_COLOR[alert.severity]}`, flexShrink: 0 }} />

                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 3, flexWrap: "wrap" }}>
                      <span style={{ fontWeight: 700, fontSize: 15, color: "#e2e8f0" }}>{alert.studentName}</span>
                      <span style={{ fontSize: 11, padding: "2px 8px", borderRadius: 6,
                        background: `${SEV_COLOR[alert.severity]}18`, color: SEV_COLOR[alert.severity],
                        fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em" }}>{alert.severity}</span>
                      <span style={{ fontSize: 11, padding: "2px 8px", borderRadius: 6,
                        background: `${STATUS_COLOR[alert.status]}12`, color: STATUS_COLOR[alert.status],
                        fontWeight: 600, textTransform: "capitalize" }}>{alert.status}</span>
                    </div>
                    <div style={{ fontSize: 12, color: "#64748b" }}>
                      {alert.studentRoll} · {alert.studentBranch} · {new Date(alert.createdAt).toLocaleString("en-IN", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}
                    </div>
                  </div>

                  {/* Score pills */}
                  <div style={{ display: "flex", gap: 20, flexShrink: 0 }}>
                    <ScorePill label="Stress"   value={alert.scores.stress}   warn={70} />
                    <ScorePill label="Burnout"  value={alert.scores.burnout}  warn={70} />
                    <ScorePill label="Anxiety"  value={alert.scores.anxiety}  warn={70} />
                    <ScorePill label="Wellbeing" value={alert.scores.wellbeing} warn={30} />
                  </div>

                  <div style={{ color: "#475569", fontSize: 18, flexShrink: 0 }}>{expanded === alert._id ? "▲" : "▼"}</div>
                </div>

                {/* Expanded detail */}
                <AnimatePresence>
                  {expanded === alert._id && (
                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.25 }} style={{ overflow: "hidden" }}>
                      <div style={{ padding: "0 24px 24px", borderTop: `1px solid ${SEV_COLOR[alert.severity]}15` }}>

                        {/* AI Summary */}
                        <div style={{ marginTop: 18, padding: "16px 20px", borderRadius: 12,
                          background: "rgba(0,212,255,0.04)", border: "1px solid rgba(0,212,255,0.12)" }}>
                          <div style={{ fontSize: 11, fontWeight: 700, color: "#00d4ff", textTransform: "uppercase",
                            letterSpacing: "0.08em", marginBottom: 10 }}>🤖 AI-Generated Summary</div>
                          <p style={{ fontSize: 14, color: "#94a3b8", lineHeight: 1.7, margin: 0 }}>{alert.summary}</p>
                        </div>

                        {/* Existing review note */}
                        {alert.reviewNote && (
                          <div style={{ marginTop: 12, padding: "12px 16px", borderRadius: 10,
                            background: "rgba(16,185,129,0.06)", border: "1px solid rgba(16,185,129,0.15)" }}>
                            <div style={{ fontSize: 11, fontWeight: 700, color: "#10b981", marginBottom: 6 }}>COUNSELLOR NOTE</div>
                            <p style={{ fontSize: 13, color: "#94a3b8", margin: 0 }}>{alert.reviewNote}</p>
                          </div>
                        )}

                        {/* Actions */}
                        {alert.status !== "resolved" && (
                          <div style={{ marginTop: 16, display: "flex", flexDirection: "column", gap: 10 }}>
                            <textarea
                              value={resolving === alert._id ? reviewNote : ""}
                              onChange={e => setReviewNote(e.target.value)}
                              onFocus={() => setResolving(alert._id)}
                              placeholder="Add a counsellor note (optional)..."
                              className="inp"
                              style={{ minHeight: 72, fontSize: 13, resize: "vertical" }} />
                            <div style={{ display: "flex", gap: 10 }}>
                              {alert.status === "pending" && (
                                <button onClick={() => handleResolve(alert._id, "reviewed")}
                                  style={{ padding: "9px 20px", borderRadius: 9, border: "1px solid rgba(0,212,255,0.3)",
                                    background: "rgba(0,212,255,0.08)", color: "#00d4ff", cursor: "pointer", fontSize: 13, fontWeight: 600 }}>
                                  Mark as Reviewed
                                </button>
                              )}
                              <button onClick={() => handleResolve(alert._id, "resolved")}
                                style={{ padding: "9px 20px", borderRadius: 9, border: "1px solid rgba(16,185,129,0.3)",
                                  background: "rgba(16,185,129,0.08)", color: "#10b981", cursor: "pointer", fontSize: 13, fontWeight: 600 }}>
                                Mark as Resolved ✓
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
