import { db } from "@/lib/db";
import { NextResponse } from "next/server";
import { startOfMonth, startOfYear, subDays } from "date-fns";
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
    // Fetch top-selling medicines from OrderItem & WalkInItem where status = 'paid'
    const [orderItems, walkInItems] = await Promise.all([
      db.orderItem.findMany({
        where: {
          order: {
            status: "paid",
            createdAt: {
              gte: fromDate,
            },
          },
        },
        include: {
          product: true,
        },
      }),
      db.walkInItem.findMany({
        where: {
          transaction: {
            createdAt: {
              gte: fromDate,
            },
          },
        },
        include: {
          product: true,
        },
      }),
    ]);

    const productMap: Record<string, { quantity: number; name: string }> = {};

    for (const item of orderItems) {
      const name = item.product.product_name;
      productMap[name] = productMap[name] || { quantity: 0, name };
      productMap[name].quantity += item.quantity;
    }

    for (const item of walkInItems) {
      const name = item.product.product_name;
      productMap[name] = productMap[name] || { quantity: 0, name };
      productMap[name].quantity += item.quantity;
    }

    const sortedProducts = Object.values(productMap)
      .sort((a, b) => b.quantity - a.quantity)
      .slice(0, 5);

    return NextResponse.json(sortedProducts);
  } catch (error) {
    console.error("Error fetching top-selling medicines:", error);
    return NextResponse.json(
      { message: "Failed to fetch top-selling medicines." },
      { status: 500 }
    );
  }
}
