import { db } from "@/lib/db";
import {editUserSchema } from "@/lib/types";
import { NextResponse } from "next/server";
import { Prisma } from "@prisma/client";

// update user
export async function PATCH(req: Request) {
  try {
    const body = await req.json();
    const { id, role, username, email, firstName, lastName, middleName} = body;

    // Validate input with conditional schema
    const result = editUserSchema().safeParse(body);

    // Create an object to store validation errors
    const zodErrors: Record<string, string> = {};
    if (!result.success) {
      result.error.issues.forEach((issue) => {
        zodErrors[issue.path[0]] = issue.message;
      });
      return NextResponse.json({ errors: zodErrors }, { status: 400 });
    }
    
        const roleMap: Record<string, string> = {
          "Pharmacist Staff": "Pharmacist_Staff",
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
          lastName
        };

    await db.user.update({
      where: { id },
      data: updateData
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