import { db } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";
import { Prisma, Role } from "@prisma/client";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const query = searchParams.get("query") || "";
    const safeQuery = query.toLowerCase().trim();

    let where: Prisma.UserWhereInput;

    if (safeQuery) {
      where = {
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
          {
            role: { not: Role.SuperAdmin },
          },
        ],
      };
    } else {
      where = {
        role: { not: Role.SuperAdmin },
      };
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