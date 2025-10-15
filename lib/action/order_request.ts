'use server'

import { auth } from "@/auth";
import { db } from "@/lib/db";
import { createAuditLog } from "@/lib/action/product";
import { revalidatePath } from "next/cache";

export async function restoreOrderRequest(orderId: number) {
  try {
    const session = await auth();
    if (!session?.user?.id) throw new Error("Unauthorized");

    const order = await db.orderRequest.findUnique({ where: { id: orderId } });
    if (!order) throw new Error("Order request not found");

    await db.orderRequest.update({
      where: { id: orderId },
      data: { isArchived: false },
    });

    await createAuditLog(
      session.user.id,
      "RESTORE_ORDER_REQUEST",
      "OrderRequest",
      orderId,
      `Order Request ORD-${orderId.toString().padStart(4, "0")} restored by ${session.user.username}`
    );

    revalidatePath("/archive");

    return { success: true, message: "Order request restored successfully" };
  } catch (error) {
    console.error("Error restoring order request:", error);
    return {
      success: false,
      message:
        error instanceof Error ? error.message : "Failed to restore order request",
    };
  }
}
