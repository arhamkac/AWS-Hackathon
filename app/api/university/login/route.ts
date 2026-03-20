import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { SignJWT } from "jose";
import { connectDB } from "@/lib/dbConnect";
import University from "@/models/universityModel";

const SECRET = new TextEncoder().encode(process.env.JWT_SECRET_KEY!);

export async function POST(req: NextRequest) {
  try {
    await connectDB();
    const { contactEmail, password } = await req.json();
    if (!contactEmail || !password)
      return NextResponse.json({ success: false, message: "Email and password required" }, { status: 400 });

    const uni = await University.findOne({ contactEmail: contactEmail.toLowerCase() });
    if (!uni)
      return NextResponse.json({ success: false, message: "Invalid credentials" }, { status: 401 });

    const valid = await bcrypt.compare(password, uni.password);
    if (!valid)
      return NextResponse.json({ success: false, message: "Invalid credentials" }, { status: 401 });

    const token = await new SignJWT({ uniId: String(uni._id), role: "university" })
      .setProtectedHeader({ alg: "HS256" })
      .setExpirationTime("7d")
      .sign(SECRET);

    const res = NextResponse.json({
      success: true,
      university: { id: uni._id, name: uni.name, code: uni.code, contactEmail: uni.contactEmail },
    });
    res.cookies.set("uni_token", token, { httpOnly: true, path: "/", maxAge: 60 * 60 * 24 * 7, sameSite: "lax" });
    return res;
  } catch (err) {
    console.error("University login error:", err);
    return NextResponse.json({ success: false, message: "Login failed" }, { status: 500 });
  }
}

export async function DELETE() {
  const res = NextResponse.json({ success: true });
  res.cookies.set("uni_token", "", { httpOnly: true, path: "/", maxAge: 0 });
  return res;
}
