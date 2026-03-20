"use client";
import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import ParticleBackground from "../components/ParticleBackground";
import axios from "axios";
import Link from "next/link";
import { TOP_COLLEGES } from "@/lib/colleges";

const branches = ["Computer Science & Engineering","Electrical Engineering","Mechanical Engineering","Civil Engineering","Chemical Engineering","Aerospace Engineering","Biotechnology","Mathematics & Computing","Physics","Economics","Humanities & Social Sciences","Other"];
const semesters = ["1st Semester","2nd Semester","3rd Semester","4th Semester","5th Semester","6th Semester","7th Semester","8th Semester"];
const goalOptions = ["Maintain/improve CGPA","Land a top internship","Get into a good Masters program","Build projects & portfolio","Crack competitive exams (GATE/GRE)","Start my own startup","Improve mental health & balance","Develop soft skills & leadership"];
const completedOptions = ["Completed all assignments on time","Submitted at least one research paper","Completed an internship","Built a personal project","Participated in a hackathon","Completed an online certification","Contributed to open source","Maintained attendance above 75%","Cleared all backlogs","Achieved target CGPA this semester"];

type Step = 1 | 2 | 3;
const STEPS = [
  { label: "Academic", icon: "🎓" },
  { label: "Goals",    icon: "🎯" },
  { label: "Progress", icon: "✅" },
];

const Lbl = ({ text }: { text: string }) => (
  <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase",
    color: "#6b5a80", marginBottom: 8 }}>{text}</div>
);

