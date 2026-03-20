import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export interface CheckInData {
  answers: Record<string, any>;
  scores: { stress: number; burnout: number; anxiety: number; sleep: number; wellbeing: number };
  userProfile: {
    name: string;
    branch?: string;
    semester?: string;
    cgpa?: number;
    goals?: string[];
  };
  history: Array<{
    date: string;
    scores: { stress: number; burnout: number; anxiety: number };
    aiResponse: string;
  }>;
}

export async function getAIResponse(data: CheckInData): Promise<string> {
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

  const historyText = data.history.length > 0
    ? data.history.slice(0, 5).map(h =>
        `${h.date}: stress=${h.scores.stress}, burnout=${h.scores.burnout}, anxiety=${h.scores.anxiety} — "${h.aiResponse}"`
      ).join("\n")
    : "No previous check-ins yet.";

  const assignmentText = Array.isArray(data.answers.assignments) && data.answers.assignments.length > 0
    ? data.answers.assignments.map((a: any) =>
        `${a.name} (${a.subject}) — ${a.difficulty}, due ${a.dueWhen}, ${a.percentDone}% done, ~${a.hoursLeft}h needed`
      ).join("\n")
    : "No assignments entered.";

  const prompt = `You are a personal AI assistant acting as the user's Digital Twin.

Your job is to:
- Understand the user's emotional state
- Detect patterns in their behavior
- Give short, practical, and supportive advice
- Be calm, slightly intelligent, and not overly emotional
- Sound like a smart friend, not a therapist

-----------------------

USER TODAY:
Name: ${data.userProfile.name}
Branch: ${data.userProfile.branch || "Unknown"} | Semester: ${data.userProfile.semester || "Unknown"} | CGPA: ${data.userProfile.cgpa || "Unknown"}
Goals: ${data.userProfile.goals?.join(", ") || "Not set"}

Stress Score: ${data.scores.stress}/100
Burnout Score: ${data.scores.burnout}/100
Anxiety Score: ${data.scores.anxiety}/100
Sleep Score: ${data.scores.sleep}/100 (higher = better sleep)
Wellbeing Score: ${data.scores.wellbeing}/100

Self-reported stress: ${data.answers.stress_slider}/100
Mood: ${data.answers.mood_now}/100 (higher = better mood)
What's stressing them: "${data.answers.stress_context || "Not specified"}"
Additional context: "${data.answers.feedback || "None"}"

Pending assignments:
${assignmentText}

-----------------------

PAST BEHAVIOR (recent check-ins):
${historyText}

-----------------------

INSTRUCTIONS:
1. Analyze how the user is feeling today
2. Compare with past patterns if relevant
3. Give a SHORT response (max 2–3 sentences)
4. Be specific and actionable — reference their actual situation
5. Do NOT be generic or robotic
6. Do NOT give long paragraphs
7. If stressed → simplify their tasks
8. If consistent → encourage momentum
9. If low energy → suggest lighter approach
10. Reference their actual assignments or goals when relevant

RESPONSE STYLE EXAMPLES:
- "You've been low on energy for a few days. Keep tomorrow simple—just start with one small task."
- "You're doing better than yesterday. Try to maintain this momentum with focused work blocks."
- "You seem overwhelmed. Break your goal into smaller parts and tackle just one."

Now generate the best possible response (2-3 sentences max, no bullet points, no headers):`;

  const result = await model.generateContent(prompt);
  return result.response.text().trim();
}

// Compute stress scores from raw check-in answers
// Each factor has a weight based on research importance
export function computeScores(answers: Record<string, any>): {
  stress: number; burnout: number; anxiety: number; sleep: number; wellbeing: number;
} {
  const get = (key: string, fallback = 50) =>
    typeof answers[key] === "number" ? answers[key] : fallback;

  const sleepHours   = get("sleep_hours",   65);
  const sleepQuality = get("sleep_quality", 65);
  const moodNow      = get("mood_now",      65);
  const stressSlider = get("stress_slider", 50);
  const classesToday = get("classes_today", 70);
  const lastBreak    = get("last_break",    60);
  const physState    = get("physical_state",65);
  const exercise     = get("exercise",      50);
  const nutrition    = get("nutrition",     60);
  const social       = get("social",        60);

  // Assignment load penalty (0–30 extra stress points)
  const assignments = Array.isArray(answers.assignments) ? answers.assignments : [];
  const assignmentPenalty = Math.min(30, assignments.reduce((acc: number, a: any) => {
    const diffMap: Record<string, number> = { easy: 2, medium: 5, hard: 9, nightmare: 14 };
    const urgencyMap: Record<string, number> = { today: 3, tomorrow: 2, "2-3 days": 1.5, "this week": 1, "next week": 0.5 };
    const remaining = (100 - (a.percentDone || 0)) / 100;
    return acc + (diffMap[a.difficulty] || 5) * (urgencyMap[a.dueWhen] || 1) * remaining;
  }, 0));

  // Sleep score (higher = better)
  const sleep = Math.round((sleepHours * 0.6 + sleepQuality * 0.4));

  // Wellbeing composite (higher = better)
  const wellbeing = Math.round(
    physState   * 0.20 +
    exercise    * 0.15 +
    nutrition   * 0.20 +
    social      * 0.15 +
    lastBreak   * 0.15 +
    classesToday* 0.15
  );

  // Stress (higher = worse) — invert wellbeing/sleep, add slider weight
  const stressBase = Math.round(
    (100 - moodNow)      * 0.25 +
    stressSlider         * 0.30 +
    (100 - sleep)        * 0.20 +
    (100 - wellbeing)    * 0.15 +
    assignmentPenalty    * 0.10
  );
  const stress = Math.min(98, Math.max(2, stressBase));

  // Burnout (accumulation of low recovery + high load)
  const burnout = Math.min(98, Math.max(2, Math.round(
    (100 - lastBreak)    * 0.30 +
    (100 - sleep)        * 0.25 +
    assignmentPenalty    * 0.20 +
    (100 - physState)    * 0.15 +
    (100 - social)       * 0.10
  )));

  // Anxiety (mood + stress + social isolation)
  const anxiety = Math.min(98, Math.max(2, Math.round(
    (100 - moodNow)      * 0.35 +
    stressSlider         * 0.30 +
    (100 - social)       * 0.20 +
    (100 - sleep)        * 0.15
  )));

  return { stress, burnout, anxiety, sleep, wellbeing };
}
