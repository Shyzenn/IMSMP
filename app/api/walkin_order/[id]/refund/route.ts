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
  const numericId = parseInt(id);
  
  if (!numericId) {
    return NextResponse.json({ message: "Invalid ID" }, { status: 400 });
  }

  const { status, reason } = await req.json();
  if (status !== "refunded") {
    return NextResponse.json(
      { message: "Invalid status for walk-in transaction" },
      { status: 400 }
    );
  }

  try {
    // Get the walk-in transaction with items
    const walkInTransaction = await db.walkInTransaction.findUnique({
      where: { id: numericId },
      include: {
        items: { include: { product: true } },
        user: true,
      },
    });

    if (!walkInTransaction) {
      return NextResponse.json(
        { message: "Walk-in transaction not found" },
        { status: 404 }
      );
    }

    if (walkInTransaction.status !== "paid") {
      return NextResponse.json(
        { message: "Only paid transactions can be refunded" },
        { status: 400 }
      );
    }

    // Update transaction status to refunded
    const updatedTransaction = await db.walkInTransaction.update({
      where: { id: numericId },
      data: {
        status: "refunded",
        refundedAt: new Date(),
        refundedById: userId,
        refundReason: reason
      },
      include: {
        items: { include: { product: true } },
        user: true,
      },
    });

    // Restore inventory for each item
    for (const item of updatedTransaction.items) {
      let remainingQty = item.quantity;

      // Get batches that were deducted (prioritize recently updated batches)
      const batches = await db.productBatch.findMany({
        where: {
          productId: item.productId,
          type: "ACTIVE",
        },
        orderBy: { updatedAt: "desc" },
      });

      for (const batch of batches) {
        if (remainingQty <= 0) break;

        const incrementQty = remainingQty;

        await db.productBatch.update({
          where: { id: batch.id },
          data: { quantity: { increment: incrementQty } },
        });

        remainingQty -= incrementQty;
      }

      if (remainingQty > 0) {
        // If no existing batches, create a new batch for returned items
        await db.productBatch.create({
          data: {
            productId: item.productId,
            batchNumber: `REFUND-WALKIN-${updatedTransaction.id}-${item.id}`,
            quantity: remainingQty,
            releaseDate: new Date(),
            expiryDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year
            type: "ACTIVE",
          },
        });
      }
    }

    // Create audit log
    await db.auditLog.create({
      data: {
        userId,
        action: "Refund",
        entityType: "WalkInTransaction",
        entityId: updatedTransaction.id,
        description: `Walk-in transaction ${updatedTransaction.id} refunded by ${session.user.username}.`,
      },
    });

    return NextResponse.json({ 
      success: true,
      message: "Walk-in transaction refunded successfully"
    });
  } catch (error) {
    console.error("Error refunding walk-in transaction:", error);
    return NextResponse.json(
      { message: "Error refunding walk-in transaction" },
      { status: 500 }
    );
  }
}