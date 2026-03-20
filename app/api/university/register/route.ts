import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { connectDB } from "@/lib/dbConnect";
import University from "@/models/universityModel";

export async function POST(req: NextRequest) {
  try {
    await connectDB();
    const { name, code, contactEmail, password, emailDomain, departments } = await req.json();

    if (!name || !code || !contactEmail || !password)
      return NextResponse.json({ success: false, message: "name, code, contactEmail and password are required" }, { status: 400 });

    const exists = await University.findOne({ $or: [{ code: code.toUpperCase() }, { contactEmail: contactEmail.toLowerCase() }] });
    if (exists)
      return NextResponse.json({ success: false, message: "University code or email already registered" }, { status: 409 });

    const hashed = await bcrypt.hash(password, 10);
    const uni = await University.create({
      name, code, contactEmail, password: hashed,
      emailDomain: emailDomain || undefined,
      departments: departments || [],
    });

    return NextResponse.json({ success: true, universityId: uni._id, code: uni.code }, { status: 201 });
  } catch (err) {
    console.error("University register error:", err);
    return NextResponse.json({ success: false, message: "Registration failed" }, { status: 500 });
  }
}
