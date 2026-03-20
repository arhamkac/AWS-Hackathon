import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/dbConnect";
import User from "@/models/userModel";
import { getUserFromRequest } from "@/controllers/authController";

// GET - Get user dashboard data
export async function GET(req: NextRequest) {
  try {
    await connectDB();

    const userId = await getUserFromRequest(req);
    if (!userId) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    const user = await User.findById(userId).select('-password');
    if (!user) {
      return NextResponse.json(
        { success: false, message: "User not found" },
        { status: 404 }
      );
    }

    // Calculate profile completion percentage
    let completionPercentage = 0;
    if (user.name) completionPercentage += 20;
    if (user.email) completionPercentage += 20;
    if (user.academic?.university && user.academic?.branch) completionPercentage += 30;
    if (user.goals?.selectedGoals?.length > 0) completionPercentage += 20;
    if (user.avatar?.skinTone) completionPercentage += 10;

    // Calculate days since joining
    const daysSinceJoining = Math.floor(
      (new Date().getTime() - new Date(user.createdAt).getTime()) / (1000 * 60 * 60 * 24)
    );

    // Generate some mock stats based on user data
    const stats = {
      profileCompletion: completionPercentage,
      daysSinceJoining,
      goalsSet: user.goals?.selectedGoals?.length || 0,
      achievementsUnlocked: user.goals?.completedAchievements?.length || 0,
      currentCGPA: user.academic?.currentCGPA || 0,
      semester: user.academic?.semester || "Not set"
    };

    return NextResponse.json(
      {
        success: true,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          isProfileComplete: user.isProfileComplete,
          academic: user.academic,
          goals: user.goals,
          avatar: user.avatar,
          authProvider: user.authProvider,
          lastLoginAt: user.lastLoginAt,
          createdAt: user.createdAt
        },
        stats
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Get user dashboard error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch user data" },
      { status: 500 }
    );
  }
}