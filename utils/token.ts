import jwt from "jsonwebtoken";

export const getToken = (userId: string): string => {
  try {
    const secret = process.env.JWT_SECRET_KEY as string;

    if (!secret) {
      throw new Error("JWT_SECRET_KEY is not defined");
    }

    const token = jwt.sign(
      { userId },
      secret,
      { expiresIn: "7d" }
    );

    console.log("Generated Token:", token);

    return token;
  } catch (error: any) {
    console.error("Token generation error:", error.message);
    throw new Error("Failed to generate token");
  }
};