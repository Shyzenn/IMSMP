import { db } from "@/lib/db";
import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { signUpSchema } from "@/lib/types";
import { Prisma, UserStatus } from "@prisma/client";
import { randomInt } from "crypto";
import { sendOTPEmail } from "@/lib/mailer";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { username, email, role, password, status } = body;
    const otp = String(randomInt(10000000, 99999999)); // 8-digit
    const hashedOtp = await bcrypt.hash(otp, 10);

    // Validate input using Zod schema
    const result = signUpSchema.safeParse({
      username,
      email,
      role,
      password,
      status
    });

    // Create an object to store validation errors
    const zodErrors: Record<string, string> = {};
    if (!result.success) {
      result.error.issues.forEach((issue) => {
        zodErrors[issue.path[0]] = issue.message;
      });
    }
    
    const normalizedUsername = username.toLowerCase();

    const existingUser = await db.user.findFirst({
      where: { username: normalizedUsername },
    });

    if (existingUser) {
      if (existingUser.username === username) {
        zodErrors.username = "Username is already taken";
      }
    }

    if (Object.keys(zodErrors).length > 0) {
      return NextResponse.json({ errors: zodErrors }, { status: 400 });
    }

    // Hash the password using bcrypt
    // const hashedPassword = await bcrypt.hash(password, 10);

    try {
      await db.user.create({
        data: {
          username: normalizedUsername,
          email,
          role,
          password: hashedOtp, 
          mustChangePassword: true,
          status: (status as UserStatus) ?? UserStatus.ACTIVE,
          otp: null,
          otpExpiresAt: new Date(Date.now() + 1000 * 60 * 15), //15m expiration
        },
      });

    await sendOTPEmail(email, otp);

    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === "P2002") {
          return NextResponse.json(
            { errors: { username: "Username is already taken" } },
            { status: 400 }
          );
        }
      }
      throw error;
    }

    return NextResponse.json({
      success: true,
      message: "User created successfully. An OTP has been sent to their email for verification.",
    });

  } catch (error) {
    if (error instanceof Error) {
      console.error("Error in POST /api/user:", error.message);
      return NextResponse.json(
        { message: "Failed to create user", error: error.message },
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