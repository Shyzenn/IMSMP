import { db } from "@/lib/db";
import { NextResponse } from "next/server";
import { startOfMonth, startOfYear, subDays } from "date-fns";
import { auth } from "@/auth";

export async function GET(req: Request) {
  const session = await auth();

  if (!session || !session.user?.id) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }
  
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
    // Fetch items from both paid and refunded orders
    const orderItems = await db.orderItem.findMany({
      where: {
        order: {
          status: { in: ["paid", "refunded"] },
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
          status: { in: ["paid", "refunded"] },
          createdAt: { gte: fromDate } 
        },
      },
      include: {
        product: true,
      },
    });

    // Calculate Order Request revenue with refunded quantities
    const orderRequestRevenue = orderItems.reduce((sum, item) => {
      const netQuantity = item.quantity - (item.refundedQuantity || 0);
      return sum + netQuantity * Number(item.product.price);
    }, 0);

    // Calculate Walk-In revenue with refunded quantities
    const walkInRevenue = walkInItems.reduce((sum, item) => {
      const netQuantity = item.quantity - (item.refundedQuantity || 0);
      return sum + netQuantity * Number(item.price);
    }, 0);

    const salesByOrderType = [
      {
        name: "Order Request",
        revenue: Math.max(0, orderRequestRevenue), // Ensure no negative values
      },
      {
        name: "Walk-in",
        revenue: Math.max(0, walkInRevenue), // Ensure no negative values
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