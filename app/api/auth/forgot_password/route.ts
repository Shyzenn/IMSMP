import { NextResponse } from "next/server";
import crypto from "crypto";
import { db } from "@/lib/db";
import { sendOTPEmail } from "@/lib/mailer";

export async function POST(req: Request) {
  try {
    const { email } = await req.json();

    const user = await db.user.findUnique({ where: { email } });
    if (!user) {
      return NextResponse.json({ message: "Email not found" }, { status: 404 });
    }

    // Generate 8-digit OTP
    const otp = crypto.randomInt(10000000, 99999999).toString();

    await db.user.update({
      where: { email },
      data: {
        otp,
        otpExpiresAt: new Date(Date.now() + 1000 * 60 * 15), // 15 minutes
      },
    });

    await sendOTPEmail(email, otp);

    return NextResponse.json({ message: "OTP sent to your email" });
  } catch (error) {
    console.error("Forgot password error:", error);
    return NextResponse.json({ message: "Something went wrong" }, { status: 500 });
  }
}
