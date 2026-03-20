import { NextResponse } from "next/server";
import { TOP_COLLEGES } from "@/lib/colleges";

export async function GET() {
  return NextResponse.json({ success: true, colleges: TOP_COLLEGES }, { status: 200 });
}
