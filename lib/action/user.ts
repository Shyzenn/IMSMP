"use server"

import { revalidatePath } from "next/cache"
import { db } from "../db"

export async function updateUserStatus({userId, status}: {userId: string ,status: "ACTIVE" | "DISABLE"}){
    try {
         await db.user.update({
            where: { id: userId }, 
            data: { status }
        })
        
        revalidatePath("/user_management")
        return { 
      success: true, 
      message: `has been ${status === "ACTIVE" ? "activated" : "disabled"} successfully` 
    };
    } catch(error) {
         return { 
            success: false, 
            message: error instanceof Error ? error.message : "Failed to update user status" 
        };
    }
}