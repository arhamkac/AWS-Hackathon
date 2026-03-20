"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import axios from "axios";
import Header from "../components/Header";
import ParticleBackground from "../components/ParticleBackground";

/* ── Types ── */
type Assignment = { name: string; subject: string; difficulty: "easy"|"medium"|"hard"|"nightmare"; hoursLeft: string; dueWhen: string; percentDone: number };
type Answers = Record<string, number|string|Assignment[]>;

/* ── Question definitions ── */
const QUESTIONS = [
  {
    id:"sleep_hours", phase:"Sleep & Recovery",
    q:"How many hours did you sleep last night?",
    sub:"Be honest — your twin uses this to calibrate your cognitive capacity for today.",
    type:"choice",
    choices:[
      { label:"Less than 3 hrs", sub:"Severely sleep deprived", val:5 },
      { label:"3 – 4 hrs", sub:"Very poor — high impairment", val:15 },
      { label:"4 – 5 hrs", sub:"Poor — noticeable fatigue", val:30 },
      { label:"5 – 6 hrs", sub:"Below average", val:48 },
      { label:"6 – 7 hrs", sub:"Slightly under target", val:65 },
      { label:"7 – 8 hrs", sub:"Optimal range", val:88 },
      { label:"8+ hrs", sub:"Well rested", val:100 },
    ],
  },
  {
    id:"sleep_quality", phase:"Sleep & Recovery",
    q:"How would you rate the quality of that sleep?",
    sub:"Hours alone don't tell the full story — interrupted or anxious sleep is different.",
    type:"choice",
    choices:[
      { label:"Couldn't sleep at all — kept waking up", sub:"Anxiety/stress-driven insomnia", val:5 },
      { label:"Very restless, lots of interruptions", sub:"Poor quality", val:20 },
      { label:"Somewhat restless", sub:"Moderate quality", val:45 },
      { label:"Mostly okay, minor interruptions", sub:"Decent quality", val:70 },
      { label:"Slept well, felt rested on waking", sub:"Good quality", val:90 },
      { label:"Deep, uninterrupted sleep", sub:"Excellent quality", val:100 },
    ],
  },
  {
    id:"mood_now", phase:"Current State",
    q:"How are you feeling right now, in this moment?",
    sub:"Your twin needs your honest emotional state — not how you think you should feel.",
    type:"choice",
    choices:[
      { label:"Completely overwhelmed / breaking point", sub:"Urgent attention needed", val:2 },
      { label:"Very anxious and stressed", sub:"High distress", val:12 },
      { label:"Stressed but managing", sub:"Elevated stress", val:28 },
      { label:"A bit tense, some pressure", sub:"Mild stress", val:50 },
      { label:"Neutral — neither good nor bad", sub:"Baseline", val:68 },
      { label:"Calm and focused", sub:"Good state", val:85 },
      { label:"Energised and motivated", sub:"Peak state", val:100 },
    ],
  },
  {
    id:"stress_slider", phase:"Current State",
    q:"On a scale of 0–100, how stressed are you right now?",
    sub:"Drag the slider. 0 = completely zen, 100 = full panic mode. Be precise.",
    type:"slider",
  },
  {
    id:"stress_context", phase:"Current State",
    q:"What's the main thing stressing you out right now?",
    sub:"Write freely — your twin reads this to understand your specific situation, not just numbers.",
    type:"textarea",
    placeholder:"e.g. I have 3 assignments due this week and I haven't started any of them. My OS exam is in 4 days and I don't understand half the syllabus. I've also been fighting with my roommate...",
  },
  {
    id:"assignments", phase:"Workload",
    q:"List your pending assignments & tasks",
    sub:"Add each one with difficulty and time estimate. Your twin will rank them by urgency × difficulty.",
    type:"assignments",
  },
  {
    id:"classes_today", phase:"Workload",
    q:"How many lectures/labs do you have today?",
    sub:"This affects how much focused study time you realistically have.",
    type:"choice",
    choices:[
      { label:"None — free day", sub:"Full day available", val:100 },
      { label:"1 class", sub:"Mostly free", val:88 },
      { label:"2 classes", sub:"Good amount of time", val:75 },
      { label:"3 classes", sub:"Moderate day", val:58 },
      { label:"4 classes", sub:"Busy day", val:40 },
      { label:"5+ classes / full lab day", sub:"Very packed", val:20 },
    ],
  },
  {
    id:"last_break", phase:"Wellbeing",
    q:"When did you last take a proper break from academics?",
    sub:"A 'proper break' means no studying, no assignments — genuinely resting or doing something you enjoy.",
    type:"choice",
    choices:[
      { label:"Today — I took time for myself", sub:"Great habit", val:100 },
      { label:"Yesterday", sub:"Good", val:80 },
      { label:"2–3 days ago", sub:"Getting stretched", val:55 },
      { label:"4–6 days ago", sub:"Overdue for a break", val:30 },
      { label:"Over a week ago", sub:"Burnout risk rising", val:12 },
      { label:"I can't remember", sub:"Critical — rest needed", val:3 },
    ],
  },
  {
    id:"physical_state", phase:"Wellbeing",
    q:"How is your body feeling today?",
    sub:"Physical state directly impacts cognitive performance and stress tolerance.",
    type:"choice",
    choices:[
      { label:"Headache / body ache / unwell", sub:"Physical stress signal", val:10 },
      { label:"Very tired, heavy limbs", sub:"Physical fatigue", val:22 },
      { label:"Somewhat tired", sub:"Mild fatigue", val:45 },
      { label:"Okay — nothing notable", sub:"Neutral", val:68 },
      { label:"Good — feeling physically fine", sub:"Positive", val:85 },
      { label:"Energised — exercised or active today", sub:"Excellent", val:100 },
    ],
  },
  {
    id:"exercise", phase:"Wellbeing",
    q:"Did you exercise or do any physical activity today?",
    sub:"Even a short walk counts. Physical activity directly reduces cortisol and improves focus.",
    type:"choice",
    choices:[
      { label:"No activity at all", sub:"Sedentary day", val:10 },
      { label:"Light walking (< 15 min)", sub:"Minimal movement", val:30 },
      { label:"Moderate walk / light stretching", sub:"Some movement", val:55 },
      { label:"30+ min walk or light workout", sub:"Good activity", val:75 },
      { label:"Gym / sports / intense workout", sub:"Excellent", val:100 },
    ],
  },
  {
    id:"nutrition", phase:"Wellbeing",
    q:"How well have you eaten today?",
    sub:"Skipping meals or eating junk spikes cortisol and tanks focus. Your twin tracks this.",
    type:"choice",
    choices:[
      { label:"Skipped most meals / barely ate", sub:"Nutrition deficit", val:5 },
      { label:"Ate once, not a proper meal", sub:"Poor nutrition", val:22 },
      { label:"Ate but mostly junk / snacks", sub:"Low quality", val:40 },
      { label:"Had 2 decent meals", sub:"Okay", val:65 },
      { label:"3 proper meals, balanced", sub:"Good nutrition", val:88 },
      { label:"3 meals + healthy snacks, hydrated", sub:"Excellent", val:100 },
    ],
  },
  {
    id:"social", phase:"Wellbeing",
    q:"How much meaningful social interaction have you had today?",
    sub:"Isolation amplifies stress. Even a short conversation with a friend counts.",
    type:"choice",
    choices:[
      { label:"None — completely isolated", sub:"Social isolation", val:5 },
      { label:"Brief exchanges only (hi/bye)", sub:"Minimal contact", val:22 },
      { label:"Some interaction but felt disconnected", sub:"Low quality", val:42 },
      { label:"A decent conversation or two", sub:"Moderate", val:65 },
      { label:"Good social time — felt connected", sub:"Positive", val:85 },
      { label:"Great social day — energised by people", sub:"Excellent", val:100 },
    ],
  },
  {
    id:"feedback", phase:"Feedback",
    q:"Anything else you want your Digital Twin to know today?",
    sub:"Personal context, recent events, how you feel about your progress — anything that might affect your wellbeing.",
    type:"textarea",
    placeholder:"e.g. I had a fight with my parents last night. I'm worried about my placement season. I feel like I'm falling behind my peers. I haven't eaten properly today...",
  },
];

