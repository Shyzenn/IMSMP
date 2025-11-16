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
    const requests = await db.medTechRequest.findMany({
      where: {
        remarks: "released",
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
    });

    // Create map to track released requests by date
    const dailyRequestsMap = new Map<string, number>();

    // Process each request - only count released ones
    for (const request of requests) {
      const dateStr = request.createdAt.toLocaleDateString("en-PH");

      // Increment count for this date
      dailyRequestsMap.set(dateStr, (dailyRequestsMap.get(dateStr) || 0) + 1);
    }

    // Format the data for the chart
    const formatted = [...dailyRequestsMap.entries()]
      .sort(([a], [b]) => (a > b ? 1 : -1))
      .map(([date, total]) => ({
        date,
        total,
      }));

    return NextResponse.json(formatted);
  } catch (error) {
    console.error("Request trends fetch error:", error);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}