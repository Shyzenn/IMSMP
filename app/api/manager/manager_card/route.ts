import { auth } from "@/auth";
import { db } from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const session = await auth();

    if (!session || !session.user?.id) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const [paidOrderRequest, paidWalkIn] = await Promise.all([
      db.orderRequest.findMany({
        where: { status: { in: ["paid", "refunded"] } },
        include: {
          items: {
            include: { product: true },
          },
          payments: {
            select: {
              discountAmount: true,
              discountType: true,
            },
          },
        },
      }),
      db.walkInTransaction.findMany({
        where: { status: { in: ["paid", "refunded"] } },
        include: {
          items: {
            include: { product: true },
          },
          payments: {
            select: {
              discountAmount: true,
              discountType: true,
            },
          },
        },
      }),
    ]);

    // Calculate total revenue for Order Requests with VAT exemption support
    const orderRequesttotalRevenue = paidOrderRequest.reduce((acc, order) => {
      const orderTotal = order.items.reduce((sum, item) => {
        const netQuantity =
          item.quantityOrdered.toNumber() -
          (item.refundedQuantity.toNumber() || 0);
        return sum + (Number(item.product.price) || 0) * netQuantity;
      }, 0);

      // Check if this order has VAT exemption (PWD/Senior discount)
      const payment = order.payments?.[0];
      const isVatExempt =
        payment &&
        (payment.discountType === "PWD" || payment.discountType === "SENIOR");

      // Calculate the base amount (VAT-exclusive if exempt)
      const baseAmount = isVatExempt ? orderTotal / 1.12 : orderTotal;

      // Subtract discount
      const paymentDiscount = order.payments?.reduce(
        (sum, p) => sum + Number(p.discountAmount || 0),
        0
      );

      return acc + (baseAmount - (paymentDiscount || 0));
    }, 0);

    // Calculate total revenue for Walk-In transactions with VAT exemption support
    const walkInttotalRevenue = paidWalkIn.reduce((acc, transaction) => {
      const transactionTotal = transaction.items.reduce((sum, item) => {
        const netQuantity = item.quantity - (item.refundedQuantity || 0);
        return sum + (Number(item.price) || 0) * netQuantity;
      }, 0);

      // Check if this transaction has VAT exemption
      const payment = transaction.payments?.[0];
      const isVatExempt =
        payment &&
        (payment.discountType === "PWD" || payment.discountType === "SENIOR");

      // Calculate the base amount (VAT-exclusive if exempt)
      const baseAmount = isVatExempt
        ? transactionTotal / 1.12
        : transactionTotal;

      const paymentDiscount = transaction.payments?.reduce(
        (sum, p) => sum + Number(p.discountAmount || 0),
        0
      );

      return acc + (baseAmount - (paymentDiscount || 0));
    }, 0);

    const totalRevenue = orderRequesttotalRevenue + walkInttotalRevenue;

    const productWithStock = await db.product.findMany({
      select: {
        id: true,
        batches: {
          select: { quantity: true },
        },
      },
    });

    let lowStock = 0;
    let highStock = 0;

    for (const product of productWithStock) {
      const totalQuantity =
        product.batches.reduce((acc, b) => acc + b.quantity, 0) ?? 0;

      if (totalQuantity <= 6) lowStock++;
      else highStock++;
    }

    const now = new Date();
    const in31Days = new Date();
    in31Days.setDate(now.getDate() + 31);

    const expiring = await db.productBatch.count({
      where: {
        type: { not: "ARCHIVED" },
        expiryDate: { gt: now, lte: in31Days },
        quantity: { gt: 0 },
      },
    });

    return NextResponse.json([totalRevenue, lowStock, highStock, expiring], {
      status: 200,
    });
  } catch (error) {
    console.error("Error fetching cards data", error);
    return NextResponse.json(
      {
        message: "Failed to fetch cards data",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
