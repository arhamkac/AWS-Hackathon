import { NextResponse } from "next/server";
import { connectDB } from "@/lib/dbConnect";
import User from "@/models/userModel";
import { getToken } from "@/controllers/authController";
import bcrypt from "bcryptjs";

export async function POST(req: Request) {
  try {
    await connectDB();

    const body = await req.json();
    const { 
      name, 
      email, 
      password, 
      rollNo,
      academic,
      goals,
      avatar 
    } = body;

    // Validate required fields
    if (!name || !email || !password) {
      return NextResponse.json(
        { success: false, message: "Name, email, and password are required" },
        { status: 400 }
      );
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return NextResponse.json(
        { success: false, message: "User already exists with this email" },
        { status: 409 }
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create user with profile data
    const userData: any = {
      name,
      email,
      password: hashedPassword,
      authProvider: 'email',
      lastLoginAt: new Date(),
      isProfileComplete: !!(academic && goals),
      profileCompletedAt: (academic && goals) ? new Date() : undefined
    };

    if (academic) {
      userData.academic = {
        university: academic.university,
        branch: academic.branch,
        semester: academic.semester,
        currentCGPA: parseFloat(academic.cgpa),
        rollNumber: academic.rollNumber || rollNo,
        year: academic.year ? parseInt(academic.year) : undefined
      };
    }

    if (goals) {
      userData.goals = {
        selectedGoals: goals.selectedGoals || [],
        completedAchievements: goals.selectedCompleted || [],
        extraContext: goals.extraContext
      };
    }

    if (avatar) {
      userData.avatar = avatar;
    }

    const user = await User.create(userData);

    const token = await getToken(user._id.toString());
    if (!token) throw new Error("Token generation failed");

    const response = NextResponse.json(
      {
        success: true,
        message: "Account created successfully",
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          isProfileComplete: user.isProfileComplete,
          avatar: user.avatar
        }
      },
      { status: 201 }
    );

    // Set cookie
    response.cookies.set("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60,
      path: "/",
    });

    return response;
  } catch (error: any) {
    console.error("Signup error:", error);

    return NextResponse.json(
      { success: false, message: "Account creation failed" },
      { status: 500 }
    );
  }
}