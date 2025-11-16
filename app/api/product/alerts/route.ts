import { auth } from "@/auth";
import { db } from "@/lib/db";
import { capitalLetter } from "@/lib/utils";
import { NextResponse } from "next/server";

export async function GET() {

    const session = await auth();
  
    if (!session || !session.user?.id) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }
  

  try {
    const today = new Date();
    const threshold = new Date();
    threshold.setDate(threshold.getDate() + 31); // expiring within 31 days

    // Fetch products with their batches
    const products = await db.product.findMany({
      include: {
        batches: true,
      },
    });

    // Low stock products (total stock ≤ 6)
    const lowStock = products
      .map((product) => {
        const totalQuantity =
          product.batches?.reduce((acc, batch) => acc + batch.quantity, 0) ?? 0;

        return {
          id: product.id,
          productName: capitalLetter(product.product_name),
          quantity: totalQuantity,
        };
      })
      .filter((p) => p.quantity <= 6)
      .sort((a, b) => a.quantity - b.quantity);

    const expiringBatches = products.flatMap((product) =>
      product.batches
        .filter(
          (batch) =>
            batch.expiryDate <= threshold &&
            batch.expiryDate >= today &&
            batch.type === "ACTIVE" && 
            batch.quantity > 0
        )
        .map((batch) => ({
          batchId: batch.id,
          productId: product.id,
          productName: capitalLetter(product.product_name),
          batchNumber: batch.batchNumber,
          quantity: batch.quantity,
          expiryDate: batch.expiryDate,
        }))
    );

    return NextResponse.json(
      {
        lowStock,
        expiringBatches,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error fetching alerts:", error);
    return NextResponse.json(
      {
        message: "Failed to fetch alerts",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
