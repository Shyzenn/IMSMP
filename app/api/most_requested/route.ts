import { db } from "@/lib/db";
import { NextResponse } from "next/server";
import { subDays, startOfMonth, startOfYear } from "date-fns";

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const filter = url.searchParams.get("filter");

    let dateFilter: Date | undefined;

    if (filter === "Last 7 Days") {
      dateFilter = subDays(new Date(), 7);
    } else if (filter === "This Month") {
      dateFilter = startOfMonth(new Date());
    } else if (filter === "This Year") {
      dateFilter = startOfYear(new Date());
    }

    const topProducts = await db.orderItem.groupBy({
      by: ["productId"],
      _sum: { quantity: true },
      where: dateFilter
        ? {
            order: {
              createdAt: {
                gte: dateFilter,
              },
            },
          }
        : undefined,
      orderBy: {
        _sum: {
          quantity: "desc",
        },
      },
      take: 5,
    });

    const detailedTopProducts = await Promise.all(
      topProducts.map(async (item) => {
        const product = await db.product.findUnique({
          where: { id: item.productId },
        });

        return {
          id: product?.id,
          name: product?.product_name,
          totalRequested: item._sum?.quantity ?? 0,
        };
      })
    );

    return NextResponse.json(detailedTopProducts, { status: 200 });
  } catch (error) {
    console.error("Error fetching top requested products:", error);
    return NextResponse.json(
      {
        message: "Failed to fetch top requested products",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
