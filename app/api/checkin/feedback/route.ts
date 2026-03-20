import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/dbConnect";
import MoodLog from "@/models/moodLog";
import { getUserFromRequest } from "@/controllers/authController";

// POST /api/checkin/feedback — user rates the AI response accuracy
export async function POST(req: NextRequest) {
  try {
    await connectDB();
    const userId = await getUserFromRequest(req);
    if (!userId) return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });

    const { logId, helpful, accuracyRating, note } = await req.json();
    if (!logId || accuracyRating == null) {
      return NextResponse.json({ success: false, message: "logId and accuracyRating required" }, { status: 400 });
    }

    const log = await MoodLog.findOne({ _id: logId, userId });
    if (!log) return NextResponse.json({ success: false, message: "Log not found" }, { status: 404 });

    log.userFeedback = { helpful: !!helpful, accuracyRating, note };
    await log.save();

    return NextResponse.json({ success: true, message: "Feedback saved" }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ success: false, message: "Failed to save feedback" }, { status: 500 });
  }
}
