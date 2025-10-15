import { db } from "@/lib/db";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { email, otp } = await req.json();

    const user = await db.user.findUnique({ where: { email } });
    if (!user || user.otp !== otp) {
      return NextResponse.json({ message: "Invalid OTP" }, { status: 400 });
    }

    if (user.otpExpiresAt && user.otpExpiresAt < new Date()) {
      return NextResponse.json({ message: "OTP expired" }, { status: 400 });
    }

    return NextResponse.json({ message: "OTP verified" });
  } catch (error) {
    console.error("Verify OTP error:", error);
    return NextResponse.json({ message: "Something went wrong" }, { status: 500 });
  }
}