// Searchable college dropdown
function CollegeSelect({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const [query, setQuery] = useState(value);
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const filtered = query.length > 0
    ? TOP_COLLEGES.filter(c => c.toLowerCase().includes(query.toLowerCase())).slice(0, 12)
    : TOP_COLLEGES.slice(0, 12);

  useEffect(() => { setQuery(value); }, [value]);

  useEffect(() => {
    const handler = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false); };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div ref={ref} style={{ position: "relative" }}>
      <input className="inp" placeholder="Search college..." value={query}
        onChange={e => { setQuery(e.target.value); setOpen(true); onChange(""); }}
        onFocus={() => setOpen(true)}
        style={{ paddingRight: 36 }} />
      {value && (
        <span style={{ position: "absolute", right: 14, top: "50%", transform: "translateY(-50%)",
          fontSize: 11, color: "#ff6eb4", fontWeight: 700, pointerEvents: "none" }}>✓</span>
      )}
      {open && filtered.length > 0 && (
        <div style={{ position: "absolute", top: "calc(100% + 6px)", left: 0, right: 0, zIndex: 100,
          background: "rgba(13,8,30,0.98)", border: "1px solid rgba(192,132,252,0.2)",
          borderRadius: 12, overflow: "hidden", boxShadow: "0 12px 40px rgba(0,0,0,0.5)",
          maxHeight: 240, overflowY: "auto" }}>
          {filtered.map(c => (
            <button key={c} onMouseDown={() => { onChange(c); setQuery(c); setOpen(false); }}
              style={{ display: "block", width: "100%", padding: "10px 16px", textAlign: "left",
                background: c === value ? "rgba(255,110,180,0.1)" : "transparent",
                border: "none", color: c === value ? "#ff6eb4" : "#a78bca",
                fontSize: 13, cursor: "pointer", transition: "background 0.15s",
                borderBottom: "1px solid rgba(192,132,252,0.06)" }}>
              {c}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export default function ProfileSetup() {
  const router = useRouter();
  const [step, setStep] = useState<Step>(1);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [saved, setSaved] = useState(false);
  const [isExisting, setIsExisting] = useState(false);
  const [err, setErr] = useState("");

  const [name, setName] = useState("");
  const [academic, setAcademic] = useState({
    university: "", branch: "", semester: "", cgpa: "", year: "", rollNumber: ""
  });
  const [selectedGoals, setSelectedGoals] = useState<string[]>([]);
  const [selectedCompleted, setSelectedCompleted] = useState<string[]>([]);
  const [extraContext, setExtraContext] = useState("");

  useEffect(() => {
    axios.get("/api/profile", { withCredentials: true })
      .then(r => {
        if (r.data.success) {
          const u = r.data.user;
          if (u.name) setName(u.name);
          if (u.academic) {
            setAcademic({
              university:  u.academic.university  || "",
              branch:      u.academic.branch      || "",
              semester:    u.academic.semester    || "",
              cgpa:        u.academic.currentCGPA != null ? String(u.academic.currentCGPA) : "",
              year:        u.academic.year        != null ? String(u.academic.year)        : "",
              rollNumber:  u.academic.rollNumber  || "",
            });
          }
          if (u.goals) {
            setSelectedGoals(u.goals.selectedGoals || []);
            setSelectedCompleted(u.goals.completedAchievements || []);
            setExtraContext(u.goals.extraContext || "");
          }
          if (u.academic || u.goals) setIsExisting(true);
        }
      })
      .catch(() => {})
      .finally(() => setFetching(false));
  }, []);

  const toggleGoal = (g: string) => setSelectedGoals(p => p.includes(g) ? p.filter(x => x !== g) : [...p, g]);
  const toggleCompleted = (c: string) => setSelectedCompleted(p => p.includes(c) ? p.filter(x => x !== c) : [...p, c]);

  const canNext = () => {
    if (step === 1) return academic.branch && academic.semester && academic.cgpa && academic.rollNumber && academic.university;
    if (step === 2) return selectedGoals.length > 0;
    return true;
  };

  const save = async () => {
    setLoading(true); setErr("");
    try {
      const res = await axios.put("/api/profile", {
        name: name || undefined,
        academic: {
          university:  academic.university,
          branch:      academic.branch,
          semester:    academic.semester,
          currentCGPA: parseFloat(academic.cgpa),
          rollNumber:  academic.rollNumber,
          year:        academic.year ? parseInt(academic.year) : undefined,
        },
        goals: {
          selectedGoals,
          completedAchievements: selectedCompleted,
          extraContext,
        },
      }, { withCredentials: true });

      if (res.data.success) {
        setSaved(true);
        setTimeout(() => { setSaved(false); router.push("/dashboard"); }, 1200);
      }
    } catch (e: any) {
      setErr(e.response?.data?.message || "Failed to save. Try again.");
    }
    setLoading(false);
  };

  if (fetching) return (
    <div style={{ minHeight: "100vh", background: "var(--bg)", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ color: "#6b5a80", fontSize: 14 }}>Loading your profile...</div>
    </div>
  );

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg)", display: "flex", alignItems: "center",
      justifyContent: "center", position: "relative", padding: "80px 24px 48px" }}>
      <ParticleBackground />
      <div style={{ position: "fixed", top: "15%", right: "10%", width: 450, height: 450, borderRadius: "50%",
        background: "radial-gradient(circle,rgba(192,132,252,0.07) 0%,transparent 70%)", filter: "blur(70px)", pointerEvents: "none" }} />
      <div style={{ position: "fixed", bottom: "15%", left: "10%", width: 350, height: 350, borderRadius: "50%",
        background: "radial-gradient(circle,rgba(255,110,180,0.05) 0%,transparent 70%)", filter: "blur(60px)", pointerEvents: "none" }} />

      <div style={{ width: "100%", maxWidth: 580, position: "relative", zIndex: 1 }}>

        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <div style={{ display: "inline-flex", alignItems: "center", justifyContent: "center",
            width: 50, height: 50, borderRadius: 14,
            background: "linear-gradient(135deg,#ff6eb4,#c084fc)",
            fontSize: 22, fontWeight: 900, color: "#fff",
            boxShadow: "0 0 28px rgba(255,110,180,0.3)", marginBottom: 14 }}>✦</div>
          <h1 style={{ fontSize: 24, fontWeight: 900, letterSpacing: "-0.03em", marginBottom: 6 }}>
            {isExisting ? "Edit your Profile" : "Complete your Profile"}
          </h1>
          <p style={{ color: "#6b5a80", fontSize: 13 }}>
            {isExisting ? "Your saved data is pre-filled — update anything and save" : "3 quick steps to personalise your Digital Twin"}
          </p>
        </div>

        {/* Step tabs */}
        <div style={{ display: "flex", marginBottom: 24, borderRadius: 14, overflow: "hidden",
          border: "1px solid rgba(192,132,252,0.12)", background: "rgba(255,255,255,0.02)" }}>
          {STEPS.map((s, i) => {
            const active = i === step - 1;
            const done   = i < step - 1;
            return (
              <button key={i} onClick={() => setStep((i + 1) as Step)}
                style={{ flex: 1, padding: "13px 8px", textAlign: "center",
                  borderRight: i < 2 ? "1px solid rgba(192,132,252,0.08)" : "none",
                  background: active ? "rgba(255,110,180,0.07)" : "transparent",
                  border: "none", cursor: "pointer", transition: "background 0.3s" }}>
                <div style={{ fontSize: 10, fontWeight: 800, letterSpacing: "0.1em", textTransform: "uppercase",
                  color: active ? "#ff6eb4" : done ? "#67e8c8" : "#4a3860" }}>
                  {done ? "✓ " : `${s.icon} `}{s.label}
                </div>
              </button>
            );
          })}
        </div>

        {/* Progress bar */}
        <div className="pbar" style={{ marginBottom: 24 }}>
          <motion.div className="pbar-fill" style={{ background: "linear-gradient(90deg,#ff6eb4,#c084fc)" }}
            animate={{ width: `${(step / 3) * 100}%` }} transition={{ duration: 0.5 }} />
        </div>

        <AnimatePresence mode="wait">
          <motion.div key={step}
            initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }}
            transition={{ duration: 0.25 }}>

            <div className="glass" style={{ padding: "32px 28px" }}>
              <div style={{ position: "absolute", top: 0, left: "15%", right: "15%", height: 1,
                background: "linear-gradient(90deg,transparent,rgba(255,110,180,0.35),transparent)" }} />

              {/* ── STEP 1: Academic ── */}
              {step === 1 && (
                <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
                  <div>
                    <h2 style={{ fontSize: 17, fontWeight: 800, marginBottom: 4 }}>Academic Profile</h2>
                    <p style={{ fontSize: 13, color: "#6b5a80" }}>Calibrates your AI twin to your exact context</p>
                  </div>

                  <div>
                    <Lbl text="Your Name" />
                    <input className="inp" placeholder="Full name" value={name}
                      onChange={e => setName(e.target.value)} />
                  </div>

                  <div>
                    <Lbl text="College / University" />
                    <CollegeSelect value={academic.university}
                      onChange={v => setAcademic({ ...academic, university: v })} />
                  </div>

                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                    <div>
                      <Lbl text="Roll Number" />
                      <input className="inp" placeholder="e.g. 230001CS" value={academic.rollNumber}
                        onChange={e => setAcademic({ ...academic, rollNumber: e.target.value })} />
                    </div>
                    <div>
                      <Lbl text="Current CGPA" />
                      <input className="inp" type="number" min="0" max="10" step="0.1" placeholder="e.g. 8.4"
                        value={academic.cgpa} onChange={e => setAcademic({ ...academic, cgpa: e.target.value })} />
                    </div>
                  </div>

                  <div>
                    <Lbl text="Branch / Department" />
                    <select className="inp" value={academic.branch}
                      onChange={e => setAcademic({ ...academic, branch: e.target.value })}>
                      <option value="">Select your branch</option>
                      {branches.map(b => <option key={b} value={b}>{b}</option>)}
                    </select>
                  </div>

                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                    <div>
                      <Lbl text="Current Semester" />
                      <select className="inp" value={academic.semester}
                        onChange={e => setAcademic({ ...academic, semester: e.target.value })}>
                        <option value="">Select</option>
                        {semesters.map(s => <option key={s} value={s}>{s}</option>)}
                      </select>
                    </div>
                    <div>
                      <Lbl text="Year (optional)" />
                      <input className="inp" type="number" min="1" max="5" placeholder="e.g. 2"
                        value={academic.year} onChange={e => setAcademic({ ...academic, year: e.target.value })} />
                    </div>
                  </div>

                  {/* Roll number note */}
                  <div style={{ padding: "12px 16px", borderRadius: 10,
                    background: "rgba(255,110,180,0.05)", border: "1px solid rgba(255,110,180,0.15)" }}>
                    <p style={{ fontSize: 12, color: "#a78bca", lineHeight: 1.6 }}>
                      <span style={{ color: "#ff6eb4", fontWeight: 700 }}>🆘 Why roll number?</span> In case of an emergency SOS, your roll number is sent to your institution's administration so they can reach you immediately.
                    </p>
                  </div>
                </div>
              )}

              {/* ── STEP 2: Goals ── */}
              {step === 2 && (
                <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                  <div>
                    <h2 style={{ fontSize: 17, fontWeight: 800, marginBottom: 4 }}>What are you working towards?</h2>
                    <p style={{ fontSize: 13, color: "#6b5a80" }}>Select all that apply</p>
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                    {goalOptions.map(g => {
                      const sel = selectedGoals.includes(g);
                      return (
                        <button key={g} onClick={() => toggleGoal(g)}
                          style={{ padding: "11px 14px", borderRadius: 12, border: "1px solid",
                            borderColor: sel ? "rgba(255,110,180,0.5)" : "rgba(192,132,252,0.12)",
                            background: sel ? "rgba(255,110,180,0.08)" : "rgba(255,255,255,0.02)",
                            color: sel ? "#ff6eb4" : "#6b5a80",
                            cursor: "pointer", textAlign: "left", fontSize: 12, fontWeight: sel ? 600 : 400,
                            transition: "all 0.2s", lineHeight: 1.4 }}>
                          {sel && <span style={{ marginRight: 6 }}>✓</span>}{g}
                        </button>
                      );
                    })}
                  </div>
                  {selectedGoals.length > 0 && (
                    <div style={{ fontSize: 12, color: "#ff6eb4", fontWeight: 600 }}>
                      {selectedGoals.length} goal{selectedGoals.length > 1 ? "s" : ""} selected
                    </div>
                  )}
                </div>
              )}

              {/* ── STEP 3: Progress ── */}
              {step === 3 && (
                <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                  <div>
                    <h2 style={{ fontSize: 17, fontWeight: 800, marginBottom: 4 }}>What have you accomplished?</h2>
                    <p style={{ fontSize: 13, color: "#6b5a80" }}>Helps your twin understand your momentum</p>
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                    {completedOptions.map(c => {
                      const sel = selectedCompleted.includes(c);
                      return (
                        <button key={c} onClick={() => toggleCompleted(c)}
                          style={{ padding: "11px 16px", borderRadius: 12, border: "1px solid",
                            borderColor: sel ? "rgba(103,232,200,0.4)" : "rgba(192,132,252,0.12)",
                            background: sel ? "rgba(103,232,200,0.06)" : "rgba(255,255,255,0.02)",
                            color: sel ? "#67e8c8" : "#6b5a80",
                            cursor: "pointer", textAlign: "left", fontSize: 13, fontWeight: sel ? 600 : 400,
                            transition: "all 0.2s", display: "flex", alignItems: "center", gap: 10 }}>
                          <span style={{ width: 18, height: 18, borderRadius: "50%", border: "1.5px solid",
                            borderColor: sel ? "#67e8c8" : "rgba(192,132,252,0.2)",
                            background: sel ? "#67e8c8" : "transparent",
                            display: "flex", alignItems: "center", justifyContent: "center",
                            fontSize: 10, color: "#000", flexShrink: 0 }}>
                            {sel ? "✓" : ""}
                          </span>
                          {c}
                        </button>
                      );
                    })}
                  </div>
                  <div>
                    <Lbl text="Anything else to share? (optional)" />
                    <textarea className="inp" placeholder="e.g. struggling with a subject, tough personal situation..."
                      value={extraContext} onChange={e => setExtraContext(e.target.value)}
                      style={{ minHeight: 80 }} />
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        </AnimatePresence>

        {err && (
          <div style={{ marginTop: 12, padding: "10px 16px", borderRadius: 10,
            background: "rgba(255,77,109,0.08)", border: "1px solid rgba(255,77,109,0.25)",
            color: "#ff4d6d", fontSize: 13 }}>{err}</div>
        )}

        {/* Navigation */}
        <div style={{ display: "flex", gap: 12, marginTop: 20, alignItems: "center" }}>
          {step > 1 ? (
            <button onClick={() => setStep((step - 1) as Step)} className="btn-soft"
              style={{ padding: "13px 28px", fontSize: 14 }}>← Back</button>
          ) : (
            <Link href="/profile" style={{ textDecoration: "none" }}>
              <button className="btn-soft" style={{ padding: "13px 28px", fontSize: 14 }}>Cancel</button>
            </Link>
          )}

          <div style={{ flex: 1 }} />

          {step < 3 ? (
            <button onClick={() => setStep((step + 1) as Step)} disabled={!canNext()} className="btn"
              style={{ padding: "13px 32px", fontSize: 14,
                opacity: canNext() ? 1 : 0.35,
                cursor: canNext() ? "pointer" : "not-allowed",
                pointerEvents: canNext() ? "auto" : "none" }}>
              Continue →
            </button>
          ) : (
            <button onClick={save} disabled={loading || saved} className="btn"
              style={{ padding: "13px 36px", fontSize: 14,
                background: saved ? "linear-gradient(135deg,#67e8c8,#7dd3fc)" : "linear-gradient(135deg,#ff6eb4,#c084fc)",
                opacity: loading ? 0.7 : 1 }}>
              {saved ? "✓ Saved!" : loading ? (
                <span style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <motion.span animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 0.8, ease: "linear" }}
                    style={{ display: "inline-block", width: 14, height: 14, border: "2px solid #fff",
                      borderTopColor: "transparent", borderRadius: "50%" }} />
                  Saving...
                </span>
              ) : isExisting ? "Save Changes" : "Complete Setup →"}
            </button>
          )}
        </div>

      </div>
    </div>
  );
}
