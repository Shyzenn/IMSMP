import { auth } from "@/auth";
import { db } from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET(){
    try {
        const session = await auth()

        if (!session || !session.user?.id){
            return NextResponse.json({ message: "Unauthorized"}, { status: 401 })
        }

        const totalRequest = await db.medTechRequest.count()

        const approvedRequest = await db.medTechRequest.count({
            where: { status: "approved" }
        })

        const declinedRequest = await db.medTechRequest.count({
            where: { status: "declined" }
        })

        const releasedRequest = await db.medTechRequest.count({
            where: { remarks: "released" }
        })

        return NextResponse.json({
            totalRequest,
            approvedRequest,
            declinedRequest,
            releasedRequest
        });

    } catch (error) {
        console.error("Error fetching cards data", error)
        return NextResponse.json(
            {
                message: "Failed to fetch cards data",
                error: error instanceof Error ? error.message : "Unknown error"
            },
            {
                status: 500
            }
        )
    }
}