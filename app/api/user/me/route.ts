import { auth } from "@/auth";
import { db } from "@/lib/db";
import { NextResponse } from "next/server";
import { editUserProfileSchema } from "@/lib/types";

export async function GET() {
  const session = await auth(); 

  if (!session || !session.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const user = await db.user.findUnique({
    where: { email: session.user.email },
    select: {
      id: true,
      username: true,
      email: true,
      role: true,
      firstName: true,
      middleName: true,
      lastName: true,
      profileImage: true,
    },
  });

  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  return NextResponse.json(user);
}

export async function PUT(req: Request) {
  try {
    const session = await auth(); 

    if (!session || !session.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { username, email, profileImage, firstName, lastName, middleName } = body;

    // Validate input using Zod schema
    const result = editUserProfileSchema.safeParse(body);

    const zodErrors: Record<string, string> = {};
    if (!result.success) {
      result.error.issues.forEach((issue) => {
        zodErrors[issue.path[0]] = issue.message;
      });
    }

    // Get current user
    const currentUser = await db.user.findUnique({
      where: { email: session.user.email },
      select: { id: true, username: true, email: true },
    });

    if (!currentUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Check for existing username (case-insensitive, excluding current user)
    if (username && username.toLowerCase() !== currentUser.username.toLowerCase()) {
      const allUsers = await db.user.findMany({
        where: {
          id: { not: currentUser.id }, // Exclude current user
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
          id: { not: currentUser.id }, // Exclude current user
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

    // Update user
    const updatedUser = await db.user.update({
      where: { email: session.user.email },
      data: { 
        username, 
        email, 
        profileImage, 
        firstName, 
        lastName, 
        middleName 
      },
      select: {
        id: true,
        username: true,
        email: true,
        firstName: true,
        middleName: true,
        lastName: true,
        role: true,
        profileImage: true,
      },
    });

    await db.auditLog.create({
      data: {
        userId: session.user.id,
        action: "Updated",
        entityType: "Session",
        description: `User ${session.user.username} (${session.user.role}) updated their profile information.`,
      },
    });

    return NextResponse.json(updatedUser);
  } catch (error) {
    console.error("Error updating user:", error);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}