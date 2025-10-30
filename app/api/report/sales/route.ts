import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { startOfMonth, startOfYear, subDays } from "date-fns";

type SalesRow = {
  product_name: string;
  category: string;
  price: string;
  date: string;
  revenue: string;
};

export async function GET(req: Request) {
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
          createdAt: { gte: fromDate },
        },
        include: {
          items: {
            include: {
              product: { include: { category: true } },
            },
          },
        },
      }),
      db.walkInTransaction.findMany({
        where: {
          status: "paid",
          createdAt: { gte: fromDate },
        },
        include: {
          items: {
            include: {
              product: { include: { category: true } },
            },
          },
        },
      }),
    ]);

    // Flatten all sales
    const allSales = [...paidOrders, ...paidWalkIns].flatMap((order) =>
      order.items.map((item) => {
        const price = Number(item.product?.price) || 0;
        const quantity = Number(item.quantity) || 0;
        const createdAt = order.createdAt;

        let date = "";
        if (createdAt && !isNaN(new Date(createdAt).getTime())) {
          date = new Date(createdAt).toISOString().split("T")[0];
        }

        return {
          product_name: item.product?.product_name || "Unknown",
          category: item.product?.category?.name || "Uncategorized",
          price,
          date,
          revenue: price * quantity,
        };
      })
    );

    // Group sales by date
    const groupedByDate: Record<string, typeof allSales> = {};
    for (const sale of allSales) {
      if (!sale.date) continue;
      if (!groupedByDate[sale.date]) groupedByDate[sale.date] = [];
      groupedByDate[sale.date].push(sale);
    }

    // Format data: show all products per date + subtotal row
    const finalData: SalesRow[] = [];

    for (const [date, sales] of Object.entries(groupedByDate)) {
      const totalRevenue = sales.reduce((sum, s) => sum + s.revenue, 0);

      sales.forEach((s) => {
        finalData.push({
          product_name: s.product_name,
          category: s.category,
          price: s.price.toFixed(2),
          date,
          revenue: s.revenue.toFixed(2),
        });
      });

      // Add subtotal row per day
      finalData.push({
        product_name: "",
        category: "",
        price: "",
        date: "Subtotal",
        revenue: totalRevenue.toFixed(2),
      });
    }

    // Sort by date
    finalData.sort((a, b) => (a.date > b.date ? 1 : -1));

    return NextResponse.json(finalData);
  } catch (error) {
    console.error("Sales report error:", error);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}
