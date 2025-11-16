import { db } from "@/lib/db";
import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { auth } from "@/auth";

export async function POST(req: Request) {

  const session = await auth();

  if (!session || !session.user?.id) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { email, otp, password } = body;

    if (!email || !otp || !password) {
      return NextResponse.json(
        { message: "Email, OTP, and password are required" },
        { status: 400 }
      );
    }

    // Find the user by email
    const user = await db.user.findUnique({
      where: { email },
    });

    if (!user) {
      return NextResponse.json(
        { message: "User not found" },
        { status: 404 }
      );
    }

    // Check OTP expiration
    if (!user.otp || !user.otpExpiresAt || user.otpExpiresAt < new Date()) {
      return NextResponse.json(
        { message: "OTP has expired. Please request a new one." },
        { status: 400 }
      );
    }

    // Validate OTP
    const isValidOtp = await bcrypt.compare(otp, user.otp);
    if (!isValidOtp) {
      return NextResponse.json(
        { message: "Invalid OTP" },
        { status: 400 }
      );
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Update user with password, clear OTP
    await db.user.update({
      where: { email },
      data: {
        password: hashedPassword,
        otp: null,
        otpExpiresAt: null,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Password set successfully. You can now log in.",
    });
  } catch (error) {
    if (error instanceof Error) {
      console.error("Error in POST /api/verify-otp:", error.message);
      return NextResponse.json(
        { message: "Failed to verify OTP", error: error.message },
        { status: 500 }
      );
    } else {
      console.error("Unknown error:", error);
      return NextResponse.json(
        { message: "An unknown error occurred" },
        { status: 500 }
      );
    }
  }
}