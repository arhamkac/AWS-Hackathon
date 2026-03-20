"use client";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import axios from "axios";
import {
  AreaChart, Area, RadarChart, Radar, PolarGrid,
  PolarAngleAxis, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
} from "recharts";
import Header from "../components/Header";
import ParticleBackground from "../components/ParticleBackground";

const priorityColors: Record<string, string> = { critical: "#ef4444", high: "#f59e0b", medium: "#00d4ff", low: "#10b981" };

function StatCard({ label, value, sub, color, icon }: { label: string; value: string | number; sub?: string; color: string; icon: string }) {
  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
      style={{ padding: "20px", borderRadius: 14, background: "rgba(13,27,46,0.8)", border: `1px solid ${color}25` }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
        <span style={{ fontSize: 22 }}>{icon}</span>
        <span style={{ fontSize: 11, color, padding: "2px 8px", borderRadius: 8, background: `${color}15` }}>Live</span>
      </div>
      <div style={{ fontSize: 28, fontWeight: 800, color, marginBottom: 4 }}>{value}</div>
      <div style={{ fontSize: 13, color: "#94a3b8", fontWeight: 500 }}>{label}</div>
      {sub && <div style={{ fontSize: 11, color: "#475569", marginTop: 4 }}>{sub}</div>}
    </motion.div>
  );
}

function RiskBar({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div style={{ marginBottom: 16 }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6, fontSize: 13 }}>
        <span style={{ color: "#94a3b8" }}>{label}</span>
        <span style={{ color, fontWeight: 700 }}>{value}%</span>
      </div>
      <div className="progress-bar">
        <motion.div className="progress-fill" style={{ background: color }}
          initial={{ width: 0 }} animate={{ width: `${value}%` }} transition={{ duration: 1, ease: "easeOut" }} />
      </div>
    </div>
  );
}

const CustomTooltip = ({ active, payload, label }: { active?: boolean; payload?: { color: string; name: string; value: number }[]; label?: string }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: "rgba(13,27,46,0.95)", border: "1px solid rgba(0,212,255,0.2)", borderRadius: 10, padding: "10px 14px" }}>
      <p style={{ color: "#64748b", fontSize: 12, marginBottom: 6 }}>{label}</p>
      {payload.map((p, i) => (
        <p key={i} style={{ color: p.color, fontSize: 13, fontWeight: 600 }}>{p.name}: {p.value}{p.name === "sleep" ? "h" : "%"}</p>
      ))}
    </div>
  );
};

interface UserProfile {
  name: string;
  email: string;
  academic?: { branch: string; currentCGPA: number; rollNumber?: string; semester?: string; year?: number };
  goals?: { selectedGoals: string[] };
}

interface LatestSnapshot {
  stress: number; burnout: number; anxiety: number;
  sleep: number; assignmentCount: number; pendingHours: number; wellbeing: number;
}

// Fallback placeholder data for users with no check-ins yet
const PLACEHOLDER_CHART = [
  { day: "Mon", stress: 45, burnout: 38, anxiety: 30, sleep: 65, mood: 70 },
  { day: "Tue", stress: 52, burnout: 44, anxiety: 38, sleep: 48, mood: 60 },
  { day: "Wed", stress: 68, burnout: 60, anxiety: 55, sleep: 30, mood: 45 },
  { day: "Thu", stress: 72, burnout: 65, anxiety: 60, sleep: 40, mood: 40 },
  { day: "Fri", stress: 58, burnout: 50, anxiety: 45, sleep: 55, mood: 58 },
  { day: "Sat", stress: 40, burnout: 35, anxiety: 28, sleep: 88, mood: 80 },
  { day: "Sun", stress: 35, burnout: 30, anxiety: 22, sleep: 100, mood: 90 },
];
const PLACEHOLDER_RADAR = [
  { subject: "Sleep", value: 65 }, { subject: "Mood", value: 72 },
  { subject: "Exercise", value: 40 }, { subject: "Nutrition", value: 60 },
  { subject: "Social", value: 55 }, { subject: "Wellbeing", value: 70 },
];

