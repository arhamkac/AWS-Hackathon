import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/dbConnect";
import MoodLog from "@/models/moodLog";
import { getUserFromRequest } from "@/controllers/authController";

export async function GET(req: NextRequest) {
  try {
    await connectDB();
    const userId = await getUserFromRequest(req);
    if (!userId) return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });

    const logs = await MoodLog.find({ userId })
      .sort({ createdAt: -1 })
      .limit(10)
      .select("scores aiResponse userFeedback createdAt");

    return NextResponse.json({ success: true, logs }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ success: false, message: "Failed to fetch history" }, { status: 500 });
  }
}
