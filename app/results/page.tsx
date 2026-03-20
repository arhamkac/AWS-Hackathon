"use client";
import { useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import axios from "axios";
import Header from "../components/Header";
import ParticleBackground from "../components/ParticleBackground";

function Arc({ value, color, size = 140 }: { value: number; color: string; size?: number }) {
  const r = size / 2 - 12;
  const circ = 2 * Math.PI * r;
  const [displayed, setDisplayed] = useState(0);
  useEffect(() => { const t = setTimeout(() => setDisplayed(value), 300); return () => clearTimeout(t); }, [value]);
  return (
    <div style={{ position: "relative", width: size, height: size }}>
      <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="rgba(255,255,255,0.04)" strokeWidth={10} />
        <motion.circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={color} strokeWidth={10}
          strokeLinecap="round" strokeDasharray={circ}
          initial={{ strokeDashoffset: circ }}
          animate={{ strokeDashoffset: circ * (1 - displayed / 100) }}
          transition={{ duration: 1.4, ease: "easeOut", delay: 0.2 }}
          style={{ filter: `drop-shadow(0 0 8px ${color}80)` }} />
      </svg>
      <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
        <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.9 }}
          style={{ fontSize: 26, fontWeight: 900, color, letterSpacing: "-0.04em" }}>{displayed}</motion.span>
        <span style={{ fontSize: 10, color: "#6b5a80", fontWeight: 700 }}>/ 100</span>
      </div>
    </div>
  );
}

