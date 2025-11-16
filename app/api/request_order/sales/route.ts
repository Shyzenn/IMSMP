import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { subDays, startOfMonth, startOfYear } from "date-fns";
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

    const [paidOrders, paidWalkIns] = await Promise.all([
      db.orderRequest.findMany({
        where: {
          status: "paid",
          createdAt: {
            gte: fromDate,
          },
        },
        include: {
          items: {
            include: {
              product: true,
            },
          },
        },
      }),
      db.walkInTransaction.findMany({
        where: {
          status: "paid",
          createdAt: {
            gte: fromDate,
          },
        },
        include: {
          items: {
            include: {
              product: true,
            },
          },
        },
      }),
    ])

    const dailySalesMap = new Map<string, number>();

    for (const order of paidOrders) {
      const dateStr = order.createdAt.toISOString().split("T")[0];

      const total = order.items.reduce((sum, item) => {
        const price =
          typeof item.product.price === "number"
            ? item.product.price
            : Number(item.product.price);

        return sum + price * item.quantity;
      }, 0);

      dailySalesMap.set(dateStr, (dailySalesMap.get(dateStr) || 0) + total);
    }


    for (const order of paidWalkIns) {
      const dateStr = order.createdAt.toISOString().split("T")[0];

      const total = order.items.reduce((sum, item) => {
        const price =
          typeof item.price === "number" ? item.price : Number(item.price);

        return sum + price * item.quantity;
      }, 0);

      dailySalesMap.set(dateStr, (dailySalesMap.get(dateStr) || 0) + total);
    }

    const formatted = [...dailySalesMap.entries()]
      .sort(([a], [b]) => (a > b ? 1 : -1))
      .map(([date, totalSales]) => ({ date, totalSales }));

    return NextResponse.json(formatted);
  } catch (error) {
    console.error("Sales fetch error:", error);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}
