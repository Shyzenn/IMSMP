import { db } from "@/lib/db";
import { NextResponse } from "next/server";
import { startOfDay, endOfDay } from "date-fns";

export async function GET() {
  try {
    const today = new Date();

    // Fetch all paid orders
    const paidOrders = await db.orderRequest.findMany({
      where: { status: "paid" },
      include: {
        items: {
          include: { product: true },
        },
      },
    });

    // Calculate total revenue
    const totalRevenue = paidOrders.reduce((acc, order) => {
      const orderTotal = order.items.reduce((sum, item) => {
        return sum + Number(item.product.price) * item.quantity;
      }, 0);
      return acc + orderTotal;
    }, 0);

    // Fetch all orders made today
    const ordersToday = await db.orderRequest.findMany({
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
    });

    const totalSalesToday = ordersToday.reduce((acc, order) => {
      const orderTotal = order.items.reduce((sum, item) => {
        return sum + Number(item.product.price) * item.quantity;
      }, 0);
      return acc + orderTotal;
    }, 0);

    // Count all orders
    const totalOrders = await db.orderRequest.count();

    // Count all pending payment
    const forPayment = await db.orderRequest.count({
      where: { status: "for_payment" },
    });

    const data = await Promise.all([
            totalRevenue,
            totalSalesToday,
            totalOrders,
            forPayment
        ])

    return NextResponse.json(
      data, {status: 200}
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
