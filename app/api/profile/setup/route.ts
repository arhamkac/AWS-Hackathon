import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/dbConnect";
import User from "@/models/userModel";
import { getUserFromRequest } from "@/controllers/authController";

// POST - Complete profile setup
export async function POST(req: NextRequest) {
  try {
    await connectDB();

    const userId = await getUserFromRequest(req);
    if (!userId) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await req.json();
    const { academic, goals, avatar } = body;

    // Validate required fields
    if (!academic || !goals) {
      return NextResponse.json(
        { success: false, message: "Academic and goals information are required" },
        { status: 400 }
      );
    }

    const user = await User.findById(userId);
    if (!user) {
      return NextResponse.json(
        { success: false, message: "User not found" },
        { status: 404 }
      );
    }

    // Update user profile
    user.academic = {
      university: academic.university,
      branch: academic.branch,
      semester: academic.semester,
      currentCGPA: parseFloat(academic.cgpa),
      rollNumber: academic.rollNumber,
      year: academic.year ? parseInt(academic.year) : undefined
    };

    user.goals = {
      selectedGoals: goals.selectedGoals || [],
      completedAchievements: goals.selectedCompleted || [],
      extraContext: goals.extraContext
    };

    if (avatar) {
      user.avatar = { ...user.avatar, ...avatar };
    }

    // Mark profile as complete
    user.isProfileComplete = true;
    user.profileCompletedAt = new Date();

    await user.save();

    return NextResponse.json(
      {
        success: true,
        message: "Profile setup completed successfully",
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          isProfileComplete: user.isProfileComplete,
          academic: user.academic,
          goals: user.goals,
          avatar: user.avatar
        }
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Profile setup error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to complete profile setup" },
      { status: 500 }
    );
  }
}