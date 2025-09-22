import { auth } from "@/auth";
import { db } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";

export async function PUT(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session || !session.user?.id) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const userId = session.user.id;
  const { id } = await context.params;
  const numericId = parseInt(id.replace("ORD-", ""));
  if (!numericId) {
    return NextResponse.json({ message: "Invalid ID" }, { status: 400 });
  }

  const { status } = await req.json();
  if (!status || !["for_payment", "paid"].includes(status)) {
    return NextResponse.json(
      { message: "Invalid or missing status" },
      { status: 400 }
    );
  }

  try {
    // Update order status
    const updatedOrder = await db.orderRequest.update({
      where: { id: numericId },
      data: { status },
      include: {
        items: {
          include: {
            product: true,
          },
        },
      },
    });

    // Decrease batch quantities if changing to "for_payment"
    if (status === "for_payment") {
      for (const item of updatedOrder.items) {
        let remainingQty = item.quantity;
        const today = new Date()

        // Get batches ordered by earliest expiry first 
        const batches = await db.productBatch.findMany({
          where: { productId: item.productId, quantity: { gt: 0 }, expiryDate:{ gte:  today} },
          orderBy: { expiryDate: "asc" },
        });

        for (const batch of batches) {
          if (remainingQty <= 0) break;

          if(batch.expiryDate < today) continue;
 
          const decrementQty = Math.min(batch.quantity, remainingQty);

          await db.productBatch.update({
            where: { id: batch.id },
            data: { quantity: { decrement: decrementQty } },
          });

          remainingQty -= decrementQty;
        }

        if (remainingQty > 0) {
          console.warn(
            `Not enough stock to fully fulfill order item ${item.id}`
          );
        }
      }
    }

    // Audit log
    await db.auditLog.create({
      data: {
        userId,
        action: "Status Update",
        entityType: "OrderRequest",
        entityId: updatedOrder.id,
        description: `Order ${updatedOrder.id} marked as ${status.toUpperCase()} by User ${session.user.username}`,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error updating status:", error);
    return NextResponse.json(
      { message: "Error updating status" },
      { status: 500 }
    );
  }
}
