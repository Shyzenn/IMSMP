// /api/product/top_sales/route.ts
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
        include: { product: true },
      }),
      db.walkInItem.findMany({
       where: {
        transaction: { status: "paid", createdAt: { gte: fromDate } },
      },
        include: { product: true },
      }),
    ]);

    // Group by product quantity instead of revenue
    const productMap: Record<string, { quantity: number; name: string }> = {};

    for (const item of orderItems) {
      const name = item.product.product_name || "Unnamed Product";
      productMap[name] = productMap[name] || { quantity: 0, name };
      productMap[name].quantity += item.quantity;
    }

    for (const item of walkInItems) {
      const name = item.product.product_name || "Unnamed Product";
      productMap[name] = productMap[name] || { quantity: 0, name };
      productMap[name].quantity += item.quantity;
    }

    const sortedProducts = Object.values(productMap).sort(
      (a, b) => b.quantity - a.quantity
    );

    return NextResponse.json(sortedProducts);
  } catch (error) {
    console.error("Error fetching top-selling products:", error);
    return NextResponse.json(
      { message: "Failed to fetch top-selling products." },
      { status: 500 }
    );
  }
}
