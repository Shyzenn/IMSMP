import { db } from "@/lib/db";
import { NextResponse } from "next/server";
import { startOfMonth, startOfYear, subDays } from "date-fns";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const filter = searchParams.get("filter") || "This Month";

  let fromDate = new Date();

  if (filter === "Last 7 Days") {
    fromDate = subDays(new Date(), 6);
  } else if (filter === "This Month") {
    fromDate = startOfMonth(new Date());
  } else if (filter === "This Year") {
    fromDate = startOfYear(new Date());
  }

  try {
    const orderItems = await db.orderItem.findMany({
      where: {
        order: {
          status: "paid",
          createdAt: { gte: fromDate },
        },
      },
      include: {
        product: true,
      },
    });

    const walkInItems = await db.walkInItem.findMany({
      where: {
        transaction: { 
          status: "paid",
          createdAt: { gte: fromDate } 
        },
      },
      include: {
        product: true,
      },
    });

    const orderRequestRevenue = orderItems.reduce((sum, item) => {
      return sum + item.quantity * Number(item.product.price);
    }, 0);

    const walkInRevenue = walkInItems.reduce((sum, item) => {
      return sum + item.quantity * Number(item.price);
    }, 0);

    const salesByOrderType = [
      {
        name: "Order Request",
        revenue: orderRequestRevenue,
      },
      {
        name: "Walk-in",
        revenue: walkInRevenue,
      },
    ].filter((item) => item.revenue > 0); 

    return NextResponse.json(salesByOrderType);
  } catch (error) {
    console.error("Error fetching sales by order type:", error);
    return NextResponse.json(
      { message: "Failed to fetch sales by order type." },
      { status: 500 }
    );
  }
}