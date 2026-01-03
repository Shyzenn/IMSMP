import { db } from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const products = await db.product.findMany({
      take: 15,
      include: { batches: true },
    });

    products.sort((a, b) => {
      const aMax = Math.max(
        ...a.batches.map((batch) => batch.manufactureDate.getTime())
      );
      const bMax = Math.max(
        ...b.batches.map((batch) => batch.manufactureDate.getTime())
      );
      return bMax - aMax;
    });

    return NextResponse.json(products, { status: 200 });
  } catch (error) {
    console.error("Error fetching products:", error);
    return NextResponse.json(
      {
        message: "Failed to fetch products",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
