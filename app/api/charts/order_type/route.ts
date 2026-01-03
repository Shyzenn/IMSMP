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
    const [orders, walkIns] = await Promise.all([
      db.orderRequest.findMany({
        where: {
          status: { in: ["paid", "refunded"] },
          createdAt: { gte: fromDate },
        },
        include: {
          items: { include: { product: true } },
          payments: true,
        },
      }),
      db.walkInTransaction.findMany({
        where: {
          status: { in: ["paid", "refunded"] },
          createdAt: { gte: fromDate },
        },
        include: {
          items: true,
          payments: true,
        },
      }),
    ]);

    let orderRequestRevenue = 0;
    let walkInRevenue = 0;

    // ---------- ORDER REQUESTS ----------
    for (const order of orders) {
      const itemsTotal = order.items.reduce((sum, item) => {
        const ordered = item.quantityOrdered.toNumber();
        const refunded = item.refundedQuantity?.toNumber() || 0;
        return (
          sum + Number(item.product.price) * Math.max(0, ordered - refunded)
        );
      }, 0);

      const payment = order.payments?.[0];
      const isVatExempt =
        payment?.discountType === "PWD" || payment?.discountType === "SENIOR";

      const baseAmount = isVatExempt ? itemsTotal / 1.12 : itemsTotal;

      const discount = order.payments?.reduce(
        (s, p) => s + Number(p.discountAmount || 0),
        0
      );

      orderRequestRevenue += Math.max(0, baseAmount - discount);
    }

    // ---------- WALK-IN ----------
    for (const txn of walkIns) {
      const itemsTotal = txn.items.reduce((sum, item) => {
        return (
          sum +
          Number(item.price) *
            Math.max(0, item.quantity - (item.refundedQuantity || 0))
        );
      }, 0);

      const payment = txn.payments?.[0];
      const isVatExempt =
        payment?.discountType === "PWD" || payment?.discountType === "SENIOR";

      const baseAmount = isVatExempt ? itemsTotal / 1.12 : itemsTotal;

      const discount = txn.payments?.reduce(
        (s, p) => s + Number(p.discountAmount || 0),
        0
      );

      walkInRevenue += Math.max(0, baseAmount - discount);
    }

    return NextResponse.json([
      { name: "Order Request", revenue: orderRequestRevenue },
      { name: "Walk-in", revenue: walkInRevenue },
    ]);
  } catch (error) {
    console.error("Error fetching sales by order type:", error);
    return NextResponse.json(
      { message: "Failed to fetch sales by order type." },
      { status: 500 }
    );
  }
}
