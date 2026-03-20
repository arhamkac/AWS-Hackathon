import { SignJWT, jwtVerify } from "jose";
import { NextRequest } from "next/server";

export const getToken = async (userId: string) => {
  try {
    const secret = new TextEncoder().encode(
      process.env.JWT_SECRET_KEY
    );

    const token = await new SignJWT({ userId })
      .setProtectedHeader({ alg: "HS256" })
      .setExpirationTime("7d")
      .sign(secret);

    return token;
  } catch (error: any) {
    console.log(error.message);
  }
};

export const verifyToken = async (token: string) => {
  try {
    const secret = new TextEncoder().encode(
      process.env.JWT_SECRET_KEY
    );

    const { payload } = await jwtVerify(token, secret);
    return payload;
  } catch (error: any) {
    console.log("Token verification failed:", error.message);
    return null;
  }
};

export const getUserFromRequest = async (req: NextRequest) => {
  try {
    const token = req.cookies.get("token")?.value;
    if (!token) return null;

    const payload = await verifyToken(token);
    return payload?.userId as string || null;
  } catch (error: any) {
    console.log("Get user from request failed:", error.message);
    return null;
  }
};