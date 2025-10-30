import { auth } from "@/auth";
import { db } from "@/lib/db";
import { NextResponse } from "next/server";

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

    const { username, email, profileImage, firstName, lastName, middleName } = await req.json();

    const updatedUser = await db.user.update({
      where: { email: session.user.email },
      data: { username, email, profileImage, firstName, lastName, middleName },
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
