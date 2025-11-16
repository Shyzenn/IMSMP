import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { auth } from "@/auth";

export async function GET() {

  const session = await auth();

  if (!session || !session.user?.id) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    const [requestOrders, walkinOrders] = await Promise.all([
      db.orderRequest.findMany({
        include: { items: { include: { product: true } } },
      }),
      db.walkInTransaction.findMany({
        include: { items: { include: { product: true } } },
      }),
    ]);

    const formatted = [
      ...walkinOrders.map((tx) => ({
        id: `WALK-${tx.id}`,
        customer: tx.customer_name ?? "Unknown",
        createdAt: tx.createdAt,
        source: "Walk In",
        quantity: tx.items.reduce((sum, item) => sum + item.quantity, 0),
        total: tx.totalAmount?.toNumber?.() ?? 0,
        status: tx.status,
      })),
      ...requestOrders.map((tx) => ({
        id: `REQ-${tx.id}`,
        customer: tx.patient_name ?? "Unknown",
        createdAt: tx.createdAt,
        source: "Request Order",
        quantity: tx.items.reduce((sum, item) => sum + item.quantity, 0),
        total: tx.items.reduce(
          (sum, item) => sum + item.quantity * (item.product?.price?.toNumber?.() ?? 0),
          0
        ),
        status: tx.status,
      })),
    ];

    return NextResponse.json(formatted);
  } catch (error) {
    console.error("Transaction Export API error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
