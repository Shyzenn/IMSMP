import { db } from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET() {
    try {
        const topProducts = await db.orderItem.groupBy({
            by:['productId'],
            _sum:{
                quantity:true
            },
            orderBy:{
                _sum:{
                    quantity: 'desc'
                }
            },
            take:5
        })

    // Fetch product details for each top product
    const detailedTopProducts = await Promise.all(
      topProducts.map(async (item) => {
        const product = await db.product.findUnique({
          where: { id: item.productId },
        });

        return {
          id: product?.id,
          name: product?.product_name,
          totalRequested: item._sum.quantity ?? 0,
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