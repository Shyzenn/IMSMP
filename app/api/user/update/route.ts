import { db } from "@/lib/db";
import {editUserSchema } from "@/lib/types";
import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { Prisma } from "@prisma/client";

// update user
export async function PATCH(req: Request) {
  try {
     const body = await req.json();
    const { id, username, password, role, isResetPassword} = body;

    // Validate input with conditional schema
    const result = editUserSchema(isResetPassword).safeParse(body);

    // Create an object to store validation errors
    const zodErrors: Record<string, string> = {};
    if (!result.success) {
      result.error.issues.forEach((issue) => {
        zodErrors[issue.path[0]] = issue.message;
      });
      return NextResponse.json({ errors: zodErrors }, { status: 400 });
    }

    const existingUser = await db.user.findFirst({
        where: {
            username,
            NOT: { id },
        },
    });

    if (existingUser) {
        return NextResponse.json({  
            errors: {
            User_name: "Username is already taken",
            },
        }, { status: 400 });
    }
    
    const updateData: Prisma.UserUpdateInput = { username, role };

    if (isResetPassword) {
      const hashedPassword = await bcrypt.hash(password, 10);
      updateData.password = hashedPassword;
    }

    await db.user.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    if (error instanceof Error) {
      console.error("Error in POST /api/user/update", error.message);
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