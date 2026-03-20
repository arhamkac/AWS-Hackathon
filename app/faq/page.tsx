"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Header from "../components/Header";
import ParticleBackground from "../components/ParticleBackground";

const faqs = [
  {
    q: "What is burnout and how do I know if I'm experiencing it?",
    a: "Burnout is a state of chronic stress that leads to physical and emotional exhaustion, cynicism, and feelings of ineffectiveness. Signs include persistent fatigue even after rest, loss of motivation, difficulty concentrating, increased irritability, and feeling detached from your studies. If you've felt this way for more than 2 weeks, it's likely burnout rather than temporary stress.",
    tag: "Burnout",
  },
  {
    q: "How many hours should I study per day to avoid burnout?",
    a: "Research suggests 4–6 focused hours of deep study per day is optimal for most students. Beyond that, cognitive performance drops sharply. Use the 90-minute ultradian rhythm — study for 90 minutes, then take a 15–20 minute break. Quality always beats quantity. Studying 4 focused hours beats 8 distracted hours every time.",
    tag: "Study",
  },
  {
    q: "What's the best technique to stay productive during exam season?",
    a: "The most effective techniques are: (1) Pomodoro — 25 min work, 5 min break; (2) Active recall — test yourself instead of re-reading; (3) Spaced repetition — review material at increasing intervals; (4) Time-blocking — assign specific tasks to specific time slots. Combine these with proper sleep and you'll outperform students who study twice as long.",
    tag: "Productivity",
  },
  {
    q: "How does sleep affect my academic performance and stress levels?",
    a: "Sleep is the single most impactful factor in academic performance. During sleep, your brain consolidates memories and clears metabolic waste. Even one night of 5 hours sleep reduces cognitive performance by 20–30%. Chronic sleep deprivation elevates cortisol (stress hormone), impairs decision-making, and dramatically increases burnout risk. Aim for 7–8 hours consistently.",
    tag: "Sleep",
  },
  {
    q: "I have too many deadlines at once — how do I prioritise?",
    a: "Use the Eisenhower Matrix: categorise tasks by Urgent/Important. Focus first on tasks that are both urgent AND important. For multiple same-day deadlines: (1) Estimate time needed for each; (2) Start with the one you can complete fastest to build momentum; (3) Communicate with professors if genuinely overwhelmed — most are understanding. Never sacrifice sleep to meet a deadline.",
    tag: "Deadlines",
  },
  {
    q: "What are quick stress-relief techniques I can do between classes?",
    a: "Effective 5-minute techniques: (1) Box breathing — inhale 4s, hold 4s, exhale 4s, hold 4s; (2) Cold water on your wrists and face; (3) 5-minute walk outside; (4) Progressive muscle relaxation — tense and release each muscle group; (5) Write down 3 things you're grateful for. These activate your parasympathetic nervous system and lower cortisol within minutes.",
    tag: "Stress Relief",
  },
  {
    q: "How do I deal with procrastination when I'm already stressed?",
    a: "Procrastination under stress is your brain's avoidance response to perceived threat. Counter it with: (1) The 2-minute rule — if it takes less than 2 minutes, do it now; (2) Implementation intentions — 'I will do X at Y time in Z place'; (3) Reduce friction — open the document before you feel ready; (4) Self-compassion — beating yourself up makes procrastination worse, not better. Start imperfectly.",
    tag: "Productivity",
  },
  {
    q: "Should I take breaks even when I have a lot of work pending?",
    a: "Absolutely yes — this is counterintuitive but critical. Working without breaks leads to diminishing returns after 90 minutes. Short breaks (5–15 min) restore attention and actually increase total productive output. The research is clear: students who take regular breaks complete more work with higher quality than those who grind continuously. Breaks are not a luxury — they're a performance tool.",
    tag: "Study",
  },
  {
    q: "How can I improve my focus and concentration while studying?",
    a: "Key focus strategies: (1) Eliminate phone notifications — put it in another room; (2) Use website blockers during study sessions; (3) Study in the same place consistently — your brain associates location with focus; (4) Start sessions with a 2-minute intention-setting ritual; (5) Stay hydrated — even mild dehydration reduces concentration by 13%; (6) Background music at 60–70 BPM (lo-fi, classical) can help some people.",
    tag: "Focus",
  },
  {
    q: "When should I seek professional help for stress or mental health?",
    a: "Seek help if you experience: persistent sadness or hopelessness for more than 2 weeks, thoughts of self-harm, inability to perform basic daily tasks, severe anxiety that prevents you from attending class, or substance use to cope. Your university counselling centre is free and confidential. Seeking help is a sign of strength, not weakness. Use our Emergency page to connect with support resources immediately.",
    tag: "Mental Health",
  },
];

const tagColors: Record<string, string> = {
  Burnout: "#ef4444",
  Study: "#00d4ff",
  Productivity: "#7c3aed",
  Sleep: "#6366f1",
  Deadlines: "#f59e0b",
  "Stress Relief": "#10b981",
  Focus: "#06b6d4",
  "Mental Health": "#ec4899",
};

