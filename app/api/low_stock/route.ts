import { db } from "@/lib/db";
import { capitalLetter } from "@/lib/utils";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    // Fetch products with their batches
    const products = await db.product.findMany({
      take: 20,
      include: {
        batches: true, 
      },
    });

    // Filter low stock (total quantity <= 6)
    const lowStock = products
      .map((product) => {
        const totalQuantity = product.batches?.reduce(
          (acc, batch) => acc + batch.quantity,
          0
        ) ?? 0;

        return {
          id: product.id,
          productName: capitalLetter(product.product_name),
          quantity: totalQuantity,
        };
      })
      .filter((p) => p.quantity <= 6)
      .sort((a, b) => a.quantity - b.quantity); // sort ascending

    return NextResponse.json(lowStock, { status: 200 });
  } catch (error) {
    console.error("Error fetching low stock products:", error);
    return NextResponse.json(
      {
        message: "Failed to fetch low stock products",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