export default function Dashboard() {
  const [currentTime, setCurrentTime] = useState("");
  const [user, setUser] = useState<UserProfile | null>(null);
  const [chartData, setChartData] = useState(PLACEHOLDER_CHART);
  const [radarData, setRadarData] = useState(PLACEHOLDER_RADAR);
  const [latest, setLatest] = useState<LatestSnapshot | null>(null);
  const [hasRealData, setHasRealData] = useState(false);

  useEffect(() => {
    axios.get("/api/profile", { withCredentials: true })
      .then(r => { if (r.data.success) { setUser(r.data.user); } })
      .catch(() => {});

    axios.get("/api/dashboard/stats", { withCredentials: true })
      .then(r => {
        if (r.data.success && r.data.chartData.length > 0) {
          setChartData(r.data.chartData);
          setRadarData(r.data.radarData);
          setLatest(r.data.latestSnapshot);
          setHasRealData(true);
        }
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    const tick = () => setCurrentTime(new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" }));
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  const stress   = latest?.stress   ?? 68;
  const burnout  = latest?.burnout  ?? 62;
  const anxiety  = latest?.anxiety  ?? 55;
  const wellbeing = latest?.wellbeing ?? 60;

  // Sleep: convert raw choice val (5–100) to approximate hours (3–8.5h)
  const sleepRaw = latest?.sleep ?? 0;
  const sleepHours = sleepRaw > 0 ? (3 + (sleepRaw / 100) * 5.5).toFixed(1) : "—";
  const avgSleep = hasRealData && chartData.length > 0
    ? (chartData.reduce((s, d) => s + (3 + (d.sleep / 100) * 5.5), 0) / chartData.length).toFixed(1)
    : "—";

  const bestAction = stress >= 70
    ? "Take a 15-minute break right now. Your stress is elevated — step away from screens."
    : burnout >= 60
    ? "Focus on your highest-priority task first. Break it into 25-min Pomodoro sessions."
    : wellbeing >= 70
    ? "You're in a great state today. Use this energy to tackle your most important goal."
    : "You're in a manageable state. Keep your momentum going with focused work blocks.";

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg)", position: "relative" }}>
      <ParticleBackground />
      <Header />

      <div style={{ paddingTop: 80, padding: "80px 24px 60px", maxWidth: 1400, margin: "0 auto", position: "relative", zIndex: 1 }}>

        {/* Top bar */}
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
          style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 28, flexWrap: "wrap", gap: 12 }}>
          <div>
            <h1 style={{ fontSize: "clamp(1.4rem, 3vw, 2rem)", fontWeight: 700, marginBottom: 4 }}>
              Welcome back, <span className="gradient-text">{(user?.name || "Student").split(" ")[0]}</span> 👋
            </h1>
            <p style={{ color: "#64748b", fontSize: 14 }}>
              {user?.academic?.branch || "Your Branch"} · {user?.academic?.year ? `Year ${user.academic.year}` : ""} · Roll: {user?.academic?.rollNumber || "—"}
            </p>
          </div>
          <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
            <div style={{ padding: "8px 16px", borderRadius: 10, background: "rgba(13,27,46,0.8)", border: "1px solid rgba(0,212,255,0.1)", fontSize: 13, color: "#64748b", fontFamily: "monospace" }}>
              🕐 {currentTime}
            </div>
            <a href="/checkin">
              <button className="btn" style={{ fontSize: 13, padding: "10px 20px" }}>+ New Check-In</button>
            </a>
          </div>
        </motion.div>

        {/* Best action banner */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          style={{ padding: "16px 24px", borderRadius: 12, background: "linear-gradient(135deg, rgba(0,212,255,0.08), rgba(124,58,237,0.08))",
            border: "1px solid rgba(0,212,255,0.2)", marginBottom: 28, display: "flex", gap: 14, alignItems: "center" }}>
          <span style={{ fontSize: 28 }}>🎯</span>
          <div>
            <div style={{ fontSize: 12, color: "#00d4ff", fontWeight: 600, marginBottom: 3 }}>
              {hasRealData ? "BASED ON YOUR LATEST CHECK-IN" : "BEST ACTION RIGHT NOW"}
            </div>
            <div style={{ fontSize: 15, color: "#e2e8f0" }}>{bestAction}</div>
          </div>
          {!hasRealData && (
            <a href="/checkin" style={{ marginLeft: "auto", flexShrink: 0 }}>
              <button className="btn-soft" style={{ fontSize: 12, padding: "8px 16px" }}>Do First Check-In →</button>
            </a>
          )}
        </motion.div>

        {/* Main grid */}
        <div style={{ display: "grid", gridTemplateColumns: "280px 1fr", gap: 24, marginBottom: 24 }}>

          {/* User info panel */}
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}
            style={{ borderRadius: 20, background: "rgba(13,27,46,0.8)", border: "1px solid rgba(192,132,252,0.15)", overflow: "hidden", display: "flex", flexDirection: "column" }}>
            <div style={{ padding: "28px 20px", display: "flex", flexDirection: "column", alignItems: "center", gap: 12, borderBottom: "1px solid rgba(192,132,252,0.08)" }}>
              <div style={{ width: 72, height: 72, borderRadius: "50%", background: "linear-gradient(135deg,#ff6eb4,#c084fc)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 26, fontWeight: 700, color: "#fff" }}>
                {(user?.name || "S").split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase()}
              </div>
              <div style={{ textAlign: "center" }}>
                <div style={{ fontWeight: 700, fontSize: 15, color: "#e2e8f0" }}>{user?.name || "Student"}</div>
                <div style={{ fontSize: 11, color: "#64748b", marginTop: 2 }}>CGPA: {user?.academic?.currentCGPA ?? "—"} · {user?.academic?.semester || ""}</div>
              </div>
            </div>
            <div style={{ padding: "16px" }}>
              <RiskBar label="Burnout"  value={burnout}  color="#ef4444" />
              <RiskBar label="Stress"   value={stress}   color="#f59e0b" />
              <RiskBar label="Anxiety"  value={anxiety}  color="#7c3aed" />
              {latest && (
                <a href={`/results?burnout=${burnout}&stress=${stress}&anxiety=${anxiety}&sleep=${latest.sleep}&wellbeing=${wellbeing}`}>
                  <button style={{ width: "100%", marginTop: 8, padding: "9px", borderRadius: 8, border: "1px solid rgba(192,132,252,0.2)", background: "rgba(192,132,252,0.06)", color: "#c084fc", cursor: "pointer", fontSize: 12, fontWeight: 600 }}>
                    View Full Report →
                  </button>
                </a>
              )}
            </div>
          </motion.div>

          {/* Right: stats + charts */}
          <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>

            {/* Stat cards */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16 }}>
              <StatCard label="Pending Tasks"    value={latest?.assignmentCount ?? "—"} icon="📝" color="#f59e0b" sub={latest ? `~${latest.pendingHours.toFixed(0)}h of work` : "Do a check-in"} />
              <StatCard label="Stress Level"     value={latest ? `${stress}%` : "—"}    icon="⚡" color="#ef4444" sub={latest ? (stress >= 70 ? "High — take a break" : stress >= 40 ? "Moderate" : "Low — great!") : "No data yet"} />
              <StatCard label="Last Sleep"       value={sleepHours === "—" ? "—" : `${sleepHours}h`} icon="😴" color="#6366f1" sub={avgSleep === "—" ? "No data yet" : `Avg: ${avgSleep}h`} />
              <StatCard label="CGPA"             value={user?.academic?.currentCGPA ?? "—"} icon="🎓" color="#10b981" sub="This semester" />
            </div>

            {/* Stress trend chart */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
              style={{ padding: "24px", borderRadius: 16, background: "rgba(13,27,46,0.8)", border: "1px solid rgba(0,212,255,0.1)" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
                <div style={{ fontSize: 15, fontWeight: 600, color: "#e2e8f0" }}>📈 Stress & Burnout Trend</div>
                {!hasRealData && <span style={{ fontSize: 11, color: "#475569", padding: "3px 8px", borderRadius: 6, background: "rgba(255,255,255,0.04)" }}>Sample data — do a check-in</span>}
              </div>
              <ResponsiveContainer width="100%" height={180}>
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="stressGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%"  stopColor="#f59e0b" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="burnoutGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%"  stopColor="#ef4444" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                  <XAxis dataKey="day" tick={{ fill: "#64748b", fontSize: 12 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: "#64748b", fontSize: 12 }} axisLine={false} tickLine={false} domain={[0, 100]} />
                  <Tooltip content={<CustomTooltip />} />
                  <Area type="monotone" dataKey="stress"  name="stress"  stroke="#f59e0b" fill="url(#stressGrad)"  strokeWidth={2} dot={false} />
                  <Area type="monotone" dataKey="burnout" name="burnout" stroke="#ef4444" fill="url(#burnoutGrad)" strokeWidth={2} dot={false} />
                  <Area type="monotone" dataKey="anxiety" name="anxiety" stroke="#7c3aed" fill="none"              strokeWidth={2} dot={false} />
                </AreaChart>
              </ResponsiveContainer>
            </motion.div>
          </div>
        </div>

        {/* Bottom grid */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: 20 }}>

          {/* Mood trend */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
            style={{ padding: "24px", borderRadius: 16, background: "rgba(13,27,46,0.8)", border: "1px solid rgba(0,212,255,0.1)" }}>
            <div style={{ fontSize: 15, fontWeight: 600, color: "#e2e8f0", marginBottom: 16 }}>😊 Mood Trend</div>
            <ResponsiveContainer width="100%" height={160}>
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="moodGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor="#00ffa3" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#00ffa3" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                <XAxis dataKey="day" tick={{ fill: "#64748b", fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: "#64748b", fontSize: 11 }} axisLine={false} tickLine={false} domain={[0, 100]} />
                <Tooltip content={<CustomTooltip />} />
                <Area type="monotone" dataKey="mood" name="mood" stroke="#00ffa3" fill="url(#moodGrad)" strokeWidth={2} dot={{ fill: "#00ffa3", r: 3 }} />
              </AreaChart>
            </ResponsiveContainer>
          </motion.div>

          {/* Sleep chart */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}
            style={{ padding: "24px", borderRadius: 16, background: "rgba(13,27,46,0.8)", border: "1px solid rgba(0,212,255,0.1)" }}>
            <div style={{ fontSize: 15, fontWeight: 600, color: "#e2e8f0", marginBottom: 16 }}>😴 Sleep Quality</div>
            <ResponsiveContainer width="100%" height={160}>
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="sleepGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor="#6366f1" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                <XAxis dataKey="day" tick={{ fill: "#64748b", fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: "#64748b", fontSize: 11 }} axisLine={false} tickLine={false} domain={[0, 100]} />
                <Tooltip content={<CustomTooltip />} />
                <Area type="monotone" dataKey="sleep" name="sleep" stroke="#6366f1" fill="url(#sleepGrad)" strokeWidth={2} dot={{ fill: "#6366f1", r: 3 }} />
              </AreaChart>
            </ResponsiveContainer>
            <div style={{ display: "flex", justifyContent: "space-between", marginTop: 8, fontSize: 11, color: "#475569" }}>
              <span>Avg: {avgSleep}h</span>
              <span style={{ color: "#ef4444" }}>Target: 7–8h</span>
            </div>
          </motion.div>

          {/* Wellbeing breakdown */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
            style={{ padding: "24px", borderRadius: 16, background: "rgba(13,27,46,0.8)", border: "1px solid rgba(0,212,255,0.1)" }}>
            <div style={{ fontSize: 15, fontWeight: 600, color: "#e2e8f0", marginBottom: 16 }}>💪 Wellbeing Factors</div>
            <ResponsiveContainer width="100%" height={160}>
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="exGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor="#f59e0b" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="nutGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor="#10b981" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                <XAxis dataKey="day" tick={{ fill: "#64748b", fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: "#64748b", fontSize: 11 }} axisLine={false} tickLine={false} domain={[0, 100]} />
                <Tooltip content={<CustomTooltip />} />
                <Area type="monotone" dataKey="exercise"  name="exercise"  stroke="#f59e0b" fill="url(#exGrad)"  strokeWidth={2} dot={false} />
                <Area type="monotone" dataKey="nutrition" name="nutrition" stroke="#10b981" fill="url(#nutGrad)" strokeWidth={2} dot={false} />
                <Area type="monotone" dataKey="social"    name="social"    stroke="#00d4ff" fill="none"          strokeWidth={2} dot={false} />
              </AreaChart>
            </ResponsiveContainer>
          </motion.div>

          {/* Radar chart */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.45 }}
            style={{ padding: "24px", borderRadius: 16, background: "rgba(13,27,46,0.8)", border: "1px solid rgba(0,212,255,0.1)" }}>
            <div style={{ fontSize: 15, fontWeight: 600, color: "#e2e8f0", marginBottom: 8 }}>🕸️ Wellbeing Radar</div>
            <div style={{ fontSize: 11, color: "#475569", marginBottom: 8 }}>7-day average</div>
            <ResponsiveContainer width="100%" height={190}>
              <RadarChart data={radarData}>
                <PolarGrid stroke="rgba(0,212,255,0.1)" />
                <PolarAngleAxis dataKey="subject" tick={{ fill: "#64748b", fontSize: 11 }} />
                <Radar name="You" dataKey="value" stroke="#00d4ff" fill="#00d4ff" fillOpacity={0.15} strokeWidth={2} />
                <Tooltip content={<CustomTooltip />} />
              </RadarChart>
            </ResponsiveContainer>
          </motion.div>
        </div>

        {/* AI Recommendations */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}
          style={{ marginTop: 24, padding: "28px", borderRadius: 16, background: "rgba(13,27,46,0.8)", border: "1px solid rgba(124,58,237,0.15)" }}>
          <div style={{ fontSize: 15, fontWeight: 600, color: "#e2e8f0", marginBottom: 20 }}>🤖 AI Recommendations</div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 14 }}>
            {[
              { icon: "🔥", title: "Burnout",      desc: burnout >= 60 ? `Burnout at ${burnout}%. Avoid adding new tasks today.` : `Burnout at ${burnout}% — manageable. Keep recovery habits.`, color: "#ef4444" },
              { icon: "😴", title: "Sleep",        desc: sleepHours !== "—" && parseFloat(sleepHours as string) < 6.5 ? `Only ${sleepHours}h last night. Aim for 7–8h tonight.` : "Sleep looks okay. Maintain your schedule.", color: "#6366f1" },
              { icon: "⚡", title: "Stress",       desc: stress >= 70 ? "High stress detected. Take a 10-min walk after your next session." : "Stress is manageable. Keep using focused work blocks.", color: "#f59e0b" },
              { icon: "🧘", title: "Wellbeing",    desc: wellbeing < 50 ? "Wellbeing is low. Prioritise one healthy habit today." : "Wellbeing is decent. Keep up exercise and nutrition.", color: "#10b981" },
              { icon: "💬", title: "Check-In",     desc: hasRealData ? "Your twin is tracking your patterns. Keep checking in daily." : "Do your first check-in to get personalised insights.", color: "#00d4ff" },
            ].map((r, i) => (
              <div key={i} style={{ padding: "16px", borderRadius: 12, background: `${r.color}08`, border: `1px solid ${r.color}20` }}>
                <div style={{ fontSize: 22, marginBottom: 8 }}>{r.icon}</div>
                <div style={{ fontSize: 13, fontWeight: 600, color: r.color, marginBottom: 4 }}>{r.title}</div>
                <div style={{ fontSize: 12, color: "#64748b", lineHeight: 1.5 }}>{r.desc}</div>
              </div>
            ))}
          </div>
        </motion.div>

      </div>
    </div>
  );
}
