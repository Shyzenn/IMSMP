import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import bcrypt from "bcryptjs";
import { sendOTPEmail } from "@/lib/mailer";
import { auth } from "@/auth";

export async function POST(req: Request) {

  const session = await auth();

  if (!session || !session.user?.id) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    const { userId } = await req.json();

    // 1. Generate OTP (random 8-digit)
    const otp = Math.floor(10000000 + Math.random() * 90000000).toString();

    // 2. Hash OTP to store as password
    const hashedOTP = await bcrypt.hash(otp, 10);

    // 3. Update user in DB
    const user = await prisma.user.update({
      where: { id: userId },
      data: {
        password: hashedOTP,          // new password is OTP
        mustChangePassword: true,     // user must change at next login
        otp: null,                         
        otpExpiresAt: new Date(Date.now() + 1000 * 60 * 15), // 15m expiry
      },
    });

    // 4. Send email
    await sendOTPEmail(user.email, otp);

    return NextResponse.json({ success: true, message: "Password reset. OTP sent." });
  } catch (error) {
    console.error("Reset password error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to reset password." },
      { status: 500 }
    );
  }
}
