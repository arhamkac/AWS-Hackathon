import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/dbConnect";
import User from "@/models/userModel";
import MoodLog from "@/models/moodLog";
import { getUserFromRequest } from "@/controllers/authController";

export async function POST(req: NextRequest) {
  try {
    await connectDB();
    const userId = await getUserFromRequest(req);
    if (!userId) return NextResponse.json({ success: false }, { status: 401 });

    const { message, rollNumber } = await req.json();

    const [user, latestLog] = await Promise.all([
      User.findById(userId).select("-password"),
      MoodLog.findOne({ userId }).sort({ createdAt: -1 }).select("scores dailySnapshot answers.stress_context answers.feedback createdAt"),
    ]);

    if (!user) return NextResponse.json({ success: false }, { status: 404 });

    const roll = rollNumber?.trim() || user.academic?.rollNumber || "Not provided";

    const now = new Date().toLocaleString("en-IN", {
      day: "numeric", month: "long", year: "numeric",
      hour: "2-digit", minute: "2-digit", timeZoneName: "short",
    });

    const scores = latestLog?.scores;
    const snap   = latestLog?.dailySnapshot;

    // Build the full message that will be sent to the counsellor
    const fullMessage = `
EMERGENCY SUPPORT REQUEST — DigitalTwin.AI
==========================================
Sent: ${now}

STUDENT DETAILS
---------------
Name:        ${user.name}
Roll Number: ${roll}
Email:       ${user.email}
Branch:      ${user.academic?.branch || "Not provided"}
Semester:    ${user.academic?.semester || "Not provided"}
CGPA:        ${user.academic?.currentCGPA ?? "Not provided"}
University:  ${user.academic?.university || "Not provided"}

LATEST MENTAL HEALTH SCORES${latestLog ? ` (${new Date(latestLog.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })})` : " (no check-in on record)"}
----------------------------
${scores ? `Stress:    ${scores.stress}/100
Burnout:   ${scores.burnout}/100
Anxiety:   ${scores.anxiety}/100
Wellbeing: ${scores.wellbeing}/100` : "No check-in data available."}
${snap ? `
Sleep score:      ${snap.sleepHours}/100
Pending tasks:    ${snap.assignmentCount} (~${snap.pendingHours?.toFixed(1)}h of work remaining)` : ""}
${latestLog?.answers?.stress_context ? `
Self-reported stress context:
"${latestLog.answers.stress_context}"` : ""}
${latestLog?.answers?.feedback ? `
Additional context from student:
"${latestLog.answers.feedback}"` : ""}

MESSAGE FROM STUDENT
--------------------
${message?.trim() || "(No personal message provided)"}

==========================================
This message was sent via the DigitalTwin.AI SOS system.
The student has consented to sharing this data with university authorities.
Please reach out to the student within 24 hours.
`.trim();

    // TODO: uncomment when ready to send via email (e.g. AWS SES / Nodemailer)
    // console.log("=== SOS MESSAGE ===");
    // console.log(fullMessage);
    // console.log("==================");

    return NextResponse.json({ success: true, fullMessage, studentEmail: user.email });
  } catch (err) {
    console.error("Emergency API error:", err);
    return NextResponse.json({ success: false }, { status: 500 });
  }
}
