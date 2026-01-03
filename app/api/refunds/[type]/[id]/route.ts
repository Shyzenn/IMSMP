import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { db } from "@/lib/db";
import { Prisma } from "@prisma/client";

type RefundItem = {
  productName: string;
  quantity: number;
};

type TransactionItem = {
  id: number;
  productId: number;
  product: { product_name: string };
  quantityOrdered?: Prisma.Decimal; // For OrderItem
  quantity?: number; // For WalkInItem
  refundedQuantity: Prisma.Decimal | number;
  price: Prisma.Decimal;
};

export async function PUT(
  req: NextRequest,
  context: { params: Promise<{ type: "order" | "walkin"; id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = session.user.id;
  const { type, id } = await context.params;
  const numericId = Number(id);
  if (isNaN(numericId)) {
    return NextResponse.json({ error: "Invalid ID" }, { status: 400 });
  }

  const body = await req.json();
  const { items: refundItems, reason } = body as {
    items: RefundItem[];
    reason?: string;
  };

  if (!Array.isArray(refundItems) || refundItems.length === 0) {
    return NextResponse.json(
      { error: "Refund items are required" },
      { status: 400 }
    );
  }

  // -----------------------------
  // Fetch transaction with product included
  // -----------------------------
  const transaction =
    type === "order"
      ? await db.orderRequest.findUnique({
          where: { id: numericId },
          include: { items: { include: { product: true } } },
        })
      : await db.walkInTransaction.findUnique({
          where: { id: numericId },
          include: { items: { include: { product: true } } },
        });

  if (!transaction) {
    return NextResponse.json(
      { error: "Transaction not found" },
      { status: 404 }
    );
  }

  const transactionItems: TransactionItem[] =
    transaction.items as TransactionItem[];

  let totalRefundAmount = new Prisma.Decimal(0);

  // -----------------------------
  // Process each refund item
  // -----------------------------
  for (const refundItem of refundItems) {
    const matchItem = transactionItems.find(
      (i) => i.product.product_name === refundItem.productName
    );
    if (!matchItem) continue;

    const maxQty =
      type === "order"
        ? (matchItem.quantityOrdered as Prisma.Decimal).toNumber() -
          (matchItem.refundedQuantity as Prisma.Decimal).toNumber()
        : (matchItem.quantity as number) -
          (matchItem.refundedQuantity as number);

    const qtyToRefund = Math.min(refundItem.quantity, maxQty);
    if (qtyToRefund <= 0) continue;

    const price = matchItem.price ?? new Prisma.Decimal(0);
    const lineRefund = new Prisma.Decimal(qtyToRefund).mul(price);
    totalRefundAmount = totalRefundAmount.add(lineRefund);

    // Increment refunded quantity
    if (type === "order") {
      await db.orderItem.update({
        where: { id: matchItem.id },
        data: { refundedQuantity: { increment: qtyToRefund } },
      });
    } else {
      await db.walkInItem.update({
        where: { id: matchItem.id },
        data: { refundedQuantity: { increment: qtyToRefund } },
      });
    }

    // -----------------------------
    // Update inventory
    // -----------------------------
    let remainingQty = qtyToRefund;
    const batches = await db.productBatch.findMany({
      where: { productId: matchItem.productId, type: "ACTIVE" },
      orderBy: { updatedAt: "desc" },
    });

    if (batches.length > 0) {
      await db.productBatch.update({
        where: { id: batches[0].id },
        data: { quantity: { increment: remainingQty } },
      });
      remainingQty = 0;
    }

    if (remainingQty > 0) {
      await db.productBatch.create({
        data: {
          productId: matchItem.productId,
          batchNumber: `REFUND-${type.toUpperCase()}-${numericId}-${
            matchItem.id
          }`,
          quantity: remainingQty,
          manufactureDate: new Date(),
          expiryDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
          type: "ACTIVE",
        },
      });
    }
  }

  // -----------------------------
  // Determine final status
  // -----------------------------
  let finalStatus: "paid" | "refunded";

  if (type === "order") {
    const updatedOrder = await db.orderRequest.findUnique({
      where: { id: numericId },
      include: { items: true },
    });

    const allItemsRefunded = updatedOrder!.items.every(
      (i) => i.refundedQuantity.toNumber() >= i.quantityOrdered.toNumber()
    );

    finalStatus = allItemsRefunded ? "refunded" : "paid";

    // Persist the final status
    await db.orderRequest.update({
      where: { id: numericId },
      data: {
        status: finalStatus,
      },
    });
  } else {
    const updatedTransaction = await db.walkInTransaction.findUnique({
      where: { id: numericId },
      include: { items: true },
    });

    const allItemsRefunded = updatedTransaction!.items.every(
      (i) => i.refundedQuantity >= i.quantity
    );

    finalStatus = allItemsRefunded ? "refunded" : "paid";

    // Persist the final status
    await db.walkInTransaction.update({
      where: { id: numericId },
      data: {
        status: finalStatus,
      },
    });
  }

  // -----------------------------
  // Create refund record
  // -----------------------------
  await db.refund.create({
    data: {
      orderRequestId: type === "order" ? numericId : undefined,
      walkInOrderId: type === "walkin" ? numericId : undefined,
      refundAmount: totalRefundAmount,
      refundReason: reason || "No reason provided",
      refundedById: userId,
    },
  });

  await db.auditLog.create({
    data: {
      userId,
      action: "Refund",
      entityType: "OrderRequest",
      entityId: transaction.id,
      description:
        type === "order"
          ? finalStatus === "refunded"
            ? `ORD-${numericId} fully refunded`
            : `ORD-${numericId} partially refunded`
          : `WALKIN-${numericId} refunded`,
    },
  });

  return NextResponse.json({
    success: true,
    totalRefundAmount,
    refundType:
      type === "order"
        ? finalStatus === "refunded"
          ? "FULL"
          : "PARTIAL"
        : "FULL",
    finalStatus,
  });
}