const PHASES = ["Sleep & Recovery","Current State","Workload","Wellbeing","Feedback"];
const phaseColors: Record<string,string> = {
  "Sleep & Recovery":"#b06ef3",
  "Current State":"#ff3b5c",
  "Workload":"#ffcc00",
  "Wellbeing":"#00ffa3",
  "Feedback":"#00f0ff",
};

const difficultyConfig = {
  easy:     { label:"Easy",      color:"#00ffa3", desc:"< 2 hrs" },
  medium:   { label:"Medium",    color:"#ffcc00", desc:"2–5 hrs" },
  hard:     { label:"Hard",      color:"#ff8c42", desc:"5–10 hrs" },
  nightmare:{ label:"Nightmare", color:"#ff3b5c", desc:"10+ hrs" },
};

function AssignmentEntry({ value, onChange }: { value: Assignment[]; onChange: (v:Assignment[])=>void }) {
  const [form, setForm] = useState<Assignment>({ name:"", subject:"", difficulty:"medium", hoursLeft:"", dueWhen:"today", percentDone:0 });
  const [adding, setAdding] = useState(false);

  const add = () => {
    if (!form.name || !form.subject) return;
    onChange([...value, form]);
    setForm({ name:"", subject:"", difficulty:"medium", hoursLeft:"", dueWhen:"today", percentDone:0 });
    setAdding(false);
  };
  const remove = (i:number) => onChange(value.filter((_,idx)=>idx!==i));

  return (
    <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
      {value.map((a,i) => {
        const dc = difficultyConfig[a.difficulty];
        return (
          <div key={i} style={{ padding:"14px 16px", borderRadius:14,
            background:"rgba(255,255,255,0.025)", border:`1px solid ${dc.color}30`,
            display:"flex", alignItems:"center", gap:12 }}>
            <div style={{ flex:1 }}>
              <div style={{ fontWeight:700, fontSize:14, color:"#eef2ff", marginBottom:2 }}>{a.name}</div>
              <div style={{ fontSize:12, color:"#3d4a5c" }}>{a.subject} · Due: {a.dueWhen} · {a.hoursLeft}h est.</div>
            </div>
            <span style={{ fontSize:10, fontWeight:800, padding:"3px 10px", borderRadius:100,
              background:`${dc.color}18`, color:dc.color, border:`1px solid ${dc.color}30` }}>{dc.label}</span>
            <span style={{ fontSize:12, color:"#3d4a5c" }}>{a.percentDone}% done</span>
            <button onClick={()=>remove(i)} style={{ background:"none", border:"none", color:"#3d4a5c",
              cursor:"pointer", fontSize:16, padding:"0 4px" }}>×</button>
          </div>
        );
      })}

      {adding ? (
        <div style={{ padding:"18px", borderRadius:16, background:"rgba(255,255,255,0.03)",
          border:"1px solid rgba(0,240,255,0.15)", display:"flex", flexDirection:"column", gap:12 }}>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10 }}>
            <div>
              <label style={{ fontSize:10, fontWeight:700, letterSpacing:"0.1em", textTransform:"uppercase",
                color:"#3d4a5c", display:"block", marginBottom:6 }}>Assignment Name</label>
              <input className="inp" placeholder="e.g. OS Assignment 3" value={form.name}
                onChange={e=>setForm({...form,name:e.target.value})} style={{ fontSize:13 }} />
            </div>
            <div>
              <label style={{ fontSize:10, fontWeight:700, letterSpacing:"0.1em", textTransform:"uppercase",
                color:"#3d4a5c", display:"block", marginBottom:6 }}>Subject / Course</label>
              <input className="inp" placeholder="e.g. CS330 / Operating Systems" value={form.subject}
                onChange={e=>setForm({...form,subject:e.target.value})} style={{ fontSize:13 }} />
            </div>
          </div>
          <div>
            <label style={{ fontSize:10, fontWeight:700, letterSpacing:"0.1em", textTransform:"uppercase",
              color:"#3d4a5c", display:"block", marginBottom:8 }}>Difficulty Level</label>
            <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:8 }}>
              {(["easy","medium","hard","nightmare"] as const).map(d => {
                const dc = difficultyConfig[d];
                return (
                  <button key={d} onClick={()=>setForm({...form,difficulty:d})}
                    style={{ padding:"10px 6px", borderRadius:10, border:"1px solid",
                      borderColor: form.difficulty===d ? dc.color : "rgba(255,255,255,0.07)",
                      background: form.difficulty===d ? `${dc.color}12` : "rgba(255,255,255,0.02)",
                      color: form.difficulty===d ? dc.color : "#3d4a5c",
                      cursor:"pointer", fontSize:11, fontWeight:700, transition:"all 0.2s" }}>
                    {dc.label}<br/>
                    <span style={{ fontSize:9, fontWeight:400 }}>{dc.desc}</span>
                  </button>
                );
              })}
            </div>
          </div>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:10 }}>
            <div>
              <label style={{ fontSize:10, fontWeight:700, letterSpacing:"0.1em", textTransform:"uppercase",
                color:"#3d4a5c", display:"block", marginBottom:6 }}>Est. Hours Needed</label>
              <input className="inp" type="number" min="0.5" step="0.5" placeholder="e.g. 4"
                value={form.hoursLeft} onChange={e=>setForm({...form,hoursLeft:e.target.value})} style={{ fontSize:13 }} />
            </div>
            <div>
              <label style={{ fontSize:10, fontWeight:700, letterSpacing:"0.1em", textTransform:"uppercase",
                color:"#3d4a5c", display:"block", marginBottom:6 }}>Due When</label>
              <select className="inp" value={form.dueWhen} onChange={e=>setForm({...form,dueWhen:e.target.value})} style={{ fontSize:13 }}>
                <option value="today">Today</option>
                <option value="tomorrow">Tomorrow</option>
                <option value="2-3 days">2–3 days</option>
                <option value="this week">This week</option>
                <option value="next week">Next week</option>
              </select>
            </div>
            <div>
              <label style={{ fontSize:10, fontWeight:700, letterSpacing:"0.1em", textTransform:"uppercase",
                color:"#3d4a5c", display:"block", marginBottom:6 }}>% Completed</label>
              <input className="inp" type="number" min="0" max="100" placeholder="0"
                value={form.percentDone} onChange={e=>setForm({...form,percentDone:Number(e.target.value)})} style={{ fontSize:13 }} />
            </div>
          </div>
          <div style={{ display:"flex", gap:10 }}>
            <button onClick={add}
              style={{ flex:1, padding:"11px", borderRadius:10, border:"none",
                background:"linear-gradient(135deg,#00f0ff,#b06ef3)", color:"#000",
                fontWeight:700, fontSize:13, cursor:"pointer" }}>
              Add Assignment
            </button>
            <button onClick={()=>setAdding(false)}
              style={{ padding:"11px 16px", borderRadius:10, fontSize:13,
                border:"1px solid rgba(255,255,255,0.1)", background:"rgba(255,255,255,0.04)",
                color:"#64748b", cursor:"pointer" }}>
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <button onClick={()=>setAdding(true)}
          style={{ padding:"14px", borderRadius:14, border:"1px dashed rgba(0,240,255,0.2)",
            background:"rgba(0,240,255,0.03)", color:"#3d4a5c", cursor:"pointer",
            fontSize:13, fontWeight:600, transition:"all 0.2s", display:"flex", alignItems:"center", justifyContent:"center", gap:8 }}>
          <span style={{ fontSize:18, lineHeight:1 }}>+</span> Add Assignment / Task
        </button>
      )}
      {value.length === 0 && !adding && (
        <p style={{ fontSize:12, color:"#3d4a5c", textAlign:"center", padding:"8px 0" }}>
          No assignments added yet. Add at least one for accurate predictions.
        </p>
      )}
    </div>
  );
}

