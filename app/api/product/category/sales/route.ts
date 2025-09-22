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
    // Fetch paid order & walk-in items
    const [orderItems, walkInItems] = await Promise.all([
      db.orderItem.findMany({
        where: {
          order: {
            status: "paid",
            createdAt: { gte: fromDate },
          },
        },
        include: {
          product: { include: { category: true } },
        },
      }),
      db.walkInItem.findMany({
        where: {
          transaction: { createdAt: { gte: fromDate } },
        },
        include: {
          product: { include: { category: true } },
        },
      }),
    ]);

    // Group by category revenue
    const categoryMap: Record<string, { revenue: number; name: string }> = {};

    for (const item of orderItems) {
      const name = item.product.category?.name || "Uncategorized";
      const revenue = item.quantity * Number(item.product.price);
      categoryMap[name] = categoryMap[name] || { revenue: 0, name };
      categoryMap[name].revenue += revenue;
    }

    for (const item of walkInItems) {
      const name = item.product.category?.name || "Uncategorized";
      const revenue = item.quantity * Number(item.price);
      categoryMap[name] = categoryMap[name] || { revenue: 0, name };
      categoryMap[name].revenue += revenue;
    }

    const sortedCategories = Object.values(categoryMap).sort(
      (a, b) => b.revenue - a.revenue
    );

    return NextResponse.json(sortedCategories);
  } catch (error) {
    console.error("Error fetching sales by category:", error);
    return NextResponse.json(
      { message: "Failed to fetch sales by category." },
      { status: 500 }
    );
  }
}
