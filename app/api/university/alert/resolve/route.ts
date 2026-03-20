import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";
import { connectDB } from "@/lib/dbConnect";
import Alert from "@/models/alertModel";

const SECRET = new TextEncoder().encode(process.env.JWT_SECRET_KEY!);

async function getUniFromRequest(req: NextRequest) {
  const token = req.cookies.get("uni_token")?.value;
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, SECRET);
    return payload.uniId as string;
  } catch { return null; }
}

export async function PATCH(req: NextRequest) {
  try {
    await connectDB();
    const uniId = await getUniFromRequest(req);
    if (!uniId) return NextResponse.json({ success: false }, { status: 401 });

    const { alertId, status, reviewNote } = await req.json();
    if (!alertId || !status) return NextResponse.json({ success: false, message: "alertId and status required" }, { status: 400 });

    const alert = await Alert.findOneAndUpdate(
      { _id: alertId, universityId: uniId },
      { status, ...(reviewNote ? { reviewNote } : {}) },
      { new: true }
    );
    if (!alert) return NextResponse.json({ success: false, message: "Alert not found" }, { status: 404 });

    return NextResponse.json({ success: true, alert });
  } catch (err) {
    console.error("Alert resolve error:", err);
    return NextResponse.json({ success: false }, { status: 500 });
  }
}
