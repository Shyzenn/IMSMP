import { db } from "@/lib/db";
import { NextResponse } from "next/server";
import { startOfMonth, startOfYear, subDays } from "date-fns";
import { auth } from "@/auth";

export async function GET(req: Request) {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const filter = searchParams.get("filter") || "This Month";

  let fromDate = new Date();

  if (filter === "Last 7 Days") fromDate = subDays(new Date(), 6);
  else if (filter === "This Month") fromDate = startOfMonth(new Date());
  else if (filter === "This Year") fromDate = startOfYear(new Date());

  try {
    const [orderItems, walkInItems] = await Promise.all([
      db.orderItem.findMany({
        where: {
          order: {
            status: { in: ["paid", "refunded"] },
            createdAt: { gte: fromDate },
          },
        },
        include: {
          product: true,
        },
      }),
      db.walkInItem.findMany({
        where: {
          transaction: {
            status: { in: ["paid", "refunded"] },
            createdAt: { gte: fromDate },
          },
        },
        include: {
          product: true,
        },
      }),
    ]);

    const productMap: Record<string, { name: string; quantity: number }> = {};

    // -------- ORDER REQUEST ITEMS --------
    for (const item of orderItems) {
      const name = item.product.product_name;

      const ordered = item.quantityOrdered.toNumber();
      const refunded = item.refundedQuantity?.toNumber() || 0;
      const netQuantity = Math.max(0, ordered - refunded);

      if (!productMap[name]) {
        productMap[name] = { name, quantity: 0 };
      }

      productMap[name].quantity += netQuantity;
    }

    // -------- WALK-IN ITEMS --------
    for (const item of walkInItems) {
      const name = item.product.product_name;

      const ordered = item.quantity;
      const refunded = item.refundedQuantity || 0;
      const netQuantity = Math.max(0, ordered - refunded);

      if (!productMap[name]) {
        productMap[name] = { name, quantity: 0 };
      }

      productMap[name].quantity += netQuantity;
    }

    const topSelling = Object.values(productMap)
      .filter((p) => p.quantity > 0)
      .sort((a, b) => b.quantity - a.quantity)
      .slice(0, 5);

    return NextResponse.json(topSelling);
  } catch (error) {
    console.error("Error fetching top-selling medicines:", error);
    return NextResponse.json(
      { message: "Failed to fetch top-selling medicines." },
      { status: 500 }
    );
  }
}
