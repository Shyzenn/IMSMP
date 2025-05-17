import { db } from "@/lib/db";
import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { signUpSchema } from "@/lib/types";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { username, role, password, confirmPassword } = body;

    // Validate input using Zod schema
    const result = signUpSchema.safeParse({
      username,
      role,
      password,
      confirmPassword,
    });

    // Create an object to store validation errors
    const zodErrors: Record<string, string> = {};
    if (!result.success) {
      result.error.issues.forEach((issue) => {
        zodErrors[issue.path[0]] = issue.message;
      });
    }

    const existingUser = await db.user.findFirst({
      where: {username},
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
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create a new user in the database
    await db.user.create({
      data: {
        username,
        role,
        password: hashedPassword,
      },
    });

    return NextResponse.json({ success: true });
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