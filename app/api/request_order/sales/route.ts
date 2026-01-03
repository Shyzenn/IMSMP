import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { subDays, startOfMonth, startOfYear } from "date-fns";
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
    const [orderRequests, walkIns] = await Promise.all([
      db.orderRequest.findMany({
        where: {
          status: { in: ["paid", "refunded"] },
          createdAt: { gte: fromDate },
        },
        include: {
          items: { include: { product: true } },
          payments: {
            select: { discountAmount: true, discountType: true },
          },
        },
      }),
      db.walkInTransaction.findMany({
        where: {
          status: { in: ["paid", "refunded"] },
          createdAt: { gte: fromDate },
        },
        include: {
          items: { include: { product: true } },
          payments: {
            select: { discountAmount: true, discountType: true },
          },
        },
      }),
    ]);

    const dailySalesMap = new Map<string, number>();

    // -------- ORDER REQUESTS --------
    for (const order of orderRequests) {
      const date = order.createdAt.toISOString().split("T")[0];

      const itemsTotal = order.items.reduce((sum, item) => {
        const price = Number(item.product.price) || 0;
        const ordered = item.quantityOrdered.toNumber();
        const refunded = item.refundedQuantity?.toNumber() || 0;
        return sum + price * Math.max(0, ordered - refunded);
      }, 0);

      const payment = order.payments?.[0];
      const isVatExempt =
        payment &&
        (payment.discountType === "PWD" || payment.discountType === "SENIOR");

      const baseAmount = isVatExempt ? itemsTotal / 1.12 : itemsTotal;

      const discount = order.payments?.reduce(
        (sum, p) => sum + Number(p.discountAmount || 0),
        0
      );

      const total = Math.max(0, baseAmount - (discount || 0));

      dailySalesMap.set(date, (dailySalesMap.get(date) || 0) + total);
    }

    // -------- WALK-IN TRANSACTIONS --------
    for (const txn of walkIns) {
      const date = txn.createdAt.toISOString().split("T")[0];

      const itemsTotal = txn.items.reduce((sum, item) => {
        const price = Number(item.price) || 0;
        const qty = item.quantity;
        const refunded = item.refundedQuantity || 0;
        return sum + price * Math.max(0, qty - refunded);
      }, 0);

      const payment = txn.payments?.[0];
      const isVatExempt =
        payment &&
        (payment.discountType === "PWD" || payment.discountType === "SENIOR");

      const baseAmount = isVatExempt ? itemsTotal / 1.12 : itemsTotal;

      const discount = txn.payments?.reduce(
        (sum, p) => sum + Number(p.discountAmount || 0),
        0
      );

      const total = Math.max(0, baseAmount - (discount || 0));

      dailySalesMap.set(date, (dailySalesMap.get(date) || 0) + total);
    }

    const formatted = [...dailySalesMap.entries()]
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([date, totalSales]) => ({
        date,
        totalSales,
      }));

    return NextResponse.json(formatted);
  } catch (error) {
    console.error("Sales fetch error:", error);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}
