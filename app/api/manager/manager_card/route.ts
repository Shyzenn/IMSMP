import { db } from "@/lib/db";
import { addDays } from "date-fns";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    // Fetch all paid orders
    const [paidOrderRequest, paidWalkIn] = await Promise.all([
      db.orderRequest.findMany({
        where: { status: "paid" },
        include: {
          items: {
            include: { product: true },
          },
        },
      }),
      db.walkInTransaction.findMany({
        where: { status: "paid" },
        include: {
          items: {
            include: { product: true },
          },
        },
      })
    ])

    // Calculate total revenue
    const orderRequesttotalRevenue = paidOrderRequest.reduce((acc, order) => {
      const orderTotal = order.items.reduce((sum, item) => {
        return sum + (Number(item.product.price) || 0) * item.quantity;
      }, 0);
      return acc + orderTotal;
    }, 0);

    const walkInttotalRevenue = paidWalkIn.reduce((acc, order) => {
      const orderTotal = order.items.reduce((sum, item) => {
        return sum + (Number(item.product.price) || 0) * item.quantity;
      }, 0);
      return acc + orderTotal;
    }, 0);

    const totalRevenue = orderRequesttotalRevenue + walkInttotalRevenue

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
    const in7Days = addDays(now, 7);

    const expiring = await db.productBatch.count({
      where: {
        expiryDate: {
          gte: now,
          lte: in7Days,
        },
      },
    });

    return NextResponse.json(
      [totalRevenue, lowStock, highStock, expiring],
      { status: 200 }
    );

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
