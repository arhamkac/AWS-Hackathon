import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/dbConnect";
import MoodLog from "@/models/moodLog";
import { getUserFromRequest } from "@/controllers/authController";

export async function GET(req: NextRequest) {
  try {
    await connectDB();
    const userId = await getUserFromRequest(req);
    if (!userId) return NextResponse.json({ success: false }, { status: 401 });

    const logs = await MoodLog.find({ userId })
      .sort({ createdAt: -1 })
      .limit(14)
      .select("dailySnapshot scores createdAt");

    // Reverse so charts go oldest → newest
    const ordered = [...logs].reverse();

    const chartData = ordered.map(log => {
      const d = new Date(log.createdAt);
      const day = d.toLocaleDateString("en-IN", { weekday: "short", day: "numeric" });
      return {
        day,
        stress:       log.scores.stress,
        burnout:      log.scores.burnout,
        anxiety:      log.scores.anxiety,
        sleep:        log.dailySnapshot?.sleepHours ?? 0,
        mood:         log.dailySnapshot?.moodNow ?? 0,
        exercise:     log.dailySnapshot?.exercise ?? 0,
        nutrition:    log.dailySnapshot?.nutrition ?? 0,
        social:       log.dailySnapshot?.social ?? 0,
        tasks:        log.dailySnapshot?.assignmentCount ?? 0,
        pendingHours: log.dailySnapshot?.pendingHours ?? 0,
      };
    });

    // Latest snapshot for stat cards
    const latest = logs[0];
    const latestSnapshot = latest ? {
      stress:          latest.scores.stress,
      burnout:         latest.scores.burnout,
      anxiety:         latest.scores.anxiety,
      sleep:           latest.dailySnapshot?.sleepHours ?? 0,
      assignmentCount: latest.dailySnapshot?.assignmentCount ?? 0,
      pendingHours:    latest.dailySnapshot?.pendingHours ?? 0,
      wellbeing:       latest.scores.wellbeing,
    } : null;

    // Radar: average of last 7 logs
    const last7 = ordered.slice(-7);
    const avgSnap = (key: string) =>
      last7.length ? Math.round(last7.reduce((s, l) => s + ((l.dailySnapshot as any)?.[key] ?? 0), 0) / last7.length) : 0;

    const radarData = [
      { subject: "Sleep",     value: avgSnap("sleepHours") },
      { subject: "Mood",      value: avgSnap("moodNow") },
      { subject: "Exercise",  value: avgSnap("exercise") },
      { subject: "Nutrition", value: avgSnap("nutrition") },
      { subject: "Social",    value: avgSnap("social") },
      { subject: "Wellbeing", value: last7.length ? Math.round(last7.reduce((s, l) => s + l.scores.wellbeing, 0) / last7.length) : 0 },
    ];

    return NextResponse.json({ success: true, chartData, latestSnapshot, radarData });
  } catch (err) {
    console.error("Dashboard stats error:", err);
    return NextResponse.json({ success: false }, { status: 500 });
  }
}
