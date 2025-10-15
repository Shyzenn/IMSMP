import { db } from "@/lib/db";
import { addDays } from "date-fns";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const walkInSales = await db.walkInTransaction.aggregate({
      _sum: { totalAmount: true },
    });
    const totalWalkInSales = Number(walkInSales._sum.totalAmount ?? 0);

    const orderItems = await db.orderItem.findMany({
      include: {
        product: {
          select: { price: true },
        },
      },
    });

    const totalRequestSales = orderItems.reduce(
      (sum, item) => sum + Number(item.quantity) * Number(item.product.price),
      0
    );

    const totalSales = totalWalkInSales + totalRequestSales;

    const productWithStock = await db.product.findMany({
      select: {
        id: true,
        batches: {
          select: { quantity: true },
        },
      },
    });

    let lowStock = 0;
    let highStock = 0;

    for (const product of productWithStock) {
      const totalQuantity =
        product.batches.reduce((acc, b) => acc + b.quantity, 0) ?? 0;

      if (totalQuantity <= 6) lowStock++;
      else highStock++;
    }

    const now = new Date();
    const in7Days = addDays(now, 7);

    const expiring = await db.productBatch.count({
      where: {
        expiryDate: {
          gte: now,
          lte: in7Days,
        },
      },
    });

    return NextResponse.json(
      [totalSales, lowStock, highStock, expiring],
      { status: 200 }
    );

  } catch (error) {
    console.error("Error fetching cards data", error);
    return NextResponse.json(
      {
        message: "Failed to fetch cards data",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
