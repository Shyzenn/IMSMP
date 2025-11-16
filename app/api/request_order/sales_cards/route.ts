import { db } from "@/lib/db";
import { NextResponse } from "next/server";
import { startOfDay, endOfDay } from "date-fns";
import { auth } from "@/auth";

export async function GET() {
  const session = await auth();

  if (!session || !session.user?.id) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    const today = new Date();

    // Fetch all paid orders
   const [paidOrderRequest, paidWalkIn] = await Promise.all([
      db.orderRequest.findMany({
        where: { status: { in: ["paid", "refunded"] } }, 
        include: {
          items: {
            include: { product: true },
          },
        },
      }),
      db.walkInTransaction.findMany({
        where: { status: { in: ["paid", "refunded"] } }, 
        include: {
          items: {
            include: { product: true },
          },
        },
      })
    ]);

    // Calculate total revenue
    const orderRequesttotalRevenue = paidOrderRequest.reduce((acc, order) => {
      const orderTotal = order.items.reduce((sum, item) => {
        const netQuantity = item.quantity - (item.refundedQuantity || 0);
        return sum + (Number(item.product.price) || 0) * netQuantity;
      }, 0);
      return acc + orderTotal;
    }, 0);

    const walkInttotalRevenue = paidWalkIn.reduce((acc, transaction) => {
      const transactionTotal = transaction.items.reduce((sum, item) => {
        const netQuantity = item.quantity - (item.refundedQuantity || 0);
        return sum + (Number(item.price) || 0) * netQuantity; 
      }, 0);
      return acc + transactionTotal;
    }, 0);

    const totalRevenue = orderRequesttotalRevenue + walkInttotalRevenue;

    // Fetch all orders made today
    const [orderRequestordersToday, walkInordersToday] = await Promise.all([
      db.orderRequest.findMany({
        where: {
          createdAt: {
            gte: startOfDay(today),
            lte: endOfDay(today),
          },
          status: "paid",
        },
        include: {
          items: {
            include: { product: true },
          },
        },
      }),

      db.walkInTransaction.findMany({
        where: {
          createdAt: {
            gte: startOfDay(today),
            lte: endOfDay(today),
          },
          status: "paid",
        },
        include: {
          items: {
            include: { product: true },
          },
        },
      })
    ])

    const OrderRequesttotalSalesToday = orderRequestordersToday.reduce((acc, order) => {
      const orderTotal = order.items.reduce((sum, item) => {
        return sum + (Number(item.product.price) || 0) * item.quantity;
      }, 0);
      return acc + orderTotal;
    }, 0);

    const walkIntotalSalesToday = walkInordersToday.reduce((acc, order) => {
      const orderTotal = order.items.reduce((sum, item) => {
        return sum + (Number(item.product.price) || 0) * item.quantity;
      }, 0);
      return acc + orderTotal;
    }, 0);

    const totalSalesToday = OrderRequesttotalSalesToday + walkIntotalSalesToday

    // Count all orders
    const [orderRequesttotalOrders, walkIntotalOrders] = await Promise.all([
        db.orderRequest.count(), db.walkInTransaction.count()
    ])

    const totalOrders = orderRequesttotalOrders + walkIntotalOrders

    // Count all pending payment
    const forPayment = await db.orderRequest.count({
      where: { status: "for_payment" },
    });

    return NextResponse.json({
      totalRevenue,
      totalSalesToday,
      totalOrders,
      forPayment,
    }, { status: 200 });

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
