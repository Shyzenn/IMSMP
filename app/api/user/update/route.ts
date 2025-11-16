import { db } from "@/lib/db";
import { editUserSchema } from "@/lib/types";
import { NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { auth } from "@/auth";

export async function PATCH(req: Request) {

  const session = await auth();

  if (!session || !session.user?.id) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { id, role, username, email, firstName, lastName, middleName } = body;

    // Validate input with conditional schema
    const result = editUserSchema().safeParse(body);

    // Create an object to store validation errors
    const zodErrors: Record<string, string> = {};
    if (!result.success) {
      result.error.issues.forEach((issue) => {
        zodErrors[issue.path[0]] = issue.message;
      });
    }

    // Get current user to exclude from duplicate checks
    const currentUser = await db.user.findUnique({
      where: { id },
      select: { id: true, username: true, email: true },
    });

    if (!currentUser) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    // Check for existing username (case-insensitive, excluding current user)
    if (username && username.toLowerCase() !== currentUser.username.toLowerCase()) {
      const allUsers = await db.user.findMany({
        where: {
          id: { not: id }, // Exclude current user
        },
        select: { username: true },
      });

      const usernameExists = allUsers.some(
        (user) => user.username.toLowerCase() === username.toLowerCase()
      );

      if (usernameExists) {
        zodErrors.username = "Username is already taken";
      }
    }

    // Check for existing email (excluding current user)
    if (email && email !== currentUser.email) {
      const existingEmail = await db.user.findFirst({
        where: {
          email,
          id: { not: id }, // Exclude current user
        },
      });

      if (existingEmail) {
        zodErrors.email = "Email is already registered";
      }
    }

    // Return validation errors if any
    if (Object.keys(zodErrors).length > 0) {
      return NextResponse.json({ errors: zodErrors }, { status: 400 });
    }

    const roleMap: Record<string, string> = {
      "Pharmacist Staff": "Pharmacist_Staff",
      "Med Tech": "MedTech",
      Nurse: "Nurse",
      Manager: "Manager",
      Cashier: "Cashier",
    };

    const updateData: Prisma.UserUpdateInput = {
      role: roleMap[role] || role,
      username,
      email,
      firstName,
      middleName,
      lastName,
    };

    await db.user.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === "P2002") {
        const target = (error.meta?.target as string[]) || [];

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

    if (error instanceof Error) {
      console.error("Error in PATCH /api/user/update", error.message);
      return NextResponse.json(
        { message: "Failed to update user", error: error.message },
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