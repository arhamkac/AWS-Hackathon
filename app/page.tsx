"use client";
import { useEffect, useRef, useState } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import Link from "next/link";
import Header from "./components/Header";
import ParticleBackground from "./components/ParticleBackground";

const features = [
  {
    icon: "◈", title: "Neural Avatar", desc: "A living digital twin that mirrors your academic DNA — stress patterns, sleep cycles, workload peaks.",
    span: "col", accent: "#00f5ff", tag: "CORE",
  },
  {
    icon: "⬡", title: "Burnout Prediction", desc: "ML model trained on 10,000+ student patterns predicts your risk 48hrs before it hits.",
    span: "", accent: "#a855f7", tag: "AI",
  },
  {
    icon: "◎", title: "Daily Check-In", desc: "2-minute pulse check. Sleep, deadlines, mood — your twin learns from every answer.",
    span: "", accent: "#f72585", tag: "DAILY",
  },
  {
    icon: "⬢", title: "Smart Coping", desc: "Hyper-personalised strategies. Not generic advice — actions built for your exact situation.",
    span: "", accent: "#fbbf24", tag: "SMART",
  },
  {
    icon: "⬟", title: "Live Dashboard", desc: "Real-time stress heatmaps, workload graphs, and a 3D avatar that changes with your state.",
    span: "col", accent: "#00f5ff", tag: "LIVE",
  },
];

function AnimatedCounter({ target, suffix = "" }: { target: number; suffix?: string }) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const started = useRef(false);

  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => {
      if (e.isIntersecting && !started.current) {
        started.current = true;
        let start = 0;
        const step = target / 60;
        const tick = () => {
          start += step;
          if (start >= target) { setCount(target); return; }
          setCount(Math.floor(start));
          requestAnimationFrame(tick);
        };
        requestAnimationFrame(tick);
      }
    });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, [target]);

  return <span ref={ref}>{count}{suffix}</span>;
}

