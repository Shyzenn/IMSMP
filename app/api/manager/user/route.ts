import { db } from "@/lib/db";
import { capitalLetter } from "@/lib/utils";
import { NextResponse } from "next/server";

export async function GET() {
    try {

        const users = await db.user.findMany({
            orderBy:{
                createdAt: 'desc'
            },
            take:20
        })

        const formattedProducts = users.map((user) => ({
            id: user.id,
            username:capitalLetter(user.username),
            password: "*********",
            role: user.role ? user.role.replace("_", " ") : "N/A",
            action:"Edit"
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