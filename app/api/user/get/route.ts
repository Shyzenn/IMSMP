import { db } from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET() {
    try {

        const users = await db.user.findMany({
            orderBy:{
                createdAt: 'desc'
            },
        })

        const removeSuperAdmin = users.filter((user) => user.role !== "SuperAdmin")

        const formattedProducts = removeSuperAdmin.map((user) => ({
            id: user.id,
            email: user.email,
            firstName: user.firstName,
            lastName: user.lastName,
            middleName: user.middleName || "N/A",
            username:user.username,
            password: "*********",
            role: user.role ? user.role.replace("_", " ") : "N/A",
            action:"Edit",
            status: user.status,
            isOnline: user.isOnline
        }))

        return NextResponse.json(formattedProducts, {status:200})

    } catch (error) {
        console.error("Error fetching users:", error);
        return NextResponse.json(
            {
                message: "Failed to fetch users",
                error: error instanceof Error ? error.message : "Unknown error",
            },
            { status: 500 }
        )
    }
}