import { db } from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET() {
  try {

    const totalOrders = await db.orderRequest.count();

    const pending = await db.orderRequest.count({
      where: { status: "pending" },
    });

    const forPayment = await db.orderRequest.count({
      where: { status: "for_payment" },
    });

    const paid = await db.orderRequest.count({
      where: { status: "paid"},
    });

    const data = await Promise.all([
            totalOrders,
            pending,
            forPayment,
            paid,
        ])

    return NextResponse.json(
      data, {status: 200}
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
