import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { startOfMonth, startOfYear, subDays } from "date-fns";
import { auth } from "@/auth";

export async function GET(req: Request) {
  try {
  const session = await auth();

  if (!session || !session.user?.id) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

    const { searchParams } = new URL(req.url);
    const filter = searchParams.get("filter") || "This Month";

    const now = new Date();
    let fromDate = new Date();

    if (filter === "Last 7 Days") fromDate = subDays(now, 6);
    else if (filter === "This Month") fromDate = startOfMonth(now);
    else if (filter === "This Year") fromDate = startOfYear(now);

    const orders = await db.orderRequest.groupBy({
      by: ["type"], 
      _count: { type: true },
      where: { createdAt: { gte: fromDate, lte: now } },
    });

    const result = orders.map((o) => ({
      type: o.type,
      count: o._count.type,
    }));

    return NextResponse.json(result);
  } catch (error) {
    console.error("Error fetching order types:", error);
    return NextResponse.json(
      { error: "Failed to fetch order types" },
      { status: 500 }
    );
  }
}
