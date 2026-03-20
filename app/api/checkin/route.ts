import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/dbConnect";
import User from "@/models/userModel";
import MoodLog from "@/models/moodLog";
import University from "@/models/universityModel";
import Alert from "@/models/alertModel";
import { getUserFromRequest } from "@/controllers/authController";
import { computeScores, getAIResponse } from "@/lib/gemini";
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export async function POST(req: NextRequest) {
  try {
    await connectDB();

    const userId = await getUserFromRequest(req);
    if (!userId) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    const { answers } = await req.json();
    if (!answers) {
      return NextResponse.json({ success: false, message: "Answers required" }, { status: 400 });
    }

    // Fetch user profile for context
    const user = await User.findById(userId).select("-password");
    if (!user) {
      return NextResponse.json({ success: false, message: "User not found" }, { status: 404 });
    }

    // Fetch last 5 check-ins for pattern detection
    const history = await MoodLog.find({ userId })
      .sort({ createdAt: -1 })
      .limit(5)
      .select("scores aiResponse createdAt");

    const historyForAI = history.map(h => ({
      date: new Date(h.createdAt).toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "short" }),
      scores: h.scores,
      aiResponse: h.aiResponse,
    }));

    // Compute scores
    const scores = computeScores(answers);

    // Get AI response from Gemini
    let aiResponse = "Stay focused and take it one step at a time. You've got this.";
    try {
      aiResponse = await getAIResponse({
        answers,
        scores,
        userProfile: {
          name:     user.name,
          branch:   user.academic?.branch,
          semester: user.academic?.semester,
          cgpa:     user.academic?.currentCGPA,
          goals:    user.goals?.selectedGoals,
        },
        history: historyForAI,
      });
    } catch (aiErr) {
      console.error("Gemini error:", aiErr);
      // Fall back to rule-based response
      aiResponse = scores.stress >= 70
        ? `${user.name.split(" ")[0]}, your stress is high today. Focus on just one task and get to bed early tonight.`
        : scores.burnout >= 60
        ? `You're showing burnout signs. Take a proper break today — even 30 minutes helps more than you think.`
        : `You're in a manageable state. Keep your momentum going with focused work blocks.`;
    }

    // Extract compact daily snapshot for charts (avoids storing full answers in queries)
    const assignments = Array.isArray(answers.assignments) ? answers.assignments : [];
    const dailySnapshot = {
      sleepHours:      typeof answers.sleep_hours   === "number" ? answers.sleep_hours   : 0,
      sleepQuality:    typeof answers.sleep_quality === "number" ? answers.sleep_quality : 0,
      stressSlider:    typeof answers.stress_slider === "number" ? answers.stress_slider : 0,
      moodNow:         typeof answers.mood_now      === "number" ? answers.mood_now      : 0,
      exercise:        typeof answers.exercise      === "number" ? answers.exercise      : 0,
      nutrition:       typeof answers.nutrition     === "number" ? answers.nutrition     : 0,
      social:          typeof answers.social        === "number" ? answers.social        : 0,
      assignmentCount: assignments.length,
      pendingHours:    assignments.reduce((sum: number, a: any) => {
        const h = parseFloat(a.hoursLeft) || 0;
        const remaining = (100 - (a.percentDone || 0)) / 100;
        return sum + h * remaining;
      }, 0),
    };

    // Save to DB
    const log = await MoodLog.create({
      userId,
      answers,
      dailySnapshot,
      scores,
      aiResponse,
    });

    // Auto-alert university if scores cross threshold
    try {
      const severity =
        scores.stress >= 85 || scores.burnout >= 85 || scores.anxiety >= 85 ? "emergency" :
        scores.stress >= 70 || scores.burnout >= 70 || scores.anxiety >= 70 ? "critical" :
        scores.stress >= 55 || scores.burnout >= 55 ? "warning" : null;

      if (severity && user.academic?.university) {
        // Find university by name or email domain
        const emailDomain = user.email.split("@")[1];
        const uni = await University.findOne({
          $or: [
            { name: { $regex: new RegExp(user.academic.university, "i") } },
            { emailDomain },
          ],
        });

        if (uni) {
          // Check: don't spam — skip if alert already sent in last 24h for same student
          const recent = await Alert.findOne({
            studentId: userId,
            universityId: uni._id,
            createdAt: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) },
          });

          if (!recent) {
            // Generate AI summary for the university counsellor
            const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
            const summaryPrompt = `You are writing a brief mental health alert summary for a university counsellor.

Student: ${user.name} | Branch: ${user.academic?.branch} | Semester: ${user.academic?.semester} | CGPA: ${user.academic?.currentCGPA} | Roll: ${user.academic?.rollNumber}
Scores today: Stress=${scores.stress}/100, Burnout=${scores.burnout}/100, Anxiety=${scores.anxiety}/100, Wellbeing=${scores.wellbeing}/100
Self-reported stress context: "${answers.stress_context || "Not provided"}"
Additional context: "${answers.feedback || "None"}"
Pending assignments: ${assignments.length} (~${dailySnapshot.pendingHours.toFixed(1)}h of work remaining)

Write a 3-4 sentence professional summary for the counsellor. Include:
1. What the student is experiencing
2. Key risk indicators
3. Recommended action (reach out, schedule session, monitor)
Be factual and clinical, not emotional. No bullet points.`;

            let summary = `${user.name} has reported high ${severity === "emergency" ? "emergency-level" : severity} stress and burnout scores today (Stress: ${scores.stress}, Burnout: ${scores.burnout}, Anxiety: ${scores.anxiety}). Immediate counsellor outreach is recommended.`;
            try {
              const result = await model.generateContent(summaryPrompt);
              summary = result.response.text().trim();
            } catch { /* use fallback summary */ }

            await Alert.create({
              studentId:     userId,
              universityId:  uni._id,
              severity,
              scores:        { stress: scores.stress, burnout: scores.burnout, anxiety: scores.anxiety, wellbeing: scores.wellbeing },
              summary,
              studentName:   user.name,
              studentRoll:   user.academic?.rollNumber || "Unknown",
              studentBranch: user.academic?.branch || "Unknown",
            });
          }
        }
      }
    } catch (alertErr) {
      console.error("Alert creation error (non-fatal):", alertErr);
    }

    return NextResponse.json({
      success: true,
      logId: log._id,
      scores,
      aiResponse,
    }, { status: 201 });

  } catch (error: any) {
    console.error("Check-in error:", error);
    return NextResponse.json({ success: false, message: "Check-in failed" }, { status: 500 });
  }
}
