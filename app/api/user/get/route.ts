import { db } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";
import { Prisma, Role } from "@prisma/client";
import { auth } from "@/auth";

export async function GET(request: NextRequest) {

  const session = await auth();

  if (!session || !session.user?.id) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    const searchParams = request.nextUrl.searchParams;
    const query = searchParams.get("query") || "";
    const safeQuery = query.toLowerCase().trim();

    let where: Prisma.UserWhereInput;
      
    if (session.user.role === "SuperAdmin") {
      where = {
        role: Role.Manager,
        ...(safeQuery && {
          AND: [
            {
              OR: [
                { firstName: { contains: safeQuery } },
                { lastName: { contains: safeQuery } },
                { middleName: { contains: safeQuery } },
                { username: { contains: safeQuery } },
                { email: { contains: safeQuery } },
              ],
            },
          ],
        }),
      };
    }

     else if (session.user.role === "Manager") {
      where = {
        role: { not: Role.SuperAdmin },
        ...(safeQuery && {
          AND: [
            {
              OR: [
                { firstName: { contains: safeQuery } },
                { lastName: { contains: safeQuery } },
                { middleName: { contains: safeQuery } },
                { username: { contains: safeQuery } },
                { email: { contains: safeQuery } },
              ],
            },
          ],
        }),
      };
    }

   else {
      return NextResponse.json(
        { message: "Forbidden: You don't have permission" },
        { status: 403 }
      );
    }

    const users = await db.user.findMany({
      where,
      orderBy: {
        createdAt: "desc",
      },
    });

    const formattedProducts = users.map((user) => ({
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      middleName: user.middleName || "",
      username: user.username,
      password: "*********",
      role: user.role ? user.role.replace("_", " ") : "N/A",
      action: "Edit",
      status: user.status,
      isOnline: user.isOnline,
      bannedReason: user.bannedReason,
      bannedAt: user.bannedAt
    }));

    return NextResponse.json(formattedProducts, { status: 200 });
  } catch (error) {
    console.error("Error fetching users:", error);
    return NextResponse.json(
      {
        message: "Failed to fetch users",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}