export default function FAQ() {
  const [open, setOpen] = useState<number | null>(null);
  const [filter, setFilter] = useState("All");

  const tags = ["All", ...Array.from(new Set(faqs.map((f) => f.tag)))];
  const filtered = filter === "All" ? faqs : faqs.filter((f) => f.tag === filter);

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg)", position: "relative" }}>
      <ParticleBackground />
      <Header />

      <div style={{ paddingTop: 100, maxWidth: 800, margin: "0 auto", padding: "100px 24px 80px", position: "relative", zIndex: 1 }}>

        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} style={{ textAlign: "center", marginBottom: 48 }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "6px 16px", borderRadius: 20,
            border: "1px solid rgba(124,58,237,0.3)", background: "rgba(124,58,237,0.08)", fontSize: 13, color: "#7c3aed", marginBottom: 16 }}>
            📚 Knowledge Base
          </div>
          <h1 style={{ fontSize: "clamp(1.8rem, 4vw, 2.8rem)", fontWeight: 700, marginBottom: 12 }}>
            Productivity & <span className="gradient-text">Wellbeing Guide</span>
          </h1>
          <p style={{ color: "#64748b", fontSize: 15, maxWidth: 500, margin: "0 auto" }}>
            10 evidence-based answers to help you reduce burnout, boost focus, and thrive academically.
          </p>
        </motion.div>

        {/* Filter tags */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}
          style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 32, justifyContent: "center" }}>
          {tags.map((tag) => (
            <button key={tag} onClick={() => { setFilter(tag); setOpen(null); }}
              style={{ padding: "6px 16px", borderRadius: 20, border: "1px solid",
                borderColor: filter === tag ? (tagColors[tag] || "#00d4ff") : "rgba(255,255,255,0.08)",
                background: filter === tag ? `${tagColors[tag] || "#00d4ff"}15` : "transparent",
                color: filter === tag ? (tagColors[tag] || "#00d4ff") : "#64748b",
                cursor: "pointer", fontSize: 13, fontWeight: filter === tag ? 600 : 400, transition: "all 0.2s" }}>
              {tag}
            </button>
          ))}
        </motion.div>

        {/* FAQ Accordion */}
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <AnimatePresence>
            {filtered.map((faq, i) => {
              const globalIdx = faqs.indexOf(faq);
              const isOpen = open === globalIdx;
              const tagColor = tagColors[faq.tag] || "#00d4ff";
              return (
                <motion.div key={globalIdx} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  style={{ borderRadius: 14, border: `1px solid ${isOpen ? tagColor + "40" : "rgba(255,255,255,0.06)"}`,
                    background: isOpen ? `${tagColor}08` : "rgba(13,27,46,0.6)", overflow: "hidden", transition: "border-color 0.3s, background 0.3s" }}>

                  <button onClick={() => setOpen(isOpen ? null : globalIdx)}
                    style={{ width: "100%", padding: "20px 24px", display: "flex", alignItems: "center", gap: 16,
                      background: "transparent", border: "none", cursor: "pointer", textAlign: "left" }}>
                    <span style={{ fontSize: 13, fontWeight: 600, padding: "3px 10px", borderRadius: 12,
                      background: `${tagColor}20`, color: tagColor, flexShrink: 0 }}>
                      {faq.tag}
                    </span>
                    <span style={{ flex: 1, fontSize: 15, fontWeight: 500, color: isOpen ? "#e2e8f0" : "#94a3b8", lineHeight: 1.4 }}>
                      {faq.q}
                    </span>
                    <motion.span animate={{ rotate: isOpen ? 45 : 0 }} transition={{ duration: 0.2 }}
                      style={{ fontSize: 20, color: tagColor, flexShrink: 0, lineHeight: 1 }}>+</motion.span>
                  </button>

                  <AnimatePresence>
                    {isOpen && (
                      <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.3 }}>
                        <div style={{ padding: "0 24px 20px 24px", borderTop: `1px solid ${tagColor}20` }}>
                          <p style={{ color: "#94a3b8", lineHeight: 1.8, fontSize: 14, paddingTop: 16 }}>{faq.a}</p>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>

        {/* Bottom CTA */}
        <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}
          style={{ marginTop: 48, padding: "32px", borderRadius: 16, textAlign: "center",
            background: "rgba(13,27,46,0.6)", border: "1px solid rgba(0,212,255,0.1)" }}>
          <p style={{ color: "#64748b", marginBottom: 20, fontSize: 15 }}>
            Still struggling? Your Digital Twin is ready to give personalised advice.
          </p>
          <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
            <a href="/chat"><button className="btn-primary">💬 Chat with AI Avatar</button></a>
            <a href="/checkin"><button className="btn-outline">📋 Do Today's Check-In</button></a>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