export default function Home() {
  const { scrollY } = useScroll();
  const heroY = useTransform(scrollY, [0, 600], [0, 180]);
  const heroOpacity = useTransform(scrollY, [0, 400], [1, 0]);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const onMove = (e: MouseEvent) => setMousePos({ x: e.clientX, y: e.clientY });
    window.addEventListener("mousemove", onMove);
    return () => window.removeEventListener("mousemove", onMove);
  }, []);

  return (
    <div style={{ background: "var(--bg)", minHeight: "100vh", position: "relative" }}>
      <ParticleBackground />
      <Header />

      {/* ── HERO ── */}
      <section style={{ minHeight: "100vh", paddingTop: 76, display: "flex", alignItems: "center", justifyContent: "center", position: "relative", overflow: "hidden" }}>

        {/* Grid */}
        <div className="grid-bg" style={{ position: "absolute", inset: 0, opacity: 1 }} />

        {/* Mouse-tracked spotlight */}
        <div style={{
          position: "absolute", width: 600, height: 600, borderRadius: "50%", pointerEvents: "none",
          background: "radial-gradient(circle, rgba(0,245,255,0.06) 0%, transparent 70%)",
          left: mousePos.x - 300, top: mousePos.y - 300, transition: "left 0.1s, top 0.1s",
        }} />

        {/* Big ambient orbs */}
        <motion.div style={{ y: heroY }}>
          <div style={{
            position: "absolute", top: "15%", left: "5%", width: 500, height: 500, borderRadius: "50%",
            background: "radial-gradient(circle, rgba(0,245,255,0.08) 0%, transparent 65%)",
            filter: "blur(40px)", pointerEvents: "none",
          }} />
        </motion.div>
        <div style={{
          position: "absolute", bottom: "10%", right: "5%", width: 600, height: 600, borderRadius: "50%",
          background: "radial-gradient(circle, rgba(168,85,247,0.1) 0%, transparent 65%)",
          filter: "blur(60px)", pointerEvents: "none",
        }} />
        <div style={{
          position: "absolute", top: "40%", right: "20%", width: 300, height: 300, borderRadius: "50%",
          background: "radial-gradient(circle, rgba(247,37,133,0.07) 0%, transparent 65%)",
          filter: "blur(40px)", pointerEvents: "none",
        }} />

        {/* Rotating rings */}
        <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%,-50%)", pointerEvents: "none" }}>
          <div className="spin-slow" style={{
            width: 700, height: 700, borderRadius: "50%",
            border: "1px solid rgba(0,245,255,0.04)",
            position: "absolute", top: "50%", left: "50%", transform: "translate(-50%,-50%)",
          }} />
          <div className="spin-rev" style={{
            width: 500, height: 500, borderRadius: "50%",
            border: "1px solid rgba(168,85,247,0.06)",
            position: "absolute", top: "50%", left: "50%", transform: "translate(-50%,-50%)",
          }} />
          <div className="spin-slow" style={{
            width: 300, height: 300, borderRadius: "50%",
            border: "1px dashed rgba(0,245,255,0.08)",
            position: "absolute", top: "50%", left: "50%", transform: "translate(-50%,-50%)",
          }} />
        </div>

        <motion.div style={{ opacity: heroOpacity, position: "relative", zIndex: 1, textAlign: "center", maxWidth: 860, padding: "0 24px" }}>

          {/* Badge */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }}>
            <div style={{
              display: "inline-flex", alignItems: "center", gap: 8, padding: "6px 18px",
              borderRadius: 100, border: "1px solid rgba(0,245,255,0.2)",
              background: "rgba(0,245,255,0.04)", fontSize: 11, color: "#00f5ff",
              letterSpacing: "0.12em", textTransform: "uppercase", fontWeight: 700, marginBottom: 32,
            }}>
              <span style={{ width: 5, height: 5, borderRadius: "50%", background: "#00f5ff", boxShadow: "0 0 8px #00f5ff", display: "inline-block" }} />
              AWS Builder Center · Campus Life Simplified with AI
            </div>
          </motion.div>

          {/* Headline */}
          <motion.h1 initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.1 }}
            style={{ fontSize: "clamp(3rem, 7vw, 5.5rem)", fontWeight: 900, lineHeight: 1.0, letterSpacing: "-0.04em", marginBottom: 28 }}>
            <span style={{ color: "#f1f5f9" }}>Your Campus</span>
            <br />
            <span className="g-main" style={{ display: "inline-block" }}>Digital Twin</span>
            <br />
            <span style={{ color: "rgba(241,245,249,0.5)", fontSize: "0.65em", fontWeight: 400, letterSpacing: "-0.02em" }}>
              knows before you do.
            </span>
          </motion.h1>

          {/* Sub */}
          <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.2 }}
            style={{ fontSize: 17, color: "#64748b", lineHeight: 1.75, maxWidth: 560, margin: "0 auto 44px", fontWeight: 400 }}>
            An AI avatar that predicts burnout, stress spikes, and academic overload — personalised to your semester, branch, and daily patterns.
          </motion.p>

          {/* CTAs */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.3 }}
            style={{ display: "flex", gap: 14, justifyContent: "center", flexWrap: "wrap" }}>
            <Link href="/checkin">
              <button className="btn-glow" style={{ fontSize: 15, padding: "15px 40px" }}>
                Start Check-In →
              </button>
            </Link>
            <Link href="/dashboard">
              <button className="btn-ghost" style={{ fontSize: 15, padding: "15px 40px" }}>
                View Dashboard
              </button>
            </Link>
          </motion.div>

          {/* Scroll hint */}
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.5 }}
            style={{ marginTop: 64, display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
            <motion.div animate={{ y: [0, 6, 0] }} transition={{ repeat: Infinity, duration: 2 }}
              style={{ width: 1, height: 48, background: "linear-gradient(to bottom, rgba(0,245,255,0.4), transparent)" }} />
            <span style={{ fontSize: 10, color: "#334155", letterSpacing: "0.2em", textTransform: "uppercase" }}>scroll</span>
          </motion.div>
        </motion.div>
      </section>

      {/* ── STATS ── */}
      <section style={{ padding: "80px 32px", position: "relative", zIndex: 1 }}>
        <div style={{ maxWidth: 1000, margin: "0 auto" }}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 1, borderRadius: 20, overflow: "hidden", border: "1px solid rgba(255,255,255,0.06)" }}>
            {[
              { val: 73, suf: "%", label: "Students face burnout", color: "#ff3b5c" },
              { val: 2, suf: "min", label: "Daily check-in time", color: "#00f5ff" },
              { val: 48, suf: "hr", label: "Early prediction window", color: "#a855f7" },
              { val: 24, suf: "/7", label: "AI support available", color: "#00ff88" },
            ].map((s, i) => (
              <motion.div key={i} initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} transition={{ delay: i * 0.1 }} viewport={{ once: true }}
                style={{ padding: "40px 32px", background: "rgba(255,255,255,0.02)", borderRight: i < 3 ? "1px solid rgba(255,255,255,0.06)" : "none", textAlign: "center" }}>
                <div style={{ fontSize: 44, fontWeight: 900, letterSpacing: "-0.04em", color: s.color, marginBottom: 8, fontVariantNumeric: "tabular-nums" }}>
                  <AnimatedCounter target={s.val} suffix={s.suf} />
                </div>
                <div style={{ fontSize: 12, color: "#475569", letterSpacing: "0.04em" }}>{s.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FEATURES BENTO ── */}
      <section style={{ padding: "60px 32px 100px", position: "relative", zIndex: 1 }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
            style={{ marginBottom: 56, display: "flex", alignItems: "flex-end", justifyContent: "space-between", flexWrap: "wrap", gap: 16 }}>
            <div>
              <div style={{ fontSize: 11, color: "#475569", letterSpacing: "0.15em", textTransform: "uppercase", marginBottom: 12 }}>What we built</div>
              <h2 style={{ fontSize: "clamp(2rem, 4vw, 3rem)", fontWeight: 900, letterSpacing: "-0.04em", lineHeight: 1.1 }}>
                Six systems.<br /><span className="g-cyan">One twin.</span>
              </h2>
            </div>
            <Link href="/checkin">
              <button className="btn-ghost">Explore all features →</button>
            </Link>
          </motion.div>

          {/* Bento grid */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gridTemplateRows: "auto auto", gap: 16 }}>
            {features.map((f, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.07, duration: 0.5 }} viewport={{ once: true }}
                whileHover={{ y: -4, transition: { duration: 0.2 } }}
                style={{
                  gridColumn: f.span === "col" ? "span 1" : "span 1",
                  padding: "32px", borderRadius: 20,
                  background: "rgba(255,255,255,0.025)",
                  border: "1px solid rgba(255,255,255,0.07)",
                  position: "relative", overflow: "hidden", cursor: "default",
                  backdropFilter: "blur(10px)",
                }}>
                {/* Corner glow */}
                <div style={{
                  position: "absolute", top: -40, right: -40, width: 120, height: 120, borderRadius: "50%",
                  background: `radial-gradient(circle, ${f.accent}20 0%, transparent 70%)`,
                  pointerEvents: "none",
                }} />
                <div style={{
                  position: "absolute", inset: 0,
                  background: "linear-gradient(135deg, rgba(255,255,255,0.03) 0%, transparent 50%)",
                  pointerEvents: "none",
                }} />

                <div style={{ position: "relative", zIndex: 1 }}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
                    <div style={{ fontSize: 28, color: f.accent, lineHeight: 1 }}>{f.icon}</div>
                    <span style={{
                      fontSize: 9, fontWeight: 800, letterSpacing: "0.15em",
                      padding: "3px 10px", borderRadius: 100,
                      background: `${f.accent}15`, color: f.accent, border: `1px solid ${f.accent}30`,
                    }}>{f.tag}</span>
                  </div>
                  <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 10, color: "#f1f5f9", letterSpacing: "-0.02em" }}>{f.title}</h3>
                  <p style={{ color: "#475569", lineHeight: 1.65, fontSize: 13 }}>{f.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section style={{ padding: "80px 32px", position: "relative", zIndex: 1, borderTop: "1px solid rgba(255,255,255,0.04)" }}>
        <div style={{ maxWidth: 900, margin: "0 auto" }}>
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
            style={{ textAlign: "center", marginBottom: 72 }}>
            <div style={{ fontSize: 11, color: "#475569", letterSpacing: "0.15em", textTransform: "uppercase", marginBottom: 12 }}>The process</div>
            <h2 style={{ fontSize: "clamp(2rem, 4vw, 3rem)", fontWeight: 900, letterSpacing: "-0.04em" }}>
              Four steps to <span className="g-purple">clarity</span>
            </h2>
          </motion.div>

          <div style={{ position: "relative" }}>
            {/* Vertical line */}
            <div style={{ position: "absolute", left: 27, top: 0, bottom: 0, width: 1, background: "linear-gradient(to bottom, transparent, rgba(0,245,255,0.2), rgba(168,85,247,0.2), transparent)" }} />

            {[
              { n: "01", title: "Set up your profile", desc: "Tell us your branch, semester, and current assignments. Your twin is calibrated to your exact academic context.", color: "#00f5ff" },
              { n: "02", title: "Daily 2-min check-in", desc: "Sleep hours, stress level, pending tasks, deadlines. Your twin processes every signal.", color: "#a855f7" },
              { n: "03", title: "AI predicts your state", desc: "Burnout probability, stress trajectory, and anxiety index — calculated from your unique pattern.", color: "#f72585" },
              { n: "04", title: "Act on personalised intel", desc: "Specific actions ranked by impact. Not generic tips — your twin knows what works for you.", color: "#00ff88" },
            ].map((item, i) => (
              <motion.div key={i} initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.12 }} viewport={{ once: true }}
                style={{ display: "flex", gap: 32, marginBottom: 48, alignItems: "flex-start" }}>
                <div style={{
                  width: 54, height: 54, borderRadius: "50%", flexShrink: 0,
                  background: `${item.color}15`, border: `1px solid ${item.color}40`,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 12, fontWeight: 800, color: item.color, fontFamily: "monospace",
                  boxShadow: `0 0 20px ${item.color}20`,
                }}>{item.n}</div>
                <div style={{ paddingTop: 12 }}>
                  <h3 style={{ fontSize: 20, fontWeight: 700, marginBottom: 8, color: "#f1f5f9", letterSpacing: "-0.02em" }}>{item.title}</h3>
                  <p style={{ color: "#475569", lineHeight: 1.7, fontSize: 14 }}>{item.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section style={{ padding: "80px 32px 120px", position: "relative", zIndex: 1 }}>
        <div style={{ maxWidth: 800, margin: "0 auto" }}>
          <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
            style={{
              padding: "72px 60px", borderRadius: 28, textAlign: "center", position: "relative", overflow: "hidden",
              background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.08)",
            }}>
            {/* BG glow */}
            <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%,-50%)", width: 400, height: 400, borderRadius: "50%", background: "radial-gradient(circle, rgba(0,245,255,0.06) 0%, transparent 70%)", pointerEvents: "none" }} />
            <div style={{ position: "absolute", top: 0, left: "20%", right: "20%", height: 1, background: "linear-gradient(90deg, transparent, rgba(0,245,255,0.4), transparent)" }} />

            <div style={{ position: "relative", zIndex: 1 }}>
              <div style={{ fontSize: 11, color: "#475569", letterSpacing: "0.15em", textTransform: "uppercase", marginBottom: 16 }}>Ready?</div>
              <h2 style={{ fontSize: "clamp(2rem, 4vw, 3rem)", fontWeight: 900, letterSpacing: "-0.04em", marginBottom: 16, lineHeight: 1.1 }}>
                Meet your<br /><span className="g-main">Digital Twin</span>
              </h2>
              <p style={{ color: "#475569", marginBottom: 40, fontSize: 15, maxWidth: 400, margin: "0 auto 40px" }}>
                Takes 2 minutes. Gives you clarity for the entire week.
              </p>
              <Link href="/checkin">
                <button className="btn-glow" style={{ fontSize: 16, padding: "16px 52px" }}>
                  Begin Check-In →
                </button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer style={{ padding: "28px 32px", borderTop: "1px solid rgba(255,255,255,0.04)", position: "relative", zIndex: 1 }}>
        <div style={{ maxWidth: 1100, margin: "0 auto", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12 }}>
          <div style={{ fontSize: 12, color: "#334155" }}>
            Digital Twin AI · Ctrl C Ctrl V Engineers · AWS Builder Center
          </div>
          <div style={{ fontSize: 12, color: "#334155" }}>
            Arham Kachhara · Sparsh Chaudhary
          </div>
        </div>
      </footer>
    </div>
  );
}
