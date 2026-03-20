import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";
import { connectDB } from "@/lib/dbConnect";
import University from "@/models/universityModel";
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

export async function GET(req: NextRequest) {
  try {
    await connectDB();
    const uniId = await getUniFromRequest(req);
    if (!uniId) return NextResponse.json({ success: false }, { status: 401 });

    const uni = await University.findById(uniId).select("-password");
    if (!uni) return NextResponse.json({ success: false }, { status: 404 });

    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status"); // pending | reviewed | resolved | all

    const filter: Record<string, any> = { universityId: uniId };
    if (status && status !== "all") filter.status = status;

    const alerts = await Alert.find(filter).sort({ createdAt: -1 }).limit(100);

    const counts = {
      pending:  await Alert.countDocuments({ universityId: uniId, status: "pending" }),
      reviewed: await Alert.countDocuments({ universityId: uniId, status: "reviewed" }),
      resolved: await Alert.countDocuments({ universityId: uniId, status: "resolved" }),
    };

    return NextResponse.json({ success: true, university: uni, alerts, counts });
  } catch (err) {
    console.error("University dashboard error:", err);
    return NextResponse.json({ success: false }, { status: 500 });
  }
}
