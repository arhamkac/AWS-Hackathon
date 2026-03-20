"use client";
import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { useRouter } from "next/navigation";
import axios from "axios";
import { signInWithPopup } from "firebase/auth";
import { auth, provider } from "@/lib/firebase";
import ParticleBackground from "../components/ParticleBackground";
import { TOP_COLLEGES } from "@/lib/colleges";

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

function CollegeSelect({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const [query, setQuery] = useState(value);
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const filtered = query.length > 0
    ? TOP_COLLEGES.filter(c => c.toLowerCase().includes(query.toLowerCase())).slice(0, 10)
    : TOP_COLLEGES.slice(0, 10);
  useEffect(() => { setQuery(value); }, [value]);
  useEffect(() => {
    const h = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false); };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);
  return (
    <div ref={ref} style={{ position: "relative" }}>
      <input className="inp" placeholder="Search college..." value={query}
        onChange={e => { setQuery(e.target.value); setOpen(true); onChange(""); }}
        onFocus={() => setOpen(true)} />
      {value && <span style={{ position: "absolute", right: 14, top: "50%", transform: "translateY(-50%)",
        fontSize: 11, color: "#00ffa3", fontWeight: 700, pointerEvents: "none" }}>✓</span>}
      {open && filtered.length > 0 && (
        <div style={{ position: "absolute", top: "calc(100% + 6px)", left: 0, right: 0, zIndex: 100,
          background: "rgba(7,5,15,0.98)", border: "1px solid rgba(0,240,255,0.15)",
          borderRadius: 12, overflow: "hidden", boxShadow: "0 12px 40px rgba(0,0,0,0.6)",
          maxHeight: 220, overflowY: "auto" }}>
          {filtered.map(c => (
            <button key={c} onMouseDown={() => { onChange(c); setQuery(c); setOpen(false); }}
              style={{ display: "block", width: "100%", padding: "10px 16px", textAlign: "left",
                background: c === value ? "rgba(0,240,255,0.08)" : "transparent",
                border: "none", color: c === value ? "#00f0ff" : "#64748b",
                fontSize: 13, cursor: "pointer", borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
              {c}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

const branches = ["Computer Science & Engineering","Electrical Engineering","Mechanical Engineering","Civil Engineering","Chemical Engineering","Aerospace Engineering","Biotechnology","Mathematics & Computing","Physics","Economics","Humanities & Social Sciences","Other"];
const semesters = ["1st Semester","2nd Semester","3rd Semester","4th Semester","5th Semester","6th Semester","7th Semester","8th Semester"];
const goals = ["Maintain/improve CGPA","Land a top internship","Get into a good Masters program","Build projects & portfolio","Crack competitive exams (GATE/GRE)","Start my own startup","Improve mental health & balance","Develop soft skills & leadership"];
const completedOptions = ["Completed all assignments on time","Submitted at least one research paper","Completed an internship","Built a personal project","Participated in a hackathon","Completed an online certification","Contributed to open source","Maintained attendance above 75%","Cleared all backlogs","Achieved target CGPA this semester"];

type Step = 0 | 1 | 2 | 3;

const STEPS = [
  { label: "Account", desc: "Create your credentials" },
  { label: "Academic", desc: "Your branch & semester" },
  { label: "Goals", desc: "What you're aiming for" },
  { label: "Progress", desc: "What you've achieved" },
];

export default function Signup() {
  const router = useRouter();
  const [step, setStep] = useState<Step>(0);
  const [loading, setLoading] = useState(false);
  const [gLoading, setGLoading] = useState(false);
  const [err, setErr] = useState("");

  const [account, setAccount] = useState({ name:"", email:"", password:"", rollNo:"" });
  const [academic, setAcademic] = useState({ branch:"", semester:"", cgpa:"", university:"", year:"", rollNumber:"" });
  const [selectedGoals, setSelectedGoals] = useState<string[]>([]);
  const [selectedCompleted, setSelectedCompleted] = useState<string[]>([]);
  const [extraContext, setExtraContext] = useState("");

  const toggleGoal = (g: string) => setSelectedGoals(p => p.includes(g) ? p.filter(x=>x!==g) : [...p,g]);
  const toggleCompleted = (c: string) => setSelectedCompleted(p => p.includes(c) ? p.filter(x=>x!==c) : [...p,c]);

  const next = () => { if (step < 3) setStep((step + 1) as Step); };
  const back = () => { if (step > 0) setStep((step - 1) as Step); };

  const finish = async () => {
    setLoading(true); setErr("");
    try {
      const response = await axios.post("/api/auth/signup", {
        name: account.name,
        email: account.email,
        password: account.password,
        rollNo: account.rollNo,
        academic: {
          university: academic.university,
          branch: academic.branch,
          semester: academic.semester,
          cgpa: academic.cgpa,
          year: academic.year,
          rollNumber: academic.rollNumber
        },
        goals: {
          selectedGoals,
          selectedCompleted,
          extraContext
        }
      }, { withCredentials: true });
      if (response.data.success) router.push("/dashboard");
    } catch (e: any) {
      setErr(e.response?.data?.message || "Signup failed. Try again.");
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
    } catch {
      setErr("Google sign-in failed. Try again.");
    }
    setGLoading(false);
  };

  const canNext = () => {
    if (step === 0) return account.name && account.email && account.password;
    if (step === 1) return academic.branch && academic.semester && academic.cgpa && academic.rollNumber && academic.university;
    if (step === 2) return selectedGoals.length > 0;
    return true;
  };

  return (
    <div style={{ minHeight:"100vh", background:"var(--bg)", display:"flex", alignItems:"center",
      justifyContent:"center", position:"relative", padding:"80px 24px 40px" }}>
      <ParticleBackground />

      <div style={{ position:"fixed", top:"15%", right:"10%", width:450, height:450, borderRadius:"50%",
        background:"radial-gradient(circle,rgba(176,110,243,0.07) 0%,transparent 70%)", filter:"blur(70px)", pointerEvents:"none" }} />
      <div style={{ position:"fixed", bottom:"15%", left:"10%", width:350, height:350, borderRadius:"50%",
        background:"radial-gradient(circle,rgba(0,240,255,0.06) 0%,transparent 70%)", filter:"blur(60px)", pointerEvents:"none" }} />

      <div style={{ width:"100%", maxWidth:560, position:"relative", zIndex:1 }}>

        {/* Logo */}
        <div style={{ textAlign:"center", marginBottom:32 }}>
          <div style={{ display:"inline-flex", alignItems:"center", justifyContent:"center",
            width:48, height:48, borderRadius:13,
            background:"linear-gradient(135deg,#00f0ff,#b06ef3)",
            fontSize:20, fontWeight:900, color:"#000",
            boxShadow:"0 0 28px rgba(0,240,255,0.28)", marginBottom:14 }}>Ψ</div>
          <h1 style={{ fontSize:24, fontWeight:900, letterSpacing:"-0.03em", marginBottom:4 }}>
            Build your Digital Twin
          </h1>
          <p style={{ color:"#3d4a5c", fontSize:13 }}>4 quick steps to personalise your AI avatar</p>
        </div>

        {/* Step indicators */}
        <div style={{ display:"flex", gap:0, marginBottom:28, borderRadius:14, overflow:"hidden",
          border:"1px solid rgba(255,255,255,0.07)", background:"rgba(255,255,255,0.02)" }}>
          {STEPS.map((s, i) => (
            <div key={i} style={{ flex:1, padding:"12px 8px", textAlign:"center",
              borderRight: i < 3 ? "1px solid rgba(255,255,255,0.06)" : "none",
              background: i === step ? "rgba(0,240,255,0.07)" : "transparent",
              transition:"background 0.3s" }}>
              <div style={{ fontSize:10, fontWeight:800, letterSpacing:"0.1em", textTransform:"uppercase",
                color: i === step ? "#00f0ff" : i < step ? "#00ffa3" : "#3d4a5c" }}>
                {i < step ? "✓ " : `0${i+1} · `}{s.label}
              </div>
            </div>
          ))}
        </div>

        {/* Progress bar */}
        <div className="pbar" style={{ marginBottom:28 }}>
          <motion.div className="pbar-fill"
            style={{ background:"linear-gradient(90deg,#00f0ff,#b06ef3)" }}
            animate={{ width:`${((step+1)/4)*100}%` }} transition={{ duration:0.5 }} />
        </div>

        <AnimatePresence mode="wait">
          <motion.div key={step}
            initial={{ opacity:0, x:40 }} animate={{ opacity:1, x:0 }} exit={{ opacity:0, x:-40 }}
            transition={{ duration:0.3 }}>

            <div className="glass" style={{ padding:"32px 28px" }}>
              <div style={{ position:"absolute", top:0, left:"15%", right:"15%", height:1,
                background:"linear-gradient(90deg,transparent,rgba(0,240,255,0.35),transparent)" }} />

              {/* ── STEP 0: Account ── */}
              {step === 0 && (
                <div style={{ display:"flex", flexDirection:"column", gap:16 }}>
                  <div style={{ marginBottom:4 }}>
                    <h2 style={{ fontSize:18, fontWeight:800, letterSpacing:"-0.02em", marginBottom:4 }}>Create your account</h2>
                    <p style={{ fontSize:13, color:"#6b5a80" }}>Your credentials to access your Digital Twin</p>
                  </div>

                  {/* Google signup */}
                  <button className="btn-google" onClick={handleGoogle} disabled={gLoading}>
                    {gLoading ? <Spinner /> : <GoogleIcon />}
                    {gLoading ? "Signing in..." : "Continue with Google"}
                  </button>
                  <div style={{ display:"flex", alignItems:"center", gap:12 }}>
                    <div style={{ flex:1, height:1, background:"rgba(255,255,255,0.06)" }} />
                    <span style={{ fontSize:11, color:"#4a3860", letterSpacing:"0.08em" }}>OR</span>
                    <div style={{ flex:1, height:1, background:"rgba(255,255,255,0.06)" }} />
                  </div>

                  {[
                    { label:"Full Name", key:"name", type:"text", placeholder:"Arham Kachhara" },
                    { label:"University Email", key:"email", type:"email", placeholder:"you@iitk.ac.in" },
                    { label:"Roll Number", key:"rollNo", type:"text", placeholder:"e.g. 230001" },
                    { label:"Password", key:"password", type:"password", placeholder:"Min 8 characters" },
                  ].map(f => (
                    <div key={f.key}>
                      <label style={{ fontSize:11, fontWeight:700, letterSpacing:"0.1em", textTransform:"uppercase",
                        color:"#6b5a80", display:"block", marginBottom:7 }}>{f.label}</label>
                      <input className="inp" type={f.type} placeholder={f.placeholder}
                        value={account[f.key as keyof typeof account]}
                        onChange={e => setAccount({...account, [f.key]:e.target.value})} />
                    </div>
                  ))}
                </div>
              )}

              {/* ── STEP 1: Academic ── */}
              {step === 1 && (
                <div style={{ display:"flex", flexDirection:"column", gap:16 }}>
                  <div style={{ marginBottom:4 }}>
                    <h2 style={{ fontSize:18, fontWeight:800, letterSpacing:"-0.02em", marginBottom:4 }}>Your academic profile</h2>
                    <p style={{ fontSize:13, color:"#3d4a5c" }}>This calibrates your AI twin to your exact context</p>
                  </div>
                  <div>
                    <label style={{ fontSize:11, fontWeight:700, letterSpacing:"0.1em", textTransform:"uppercase",
                      color:"#3d4a5c", display:"block", marginBottom:7 }}>University / Institute</label>
                    <CollegeSelect value={academic.university}
                      onChange={v => setAcademic({...academic, university:v})} />
                  </div>
                  <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12 }}>
                    <div>
                      <label style={{ fontSize:11, fontWeight:700, letterSpacing:"0.1em", textTransform:"uppercase",
                        color:"#3d4a5c", display:"block", marginBottom:7 }}>Roll Number</label>
                      <input className="inp" placeholder="e.g. 230001CS" value={academic.rollNumber}
                        onChange={e => setAcademic({...academic, rollNumber:e.target.value})} />
                    </div>
                    <div>
                      <label style={{ fontSize:11, fontWeight:700, letterSpacing:"0.1em", textTransform:"uppercase",
                        color:"#3d4a5c", display:"block", marginBottom:7 }}>Current CGPA</label>
                      <input className="inp" type="number" min="0" max="10" step="0.1" placeholder="e.g. 8.4"
                        value={academic.cgpa} onChange={e => setAcademic({...academic, cgpa:e.target.value})} />
                    </div>
                  </div>
                  <div>
                    <label style={{ fontSize:11, fontWeight:700, letterSpacing:"0.1em", textTransform:"uppercase",
                      color:"#3d4a5c", display:"block", marginBottom:7 }}>Branch / Department</label>
                    <select className="inp" value={academic.branch}
                      onChange={e => setAcademic({...academic, branch:e.target.value})}>
                      <option value="">Select your branch</option>
                      {branches.map(b => <option key={b} value={b}>{b}</option>)}
                    </select>
                  </div>
                  <div>
                    <label style={{ fontSize:11, fontWeight:700, letterSpacing:"0.1em", textTransform:"uppercase",
                      color:"#3d4a5c", display:"block", marginBottom:7 }}>Current Semester</label>
                    <select className="inp" value={academic.semester}
                      onChange={e => setAcademic({...academic, semester:e.target.value})}>
                      <option value="">Select</option>
                      {semesters.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>
                  <div style={{ padding:"12px 16px", borderRadius:10,
                    background:"rgba(0,240,255,0.04)", border:"1px solid rgba(0,240,255,0.12)" }}>
                    <p style={{ fontSize:12, color:"#3d4a5c", lineHeight:1.6 }}>
                      <span style={{ color:"#00f0ff", fontWeight:700 }}>Why we ask:</span> Your branch determines typical workload patterns, exam schedules, and assignment types. Your CGPA helps us understand your academic pressure baseline.
                    </p>
                  </div>
                </div>
              )}

              {/* ── STEP 2: Goals ── */}
              {step === 2 && (
                <div style={{ display:"flex", flexDirection:"column", gap:16 }}>
                  <div style={{ marginBottom:4 }}>
                    <h2 style={{ fontSize:18, fontWeight:800, letterSpacing:"-0.02em", marginBottom:4 }}>What are you working towards?</h2>
                    <p style={{ fontSize:13, color:"#3d4a5c" }}>Select all that apply — your twin prioritises advice around your goals</p>
                  </div>
                  <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:8 }}>
                    {goals.map(g => {
                      const sel = selectedGoals.includes(g);
                      return (
                        <button key={g} onClick={() => toggleGoal(g)}
                          style={{ padding:"12px 14px", borderRadius:12, border:"1px solid",
                            borderColor: sel ? "rgba(0,240,255,0.45)" : "rgba(255,255,255,0.07)",
                            background: sel ? "rgba(0,240,255,0.08)" : "rgba(255,255,255,0.02)",
                            color: sel ? "#00f0ff" : "#64748b",
                            cursor:"pointer", textAlign:"left", fontSize:12, fontWeight: sel ? 600 : 400,
                            transition:"all 0.2s", lineHeight:1.4 }}>
                          {sel && <span style={{ marginRight:6 }}>✓</span>}{g}
                        </button>
                      );
                    })}
                  </div>
                  {selectedGoals.length > 0 && (
                    <div style={{ fontSize:12, color:"#3d4a5c" }}>
                      {selectedGoals.length} goal{selectedGoals.length > 1 ? "s" : ""} selected
                    </div>
                  )}
                </div>
              )}

              {/* ── STEP 3: Completed ── */}
              {step === 3 && (
                <div style={{ display:"flex", flexDirection:"column", gap:16 }}>
                  <div style={{ marginBottom:4 }}>
                    <h2 style={{ fontSize:18, fontWeight:800, letterSpacing:"-0.02em", marginBottom:4 }}>What have you accomplished this semester?</h2>
                    <p style={{ fontSize:13, color:"#3d4a5c" }}>Helps your twin understand your current momentum and stress baseline</p>
                  </div>
                  <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
                    {completedOptions.map(c => {
                      const sel = selectedCompleted.includes(c);
                      return (
                        <button key={c} onClick={() => toggleCompleted(c)}
                          style={{ padding:"12px 16px", borderRadius:12, border:"1px solid",
                            borderColor: sel ? "rgba(0,255,163,0.4)" : "rgba(255,255,255,0.07)",
                            background: sel ? "rgba(0,255,163,0.06)" : "rgba(255,255,255,0.02)",
                            color: sel ? "#00ffa3" : "#64748b",
                            cursor:"pointer", textAlign:"left", fontSize:13, fontWeight: sel ? 600 : 400,
                            transition:"all 0.2s", display:"flex", alignItems:"center", gap:10 }}>
                          <span style={{ width:18, height:18, borderRadius:"50%", border:"1.5px solid",
                            borderColor: sel ? "#00ffa3" : "rgba(255,255,255,0.15)",
                            background: sel ? "#00ffa3" : "transparent",
                            display:"flex", alignItems:"center", justifyContent:"center",
                            fontSize:10, color:"#000", flexShrink:0 }}>
                            {sel ? "✓" : ""}
                          </span>
                          {c}
                        </button>
                      );
                    })}
                  </div>
                  <div>
                    <label style={{ fontSize:11, fontWeight:700, letterSpacing:"0.1em", textTransform:"uppercase",
                      color:"#3d4a5c", display:"block", marginBottom:7 }}>Anything else to share? (optional)</label>
                    <textarea className="inp" placeholder="e.g. I've been struggling with a particular subject, or I recently went through a tough personal situation..."
                      value={extraContext} onChange={e => setExtraContext(e.target.value)}
                      style={{ minHeight:80 }} />
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Navigation */}
        <div style={{ display:"flex", gap:12, marginTop:20 }}>
          {step > 0 && (
            <button onClick={back} className="btn-soft"
              style={{ padding:"13px 28px", fontSize:14 }}>
              ← Back
            </button>
          )}
          {step < 3 ? (
            <button onClick={next} disabled={!canNext()} className="btn"
              style={{ flex:1, justifyContent:"center",
                opacity: canNext() ? 1 : 0.35,
                cursor: canNext() ? "pointer" : "not-allowed",
                pointerEvents: canNext() ? "auto" : "none" }}>
              Continue →
            </button>
          ) : (
            <button onClick={finish} disabled={loading} className="btn"
              style={{ flex:1, justifyContent:"center", opacity: loading ? 0.7 : 1 }}>
              {loading ? <><Spinner /> Building your twin...</> : "Launch my Digital Twin →"}
            </button>
          )}
        </div>

        {err && (
          <div style={{ marginTop:12, padding:"10px 14px", borderRadius:10,
            background:"rgba(255,77,109,0.08)", border:"1px solid rgba(255,77,109,0.25)",
            color:"#ff4d6d", fontSize:13 }}>{err}</div>
        )}

        <p style={{ textAlign:"center", marginTop:16, fontSize:13, color:"#3d4a5c" }}>
          Already have an account?{" "}
          <Link href="/login" style={{ color:"#00f0ff", textDecoration:"none", fontWeight:600 }}>Sign in</Link>
        </p>
      </div>
    </div>
  );
}
