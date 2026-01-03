import { db } from "@/lib/db";
import { NextResponse } from "next/server";
import { subDays, startOfMonth, startOfYear } from "date-fns";
import { auth } from "@/auth";

export async function GET(req: Request) {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(req.url);
    const filter = searchParams.get("filter");

    let fromDate: Date | undefined;

    if (filter === "Last 7 Days") fromDate = subDays(new Date(), 6);
    else if (filter === "This Month") fromDate = startOfMonth(new Date());
    else if (filter === "This Year") fromDate = startOfYear(new Date());

    const orderItems = await db.orderItem.findMany({
      where: {
        order: {
          status: { in: ["paid", "refunded"] },
          ...(fromDate && { createdAt: { gte: fromDate } }),
        },
      },
      include: {
        product: true,
      },
    });

    const productMap: Record<
      string,
      { id: number; name: string; quantity: number }
    > = {};

    for (const item of orderItems) {
      const ordered = item.quantityOrdered.toNumber();
      const refunded = item.refundedQuantity?.toNumber() || 0;
      const netQuantity = ordered - refunded;

      if (netQuantity <= 0) continue;

      const productId = item.product.id;

      if (!productMap[productId]) {
        productMap[productId] = {
          id: productId,
          name: item.product.product_name,
          quantity: 0,
        };
      }

      productMap[productId].quantity += netQuantity;
    }

    const topRequested = Object.values(productMap)
      .sort((a, b) => b.quantity - a.quantity)
      .slice(0, 5);

    return NextResponse.json(topRequested, { status: 200 });
  } catch (error) {
    console.error("Error fetching top requested products:", error);
    return NextResponse.json(
      { message: "Failed to fetch top requested products" },
      { status: 500 }
    );
  }
}