export default function CheckIn() {
  const router = useRouter();
  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState<Answers>({});
  const [sliderVal, setSliderVal] = useState(50);
  const [textVal, setTextVal] = useState("");
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [selected, setSelected] = useState<number|null>(null);
  const [submitting, setSubmitting] = useState(false);

  const q = QUESTIONS[current];
  const totalQ = QUESTIONS.length;
  const progress = (current / totalQ) * 100;
  const phaseColor = phaseColors[q.phase] || "#00f0ff";

  const canProceed = () => {
    if (q.type === "choice") return selected !== null;
    if (q.type === "slider") return true;
    if (q.type === "textarea") return textVal.trim().length > 0;
    if (q.type === "assignments") return true;
    return false;
  };

  const handleNext = async () => {
    if (!canProceed()) return;
    let val: number|string|Assignment[] = 0;
    if (q.type === "choice" && selected !== null) val = q.choices![selected].val;
    else if (q.type === "slider") val = sliderVal;
    else if (q.type === "textarea") val = textVal;
    else if (q.type === "assignments") val = assignments;

    const newAnswers = { ...answers, [q.id]: val };
    setAnswers(newAnswers);
    setSelected(null); setTextVal(""); setSliderVal(50);

    if (current + 1 < totalQ) {
      setCurrent(current + 1);
    } else {
      setSubmitting(true);
      try {
        const res = await axios.post("/api/checkin", { answers: newAnswers }, { withCredentials: true });
        if (res.data.success) {
          const { scores, aiResponse, logId } = res.data;
          const params = new URLSearchParams({
            burnout:   String(scores.burnout),
            stress:    String(scores.stress),
            anxiety:   String(scores.anxiety),
            sleep:     String(scores.sleep),
            wellbeing: String(scores.wellbeing),
            tasks:     String(assignments.length),
            logId:     String(logId),
            ai:        encodeURIComponent(aiResponse),
          });
          router.push(`/results?${params.toString()}`);
          return;
        }
      } catch (err) {
        console.error("Check-in submit error:", err);
      }
      // Fallback: compute locally if API fails
      const numericVals = Object.entries(newAnswers)
        .filter(([,v]) => typeof v === "number")
        .map(([,v]) => v as number);
      const avg = numericVals.reduce((a,b)=>a+b,0) / numericVals.length;
      const stressOverride = typeof newAnswers.stress_slider === "number" ? newAnswers.stress_slider : 50;
      const burnout = Math.min(95, Math.round((100 - avg) * 0.7 + stressOverride * 0.3));
      const stress  = Math.min(95, Math.round(stressOverride * 0.6 + (100 - avg) * 0.4));
      const anxiety = Math.min(95, Math.round((burnout + stress) / 2 * 0.9));
      const params = new URLSearchParams({
        burnout: String(burnout), stress: String(stress), anxiety: String(anxiety),
        sleep: String(newAnswers.sleep_hours ?? 60), tasks: String(assignments.length),
      });
      router.push(`/results?${params.toString()}`);
      setSubmitting(false);
    }
  };

  const sliderColor = sliderVal >= 70 ? "#ff3b5c" : sliderVal >= 40 ? "#ffcc00" : "#00ffa3";

  return (
    <div style={{ minHeight:"100vh", background:"var(--bg)", position:"relative" }}>
      <ParticleBackground />
      <Header />

      <div style={{ paddingTop:62, minHeight:"100vh", display:"flex", flexDirection:"column",
        alignItems:"center", justifyContent:"center", padding:"80px 24px 48px",
        position:"relative", zIndex:1 }}>

        {/* Phase + progress */}
        <div style={{ width:"100%", maxWidth:620, marginBottom:28 }}>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:12 }}>
            <div style={{ display:"flex", alignItems:"center", gap:8 }}>
              <span style={{ width:7, height:7, borderRadius:"50%", background:phaseColor,
                boxShadow:`0 0 8px ${phaseColor}`, display:"inline-block" }} />
              <span style={{ fontSize:11, fontWeight:800, letterSpacing:"0.12em", textTransform:"uppercase", color:phaseColor }}>
                {q.phase}
              </span>
            </div>
            <span style={{ fontSize:12, color:"#3d4a5c", fontFamily:"monospace" }}>
              {current+1} / {totalQ}
            </span>
          </div>

          {/* Step dots */}
          <div style={{ display:"flex", gap:4, marginBottom:10 }}>
            {QUESTIONS.map((_,i) => (
              <div key={i} style={{ flex:1, height:3, borderRadius:2,
                background: i < current ? phaseColors[QUESTIONS[i].phase] : i===current ? `${phaseColor}60` : "rgba(255,255,255,0.05)",
                transition:"background 0.3s" }} />
            ))}
          </div>
        </div>

        {/* Question card */}
        <AnimatePresence mode="wait">
          <motion.div key={current}
            initial={{ opacity:0, x:50, scale:0.98 }} animate={{ opacity:1, x:0, scale:1 }}
            exit={{ opacity:0, x:-50, scale:0.98 }} transition={{ duration:0.3, ease:[0.4,0,0.2,1] }}
            style={{ width:"100%", maxWidth:620 }}>

            <div className="glass" style={{ padding:"36px 32px" }}>
              {/* top accent */}
              <div style={{ position:"absolute", top:0, left:"10%", right:"10%", height:1,
                background:`linear-gradient(90deg,transparent,${phaseColor}60,transparent)` }} />

              {/* Question */}
              <div style={{ marginBottom:28 }}>
                <h2 style={{ fontSize:"clamp(1.05rem,2.5vw,1.3rem)", fontWeight:800,
                  letterSpacing:"-0.02em", lineHeight:1.35, marginBottom:10, color:"#eef2ff" }}>
                  {q.q}
                </h2>
                <p style={{ fontSize:13, color:"#3d4a5c", lineHeight:1.6 }}>{q.sub}</p>
              </div>

              {/* Choice */}
              {q.type === "choice" && (
                <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
                  {q.choices!.map((c,i) => (
                    <motion.button key={i} whileTap={{ scale:0.99 }}
                      onClick={()=>setSelected(i)}
                      className={`opt-card${selected===i?" selected":""}`}>
                      <span style={{ width:20, height:20, borderRadius:"50%", border:"1.5px solid",
                        borderColor: selected===i ? phaseColor : "rgba(255,255,255,0.12)",
                        background: selected===i ? phaseColor : "transparent",
                        display:"flex", alignItems:"center", justifyContent:"center",
                        fontSize:10, color:"#000", flexShrink:0, transition:"all 0.2s" }}>
                        {selected===i ? "✓" : ""}
                      </span>
                      <div style={{ flex:1 }}>
                        <div style={{ fontSize:14, fontWeight: selected===i ? 700 : 500,
                          color: selected===i ? "#eef2ff" : "#94a3b8" }}>{c.label}</div>
                        <div style={{ fontSize:11, color:"#3d4a5c", marginTop:1 }}>{c.sub}</div>
                      </div>
                    </motion.button>
                  ))}
                </div>
              )}

              {/* Slider */}
              {q.type === "slider" && (
                <div style={{ padding:"8px 0" }}>
                  <div style={{ display:"flex", justifyContent:"space-between", marginBottom:16, fontSize:12, color:"#3d4a5c" }}>
                    <span>0 — Completely calm</span>
                    <span>100 — Full panic</span>
                  </div>
                  <div style={{ position:"relative", marginBottom:20 }}>
                    <input type="range" min={0} max={100} value={sliderVal}
                      onChange={e=>setSliderVal(Number(e.target.value))}
                      style={{ width:"100%", accentColor:sliderColor }} />
                    <div style={{ position:"absolute", top:-36, left:`${sliderVal}%`,
                      transform:"translateX(-50%)", transition:"left 0.1s" }}>
                      <div style={{ padding:"4px 10px", borderRadius:8, background:sliderColor,
                        color:"#000", fontSize:13, fontWeight:800, whiteSpace:"nowrap" }}>
                        {sliderVal}
                      </div>
                    </div>
                  </div>
                  <div style={{ textAlign:"center", marginTop:8 }}>
                    <span style={{ fontSize:28, fontWeight:900, color:sliderColor }}>{sliderVal}</span>
                    <span style={{ fontSize:14, color:"#3d4a5c", marginLeft:8 }}>/ 100</span>
                  </div>
                  <div style={{ textAlign:"center", marginTop:8, fontSize:13, color:"#3d4a5c" }}>
                    {sliderVal >= 80 ? "🚨 Very high stress — your twin will flag this" :
                     sliderVal >= 60 ? "⚠️ Elevated stress — needs attention" :
                     sliderVal >= 40 ? "📊 Moderate stress — manageable" :
                     sliderVal >= 20 ? "✅ Low stress — good state" : "🌿 Minimal stress — excellent"}
                  </div>
                </div>
              )}

              {/* Textarea */}
              {q.type === "textarea" && (
                <div>
                  <textarea className="inp" placeholder={q.placeholder} value={textVal}
                    onChange={e=>setTextVal(e.target.value)}
                    style={{ minHeight:130, fontSize:14, lineHeight:1.65 }} />
                  <div style={{ display:"flex", justifyContent:"space-between", marginTop:8, fontSize:11, color:"#3d4a5c" }}>
                    <span>{textVal.length} characters</span>
                    <span>{textVal.length < 30 ? "Add more context for better predictions" : "Good detail ✓"}</span>
                  </div>
                </div>
              )}

              {/* Assignments */}
              {q.type === "assignments" && (
                <AssignmentEntry value={assignments} onChange={setAssignments} />
              )}

              {/* Next button */}
              <motion.button onClick={handleNext} disabled={!canProceed() || submitting}
                whileHover={canProceed() ? { scale:1.01 } : {}}
                whileTap={canProceed() ? { scale:0.99 } : {}}
                style={{ width:"100%", marginTop:24, justifyContent:"center",
                  display:"flex", alignItems:"center", gap:8,
                  fontSize:15, padding:"15px", borderRadius:14, border:"none",
                  opacity: canProceed() && !submitting ? 1 : 0.35,
                  cursor: canProceed() && !submitting ? "pointer" : "not-allowed",
                  background: canProceed() ? `linear-gradient(135deg,${phaseColor},#b06ef3)` : "rgba(255,255,255,0.05)",
                  color: canProceed() ? "#000" : "#3d4a5c",
                  fontWeight: 800, transition: "all 0.2s" }}>
                {submitting ? (
                  <><motion.span animate={{ rotate:360 }} transition={{ repeat:Infinity, duration:0.8, ease:"linear" }}
                    style={{ display:"inline-block", width:16, height:16, border:"2.5px solid #000",
                      borderTopColor:"transparent", borderRadius:"50%" }} />
                  Analysing with AI...</>
                ) : current + 1 === totalQ ? "Analyse My State →" : "Next →"}
              </motion.button>
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Twin hint */}
        <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} transition={{ delay:0.6 }}
          style={{ marginTop:20, display:"flex", alignItems:"center", gap:12, padding:"12px 18px",
            borderRadius:12, background:"rgba(176,110,243,0.06)", border:"1px solid rgba(176,110,243,0.15)",
            maxWidth:620, width:"100%" }}>
          <div style={{ width:32, height:32, borderRadius:9, background:"linear-gradient(135deg,#00f0ff,#b06ef3)",
            display:"flex", alignItems:"center", justifyContent:"center", fontSize:14, fontWeight:900, color:"#000", flexShrink:0 }}>Ψ</div>
          <p style={{ fontSize:12, color:"#3d4a5c", lineHeight:1.5 }}>
            <span style={{ color:"#b06ef3", fontWeight:700 }}>Your Digital Twin</span> is building your profile. The more context you give, the more accurate your burnout prediction will be.
          </p>
        </motion.div>
      </div>
    </div>
  );
}
