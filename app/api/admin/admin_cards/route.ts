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
            where: { role: {not : Role.SuperAdmin} }
         })

         const totalOnlineUser = await db.user.count({
            where: { isOnline : true, role: {not: Role.SuperAdmin}}
         })

         const totalOfflineUser = await db.user.count({
            where: { isOnline: false, role: {not: Role.SuperAdmin}}
         })

         const totalBanUser = await db.user.count({
            where : { status: "DISABLE" }
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