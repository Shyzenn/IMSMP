"use server"

import { revalidatePath } from "next/cache"
import { db } from "../db"

export async function updateUserStatus({userId, status, bannedReason}: {userId: string ,status: "ACTIVE" | "DISABLE", bannedReason?: string | null}){
    try {
         await db.user.update({
            where: { id: userId }, 
            data: { 
                status, 
                bannedReason: status === "DISABLE" ? bannedReason ?? "No reason provided" : null,
                bannedAt: status === "DISABLE" ? new Date() : null,
            }
        })
        
        revalidatePath("/user_management")
        return { 
      success: true, 
      message: `has been ${status === "ACTIVE" ? "activated" : "banned"} successfully` 
    };
    } catch(error) {
         return { 
            success: false, 
            message: error instanceof Error ? error.message : "Failed to update user status" 
        };
    }
}