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
    const categories = await db.productCategory.findMany({
      include: {
        products: {
          include: {
            batches: {
              where: {
                type: { not: "ARCHIVED" },
                quantity: { gt: 0 },
                createdAt: { gte: fromDate },
              },
            },
          },
        },
      },
    });

    const responseData = categories
      .map((cat) => {
        const totalStock = cat.products.reduce((sum, product) => {
          const productStock = product.batches.reduce(
            (batchSum, b) => batchSum + b.quantity,
            0
          );
          return sum + productStock;
        }, 0);

        return {
          category: cat.name,
          stock: totalStock,
        };
      })
      .filter((cat) => cat.stock > 0)
      .sort((a, b) => b.stock - a.stock);

    const topCategories = responseData.slice(0, 10);
    return NextResponse.json(topCategories);
  } catch (error) {
    console.error("Error fetching inventory stats:", error);
    return NextResponse.json(
      { error: "Failed to fetch inventory stats" },
      { status: 500 }
    );
  }
}
