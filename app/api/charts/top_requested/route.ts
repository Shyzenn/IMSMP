import { db } from "@/lib/db";
import { startOfMonth, startOfYear, subDays } from "date-fns";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  try {
    
    const { searchParams } = new URL(req.url);
    const filter = searchParams.get("filter") || "This Month";

    const now = new Date();
    let fromDate: Date;

    switch (filter) {
      case "Last 7 Days":
        fromDate = subDays(now, 6);
        break;
      case "This Month":
        fromDate = startOfMonth(now);
        break;
      case "This Year":
        fromDate = startOfYear(now);
        break;
      default:
        fromDate = startOfMonth(now);
    }

    // Group order items by productId
    const orderItems = await db.orderItem.groupBy({
      by: ["productId"],
      _sum: { quantity: true },
      where: {
        order: {
          createdAt: {
            gte: fromDate,
            lte: now,
          },
        },
      },
    });

    if (orderItems.length === 0) {
      return NextResponse.json([]);
    }

    const productIds = orderItems.map((o) => o.productId);

    const products = await db.product.findMany({
      where: { id: { in: productIds } },
      select: { id: true, product_name: true },
    });

    const productMap = products.reduce(
      (acc, p) => ({ ...acc, [p.id]: p.product_name }),
      {} as Record<number, string>
    );

    const result = orderItems
      .map((o) => ({
        product: productMap[o.productId] ?? "Unknown",
        quantity: o._sum.quantity ?? 0,
      }))
      .sort((a, b) => b.quantity - a.quantity)
      .slice(0, 7);

    return NextResponse.json(result);
  } catch (error) {
    console.error("Error fetching top requested products:", error);
    return NextResponse.json(
      { error: "Failed to fetch top requested products" },
      { status: 500 }
    );
  }
}