// Star rating for feedback
function StarRating({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  return (
    <div style={{ display: "flex", gap: 6 }}>
      {[1, 2, 3, 4, 5].map(s => (
        <button key={s} onClick={() => onChange(s)}
          style={{ background: "none", border: "none", cursor: "pointer", fontSize: 22,
            color: s <= value ? "#ffcc00" : "rgba(255,255,255,0.15)", transition: "color 0.15s" }}>
          ★
        </button>
      ))}
    </div>
  );
}

const SUGGESTIONS: Record<string, { title: string; items: string[] }> = {
  critical: {
    title: "Immediate actions — do these today",
    items: [
      "Stop adding new tasks. Freeze your to-do list right now.",
      "Tell someone you trust how you're feeling — a friend, family member, or counsellor.",
      "Sleep must be your #1 priority tonight — set a hard cutoff at 10:30 PM.",
      "Identify the single most urgent task and do only that for the next 90 minutes.",
      "Eat a proper meal before doing anything else.",
    ],
  },
  high: {
    title: "High priority — act within 24 hours",
    items: [
      "Break your biggest pending task into 3 micro-steps and start the first one now.",
      "Use the Pomodoro method: 25 min focused work, 5 min break — no exceptions.",
      "Communicate with professors if deadlines are genuinely impossible to meet.",
      "Aim for 7 hours of sleep tonight — set an alarm for bedtime, not just wake-up.",
      "Take a 15-minute walk outside before your next study session.",
    ],
  },
  moderate: {
    title: "Recommended actions for this week",
    items: [
      "Schedule your tasks by urgency × difficulty — hardest + most urgent goes first.",
      "Block 90-minute deep work sessions with phone in another room.",
      "Reach out to a classmate to study together — social learning reduces anxiety.",
      "Prepare tomorrow's to-do list tonight before sleeping.",
      "Add one enjoyable activity to your schedule this week — non-negotiable.",
    ],
  },
  low: {
    title: "Maintain your momentum",
    items: [
      "You're in a good state — use this window to get ahead on upcoming work.",
      "Keep your sleep schedule consistent — don't break it on weekends.",
      "Help a stressed classmate — it reinforces your own learning and boosts mood.",
      "Review your goals from your profile — are you on track?",
    ],
  },
};

function ResultsContent() {
  const params = useSearchParams();
  const burnout   = parseInt(params.get("burnout")   || "45");
  const stress    = parseInt(params.get("stress")    || "50");
  const anxiety   = parseInt(params.get("anxiety")   || "40");
  const sleep     = parseInt(params.get("sleep")     || "70");
  const wellbeing = parseInt(params.get("wellbeing") || "60");
  const tasks     = parseInt(params.get("tasks")     || "0");
  const logId     = params.get("logId") || "";
  const aiText    = params.get("ai") ? decodeURIComponent(params.get("ai")!) : "";

  const max = Math.max(burnout, stress, anxiety);
  const tier = max >= 80 ? "critical" : max >= 60 ? "high" : max >= 35 ? "moderate" : "low";
  const tierConfig = {
    critical: { label: "Critical — Immediate Attention", color: "#ff3b5c", bg: "rgba(255,59,92,0.08)",  border: "rgba(255,59,92,0.3)" },
    high:     { label: "High Risk — Act Today",          color: "#ff8c42", bg: "rgba(255,140,66,0.08)", border: "rgba(255,140,66,0.3)" },
    moderate: { label: "Moderate — Monitor Closely",     color: "#ffcc00", bg: "rgba(255,204,0,0.08)",  border: "rgba(255,204,0,0.3)" },
    low:      { label: "Low Risk — You're Doing Well",   color: "#00ffa3", bg: "rgba(0,255,163,0.08)",  border: "rgba(0,255,163,0.3)" },
  }[tier];
  const sugg = SUGGESTIONS[tier];

  // Feedback state
  const [rating, setRating] = useState(0);
  const [helpful, setHelpful] = useState<boolean | null>(null);
  const [feedbackNote, setFeedbackNote] = useState("");
  const [feedbackSent, setFeedbackSent] = useState(false);
  const [sendingFeedback, setSendingFeedback] = useState(false);

  const submitFeedback = async () => {
    if (!logId || rating === 0) return;
    setSendingFeedback(true);
    try {
      await axios.post("/api/checkin/feedback", {
        logId, helpful: helpful ?? true, accuracyRating: rating, note: feedbackNote,
      }, { withCredentials: true });
      setFeedbackSent(true);
    } catch { /* silent */ }
    setSendingFeedback(false);
  };

  return (
    <div style={{ paddingTop: 62, minHeight: "100vh", padding: "80px 24px 60px",
      position: "relative", zIndex: 1, maxWidth: 960, margin: "0 auto" }}>

      {/* Status banner */}
      <motion.div initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }}
        style={{ padding: "14px 20px", borderRadius: 14, background: tierConfig.bg,
          border: `1px solid ${tierConfig.border}`, marginBottom: 36,
          display: "flex", alignItems: "center", gap: 12 }}>
        <span style={{ width: 8, height: 8, borderRadius: "50%", background: tierConfig.color,
          boxShadow: `0 0 10px ${tierConfig.color}`, display: "inline-block", flexShrink: 0 }} className="pulse-dot" />
        <div>
          <div style={{ fontWeight: 800, color: tierConfig.color, fontSize: 14 }}>{tierConfig.label}</div>
          <div style={{ fontSize: 12, color: "#6b5a80", marginTop: 1 }}>
            Based on today's check-in · {new Date().toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "short" })}
          </div>
        </div>
      </motion.div>

      {/* Title */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: "clamp(1.8rem,4vw,2.6rem)", fontWeight: 900, letterSpacing: "-0.04em", marginBottom: 8 }}>
          Your <span style={{ background: "linear-gradient(135deg,#ff6eb4,#c084fc)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>Wellbeing Report</span>
        </h1>
        <p style={{ color: "#6b5a80", fontSize: 14 }}>AI analysis complete · {tasks} task{tasks !== 1 ? "s" : ""} factored in</p>
      </motion.div>

      {/* AI Twin Response */}
      {aiText && (
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          style={{ padding: "20px 24px", borderRadius: 16, marginBottom: 28,
            background: "linear-gradient(135deg,rgba(255,110,180,0.06),rgba(192,132,252,0.06))",
            border: "1px solid rgba(255,110,180,0.2)" }}>
          <div style={{ display: "flex", gap: 14, alignItems: "flex-start" }}>
            <div style={{ width: 38, height: 38, borderRadius: 11, flexShrink: 0,
              background: "linear-gradient(135deg,#ff6eb4,#c084fc)",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 16, fontWeight: 900, color: "#fff" }}>✦</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase",
                color: "#ff6eb4", marginBottom: 8 }}>Your Digital Twin says</div>
              <p style={{ fontSize: 15, color: "#e2e8f0", lineHeight: 1.7, fontStyle: "italic" }}>"{aiText}"</p>
            </div>
          </div>
        </motion.div>
      )}

      {/* Gauges */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 16, marginBottom: 28 }}>
        {[
          { label: "Burnout Risk",  val: burnout,  color: "#ff3b5c", desc: burnout  >= 70 ? "High — rest urgently needed"       : burnout  >= 40 ? "Moderate — watch your load"       : "Low — good balance" },
          { label: "Stress Level",  val: stress,   color: "#ffcc00", desc: stress   >= 70 ? "Elevated — intervention needed"     : stress   >= 40 ? "Noticeable — manage proactively"  : "Manageable — keep it up" },
          { label: "Anxiety Index", val: anxiety,  color: "#c084fc", desc: anxiety  >= 70 ? "High — grounding techniques needed" : anxiety  >= 40 ? "Present — breathing exercises help": "Low — stable mental state" },
        ].map((g, i) => (
          <motion.div key={i} initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.12 }}
            style={{ padding: "28px 20px", textAlign: "center", borderRadius: 16,
              background: "rgba(13,8,30,0.8)", border: "1px solid rgba(192,132,252,0.1)" }}>
            <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: "0.12em", textTransform: "uppercase",
              color: "#6b5a80", marginBottom: 16 }}>{g.label}</div>
            <div style={{ display: "flex", justifyContent: "center", marginBottom: 16 }}>
              <Arc value={g.val} color={g.color} />
            </div>
            <div style={{ fontSize: 12, color: "#6b5a80", lineHeight: 1.5 }}>{g.desc}</div>
            <div style={{ marginTop: 12, display: "inline-block", padding: "3px 12px", borderRadius: 100,
              background: `${g.color}15`, color: g.color, fontSize: 11, fontWeight: 700,
              border: `1px solid ${g.color}30` }}>
              {g.val >= 70 ? "High" : g.val >= 40 ? "Moderate" : "Low"} Risk
            </div>
          </motion.div>
        ))}
      </div>

      {/* Sleep + Wellbeing row */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 28 }}>
        {[
          { icon: "😴", label: "Sleep Score", val: sleep, color: "#6366f1",
            desc: sleep >= 70 ? "Good sleep is buffering your stress. Keep this up." : sleep >= 40 ? "Moderate sleep is limiting your cognitive capacity." : "Poor sleep is a major stress amplifier. Prioritise rest tonight." },
          { icon: "💚", label: "Wellbeing Score", val: wellbeing, color: "#00ffa3",
            desc: wellbeing >= 70 ? "Strong wellbeing foundation — exercise, nutrition, social all good." : wellbeing >= 40 ? "Moderate wellbeing — focus on one area to improve." : "Low wellbeing — small habits like a walk or a meal make a big difference." },
        ].map((item, i) => (
          <motion.div key={i} initial={{ opacity: 0, x: i === 0 ? -20 : 20 }} animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 + i * 0.05 }}
            style={{ padding: "22px", borderRadius: 16, background: "rgba(13,8,30,0.8)", border: "1px solid rgba(192,132,252,0.1)" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 14 }}>
              <div style={{ width: 36, height: 36, borderRadius: 10, background: `${item.color}15`,
                display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18 }}>{item.icon}</div>
              <div>
                <div style={{ fontWeight: 700, fontSize: 14, color: "#e2e8f0" }}>{item.label}</div>
                <div style={{ fontSize: 11, color: "#6b5a80" }}>{item.val}/100</div>
              </div>
            </div>
            <div className="pbar" style={{ marginBottom: 10 }}>
              <motion.div className="pbar-fill" style={{ background: item.color }}
                animate={{ width: `${item.val}%` }} transition={{ duration: 1.2, delay: 0.5 }} />
            </div>
            <p style={{ fontSize: 12, color: "#6b5a80", lineHeight: 1.6 }}>{item.desc}</p>
          </motion.div>
        ))}
      </div>

      {/* Suggestions */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.55 }}
        style={{ padding: "28px", borderRadius: 16, marginBottom: 28,
          background: "rgba(13,8,30,0.8)", border: "1px solid rgba(192,132,252,0.1)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 20 }}>
          <div style={{ width: 8, height: 8, borderRadius: "50%", background: tierConfig.color,
            boxShadow: `0 0 8px ${tierConfig.color}` }} />
          <h3 style={{ fontSize: 15, fontWeight: 800, color: "#e2e8f0" }}>{sugg.title}</h3>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {sugg.items.map((item, i) => (
            <motion.div key={i} initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.65 + i * 0.08 }}
              style={{ display: "flex", gap: 12, alignItems: "flex-start", padding: "12px 16px",
                borderRadius: 12, background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.05)" }}>
              <span style={{ fontSize: 11, fontWeight: 900, color: tierConfig.color, flexShrink: 0,
                width: 20, height: 20, borderRadius: "50%", background: `${tierConfig.color}15`,
                display: "flex", alignItems: "center", justifyContent: "center" }}>{i + 1}</span>
              <span style={{ fontSize: 13, color: "#94a3b8", lineHeight: 1.6 }}>{item}</span>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* AI Feedback widget */}
      {logId && !feedbackSent && (
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.8 }}
          style={{ padding: "24px 28px", borderRadius: 16, marginBottom: 28,
            background: "rgba(13,8,30,0.8)", border: "1px solid rgba(192,132,252,0.12)" }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: "#c084fc", marginBottom: 16 }}>
            🤖 Was this AI analysis accurate?
          </div>
          <div style={{ display: "flex", gap: 10, marginBottom: 14, flexWrap: "wrap", alignItems: "center" }}>
            <span style={{ fontSize: 13, color: "#6b5a80" }}>Accuracy:</span>
            <StarRating value={rating} onChange={setRating} />
            <div style={{ display: "flex", gap: 8, marginLeft: 8 }}>
              {[true, false].map(v => (
                <button key={String(v)} onClick={() => setHelpful(v)}
                  style={{ padding: "5px 14px", borderRadius: 8, border: "1px solid",
                    borderColor: helpful === v ? (v ? "rgba(0,255,163,0.5)" : "rgba(255,59,92,0.5)") : "rgba(192,132,252,0.15)",
                    background: helpful === v ? (v ? "rgba(0,255,163,0.08)" : "rgba(255,59,92,0.08)") : "transparent",
                    color: helpful === v ? (v ? "#00ffa3" : "#ff3b5c") : "#6b5a80",
                    fontSize: 12, cursor: "pointer", fontWeight: 600 }}>
                  {v ? "👍 Helpful" : "👎 Not helpful"}
                </button>
              ))}
            </div>
          </div>
          <textarea className="inp" placeholder="Optional: what was off? (helps retrain your twin)"
            value={feedbackNote} onChange={e => setFeedbackNote(e.target.value)}
            style={{ minHeight: 60, fontSize: 13, marginBottom: 12 }} />
          <button onClick={submitFeedback} disabled={rating === 0 || sendingFeedback}
            className="btn-soft" style={{ padding: "10px 24px", fontSize: 13,
              opacity: rating === 0 ? 0.4 : 1, cursor: rating === 0 ? "not-allowed" : "pointer" }}>
            {sendingFeedback ? "Saving..." : "Submit Feedback"}
          </button>
        </motion.div>
      )}
      {feedbackSent && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          style={{ padding: "14px 20px", borderRadius: 12, marginBottom: 28,
            background: "rgba(0,255,163,0.06)", border: "1px solid rgba(0,255,163,0.2)",
            color: "#00ffa3", fontSize: 13, fontWeight: 600 }}>
          ✓ Feedback saved — your twin will learn from this
        </motion.div>
      )}

      {/* Actions */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.9 }}
        style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
        <Link href="/chat"><button className="btn">Talk to AI Avatar →</button></Link>
        <Link href="/dashboard"><button className="btn-soft">View Dashboard</button></Link>
        <Link href="/checkin"><button className="btn-soft">Redo Check-In</button></Link>
        {max >= 70 && (
          <Link href="/emergency">
            <button className="btn-red">🆘 Get Help Now</button>
          </Link>
        )}
      </motion.div>
    </div>
  );
}

export default function Results() {
  return (
    <div style={{ minHeight: "100vh", background: "var(--bg)", position: "relative" }}>
      <ParticleBackground />
      <Header />
      <Suspense fallback={
        <div style={{ paddingTop: 120, textAlign: "center", color: "#6b5a80", fontSize: 14 }}>
          Analysing your data...
        </div>
      }>
        <ResultsContent />
      </Suspense>
    </div>
  );
}
