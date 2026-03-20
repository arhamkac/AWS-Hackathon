import mongoose from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI as string;

if (!MONGODB_URI) {
  throw new Error("❌ Please define MONGODB_URI in .env");
}

let cached = (global as any).mongoose;

if (!cached) {
  cached = (global as any).mongoose = { conn: null, promise: null };
}

export async function connectDB(): Promise<typeof mongoose> {
  try {
    if (cached.conn) {
      console.log("⚡ Using existing MongoDB connection");
      return cached.conn;
    }

    if (!cached.promise) {
      console.log("⏳ Connecting to MongoDB...");

      cached.promise = mongoose.connect(MONGODB_URI, {
        dbName: "DigitalTwinAI",
      });
    }

    cached.conn = await cached.promise;

    console.log("✅ MongoDB connected successfully");

    return cached.conn;
  } catch (error) {
    console.error("❌ MongoDB connection failed:");
    console.error(error);

    throw new Error("Database connection error");
  }
}