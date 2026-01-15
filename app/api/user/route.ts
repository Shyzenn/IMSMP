import { db } from "@/lib/db";
import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { signUpSchema } from "@/lib/types";
import { Prisma, UserStatus } from "@prisma/client";
import { randomInt } from "crypto";
import { sendOTPEmail } from "@/lib/mailer";
import { toTitleCase } from "@/lib/utils";
import { auth } from "@/auth";

export async function POST(req: Request) {
  const session = await auth();

  if (!session || !session.user?.id) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const {
    username,
    firstName,
    middleName,
    lastName,
    email,
    role,
    password,
    status,
  } = body;
  const otp = String(randomInt(10000000, 99999999));
  const hashedOtp = await bcrypt.hash(otp, 10);

  // Validate input using Zod schema
  const result = signUpSchema.safeParse({
    username,
    firstName,
    middleName,
    lastName,
    email,
    role,
    password,
    status,
  });

  const zodErrors: Record<string, string> = {};
  if (!result.success) {
    result.error.issues.forEach((issue) => {
      zodErrors[issue.path[0]] = issue.message;
    });
  }

  // Check for existing username
  const allUsers = await db.user.findMany({
    select: { username: true },
  });

  const usernameExists = allUsers.some(
    (user) => user.username.toLowerCase() === username.toLowerCase()
  );

  if (usernameExists) {
    zodErrors.username = "Username is already taken";
  }

  // Check for existing email
  const existingEmail = await db.user.findUnique({
    where: { email },
  });

  if (existingEmail) {
    zodErrors.email = "Email is already registered";
  }

  if (Object.keys(zodErrors).length > 0) {
    return NextResponse.json({ errors: zodErrors }, { status: 400 });
  }

  const formattedUsername = toTitleCase(username);

  try {
    await db.user.create({
      data: {
        username: formattedUsername,
        firstName,
        middleName,
        lastName,
        email,
        role,
        password: hashedOtp,
        mustChangePassword: true,
        status: (status as UserStatus) ?? UserStatus.ACTIVE,
        otp: null,
        otpExpiresAt: new Date(Date.now() + 1000 * 60 * 15),
      },
    });

    await sendOTPEmail(email, otp);

    return NextResponse.json(
      {
        success: true,
        message:
          "User created successfully. An OTP has been sent to their email for verification.",
      },
      { status: 201 }
    );
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === "P2002") {
        const target = error.meta?.target as string[];

        if (target.includes("username")) {
          return NextResponse.json(
            { errors: { username: "Username is already taken" } },
            { status: 400 }
          );
        }

        if (target.includes("email")) {
          return NextResponse.json(
            { errors: { email: "Email is already registered" } },
            { status: 400 }
          );
        }
      }
    }

    console.error("POST /api/user error:", error);
    return NextResponse.json(
      { message: "Failed to create user" },
      { status: 500 }
    );
  }
}
