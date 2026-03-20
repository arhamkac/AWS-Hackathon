import { NextResponse } from "next/server";
import { connectDB } from "@/lib/dbConnect";
import User from "@/models/userModel";
import { getToken } from "@/controllers/authController";

export async function POST(req: Request) {
  try {
    await connectDB();

    const body = await req.json();
    const { name, email, firebaseUID, photoURL } = body;

    if (!name || !email) {
      return NextResponse.json(
        { success: false, message: "Name and email are required" },
        { status: 400 }
      );
    }

    let user = await User.findOne({ 
      $or: [{ email }, { firebaseUID }] 
    });

    if (!user) {
      user = await User.create({
        name,
        email,
        firebaseUID,
        authProvider: 'google',
        lastLoginAt: new Date(),
        isProfileComplete: false
      });
    } else {
      // Update last login
      user.lastLoginAt = new Date();
      if (!user.firebaseUID && firebaseUID) {
        user.firebaseUID = firebaseUID;
      }
      await user.save();
    }

    const token = await getToken(user._id.toString());
    if (!token) throw new Error("Token generation failed");
    
    const response = NextResponse.json(
      {
        success: true,
        message: "Login successful",
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          isProfileComplete: user.isProfileComplete,
          avatar: user.avatar
        },
        needsProfileSetup: !user.isProfileComplete
      },
      { status: 200 }
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
    console.error("Google auth error:", error);

    return NextResponse.json(
      { success: false, message: "Authentication failed" },
      { status: 500 }
    );
  }
}

export async function DELETE() {
  try {
    const response = NextResponse.json(
      {
        success: true,
        message: "Logged out successfully",
      },
      { status: 200 }
    );

    // Clear the token cookie
    response.cookies.set("token", "", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      expires: new Date(0),
      path: "/",
    });

    return response;
  } catch (error: any) {
    console.error("Logout error:", error.message);

    return NextResponse.json(
      {
        success: false,
        message: "Logout failed",
      },
      { status: 500 }
    );
  }
}