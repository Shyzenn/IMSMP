import { auth } from "@/auth";
import { db } from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const session = await auth();

    if (!session || !session.user?.id) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const now = new Date();
    const in31Days = new Date();
    in31Days.setDate(now.getDate() + 31);

    const expiryProducts = await db.product.findMany({
      where: {
        status: { not: "ARCHIVED" },
      },
      select: {
        batches: {
          where: {
            type: { not: "ARCHIVED" },
            expiryDate: { gt: now, lte: in31Days },
            quantity: { gt: 0 },
          },
        },
        id: true,
        product_name: true,
        strength: true,
        dosageForm: true,
        category: true,
      },
    });

    const formattedProducts = expiryProducts.flatMap((product) =>
      product.batches.map((batch) => ({
        id: product.id,
        productName: product.product_name,
        expiryDate: batch.expiryDate.toISOString(),
        batch_number: batch.batchNumber,
      }))
    );

    return NextResponse.json(formattedProducts, { status: 200 });
  } catch (error) {
    console.error("Error fetching expiry products:", error);
    return NextResponse.json(
      {
        message: "Failed to fetch expiry products",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
