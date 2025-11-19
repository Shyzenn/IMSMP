import { auth } from "@/auth";
import { db } from "@/lib/db";
import { Role } from "@prisma/client";
import { NextResponse } from "next/server";

export async function GET(){
    try {
         const session = await auth()

         if(!session || !session.user.id){
            return NextResponse.json({ message: "Unauthorize"}, { status: 401 })
         }

         const totalUser = await db.user.count({
            where: { role: Role.Manager }
         })

         const totalOnlineUser = await db.user.count({
            where: { isOnline : true, role: Role.Manager}
         })

         const totalOfflineUser = await db.user.count({
            where: { isOnline: false, role: Role.Manager}
         })

         const totalBanUser = await db.user.count({
            where : { status: "DISABLE",role: Role.Manager }
         })

         return NextResponse.json({ totalUser, totalOnlineUser, totalOfflineUser, totalBanUser }, { status: 200 })
    }
    catch(error) {
        console.error("Failed to fetch admin cards", error)
        return NextResponse.json({
                message: "Error fetching admin cards",
                error: error instanceof Error ? error.message : "Unknown error"
            },
            {
                status: 500
            }
        )
    }
}