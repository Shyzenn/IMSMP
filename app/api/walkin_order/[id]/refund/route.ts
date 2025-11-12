import { auth } from "@/auth";
import { db } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";

type RefundItem = {
  productName: string;
  quantity: number;
  price?: number;
};

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

  const { status, reason, items } = await req.json();
  
  console.log("Received refund request with items:", items); // Debug
  
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

    // Filter items - only process items with quantity > 0
    const refundItems = (items || []).filter((item: RefundItem) => item.quantity > 0);
    
    if (refundItems.length === 0) {
      return NextResponse.json(
        { message: "No items to refund" },
        { status: 400 }
      );
    }

    console.log("Processing refund for items:", refundItems); // Debug

    let totalRefundAmount = 0;

    // Restore inventory based on refund items
    for (const refundItem of refundItems) {
      console.log(`Processing refund: ${refundItem.quantity} units of ${refundItem.productName}`);

      const matchingItem = walkInTransaction.items.find(
        (item) => item.product.product_name === refundItem.productName
      );

      if (!matchingItem) {
        console.warn(`Product ${refundItem.productName} not found in transaction`);
        continue;
      }

      // Validate refund quantity doesn't exceed original quantity
      if (refundItem.quantity > matchingItem.quantity) {
        console.warn(
          `Refund quantity (${refundItem.quantity}) exceeds original quantity (${matchingItem.quantity}) for ${refundItem.productName}`
        );
        continue;
      }

      // Calculate refund amount for this item
      const itemRefundAmount = refundItem.quantity * Number(matchingItem.price);
      totalRefundAmount += itemRefundAmount;
      
      console.log(`Item refund amount: ${itemRefundAmount}`);

      // Update the walk-in item with refunded quantity
      await db.walkInItem.update({
        where: { id: matchingItem.id },
        data: {
          refundedQuantity: { increment: refundItem.quantity },
        },
      });

      let remainingQty = refundItem.quantity;

      // Get active batches (prioritize recently updated batches)
      const batches = await db.productBatch.findMany({
        where: {
          productId: matchingItem.productId,
          type: "ACTIVE",
        },
        orderBy: { updatedAt: "desc" },
      });

      console.log(`Found ${batches.length} batches for product ${matchingItem.productId}`);

      // If batches exist, increment their quantity
      if (batches.length > 0) {
        const targetBatch = batches[0];
        
        await db.productBatch.update({
          where: { id: targetBatch.id },
          data: { quantity: { increment: remainingQty } },
        });

        console.log(`Added ${remainingQty} units to batch ${targetBatch.id}`);
        remainingQty = 0;
      }

      // If no existing batches, create a new batch
      if (remainingQty > 0) {
        const newBatch = await db.productBatch.create({
          data: {
            productId: matchingItem.productId,
            batchNumber: `REFUND-WALKIN-${walkInTransaction.id}-${matchingItem.id}`,
            quantity: remainingQty,
            releaseDate: new Date(),
            expiryDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
            type: "ACTIVE",
          },
        });

        console.log(`Created new batch ${newBatch.id} with ${remainingQty} units`);
      }
    }

    console.log(`Total refund amount: ${totalRefundAmount}`);

    // Check if all items are fully refunded
    const updatedTransaction = await db.walkInTransaction.findUnique({
      where: { id: numericId },
      include: { items: true },
    });

    const allItemsRefunded = updatedTransaction?.items.every(
      (item) => item.refundedQuantity >= item.quantity
    );

    // Update transaction - only mark as fully refunded if all items are refunded
    await db.walkInTransaction.update({
      where: { id: numericId },
      data: {
        status: allItemsRefunded ? "refunded" : "paid", // Keep as paid if partial refund
        refundedAt: new Date(),
        refundedById: userId,
        refundReason: reason || "No reason provided",
        totalAmount: { decrement: totalRefundAmount }, // ✅ Adjust total amount
      },
    });

    // Create audit log
    await db.auditLog.create({
      data: {
        userId,
        action: "Refund",
        entityType: "WalkInTransaction",
        entityId: walkInTransaction.id,
        description: `Walk-in transaction ${walkInTransaction.id} ${
          allItemsRefunded ? "fully" : "partially"
        } refunded (₱${totalRefundAmount.toFixed(2)}) by ${session.user.username}. Reason: ${reason || "No reason provided"}`,
      },
    });

    return NextResponse.json({ 
      success: true,
      message: allItemsRefunded 
        ? "Walk-in transaction fully refunded successfully"
        : `Partial refund successful (₱${totalRefundAmount.toFixed(2)})`
    });
  } catch (error) {
    console.error("Error refunding walk-in transaction:", error);
    return NextResponse.json(
      { message: error instanceof Error ? error.message : "Error refunding walk-in transaction" },
      { status: 500 }
    );
  }
}