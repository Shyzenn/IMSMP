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
    // Fetch paid order items with refundedQuantity
    const [orderItems, walkInItems] = await Promise.all([
      db.orderItem.findMany({
        where: {
          order: { status: "paid", createdAt: { gte: fromDate } },
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

    const productMap: Record<string, { quantity: number; name: string }> = {};

    // Process Order Items
    for (const item of orderItems) {
      const name = item.product?.product_name || "Unnamed Product";

      const netQty =
        Number(item.quantityOrdered) - Number(item.refundedQuantity || 0);
      if (netQty <= 0) continue; // skip fully refunded

      if (!productMap[name]) productMap[name] = { quantity: 0, name };
      productMap[name].quantity += netQty;
    }

    // Process Walk-In Items
    for (const item of walkInItems) {
      const name = item.product?.product_name || "Unnamed Product";

      const netQty = Number(item.quantity) - Number(item.refundedQuantity || 0);
      if (netQty <= 0) continue; // skip fully refunded

      if (!productMap[name]) productMap[name] = { quantity: 0, name };
      productMap[name].quantity += netQty;
    }

    // Sort by quantity descending
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
