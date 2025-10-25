import { db } from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET(
  _request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const categoryId = Number(id);

    const products = await db.product.findMany({
      where: { categoryId },
      select: { id: true, product_name: true },
    });

    if (products.length > 0) {
      return NextResponse.json({
        hasProducts: true,
        products,
      });
    }

    return NextResponse.json({ products });
  } catch (error) {
    console.error("Error checking category products:", error);
    return NextResponse.json(
      { error: "Failed to fetch category dependencies" },
      { status: 500 }
    );
  }
}






