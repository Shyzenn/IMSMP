import { db } from "@/lib/db";
import { capitalLetter } from "@/lib/utils";
import { NextResponse } from "next/server";

export async function GET() {
    try {

        const now = new Date();
        const in30Days = new Date();
        in30Days.setDate(now.getDate() + 30)

       const expiryProducts = await db.product.findMany({
        include: { batches: true, category: true },
       });


        const formattedProducts = expiryProducts.flatMap((product) =>
        product.batches
            ?.filter(
            (batch) =>
                batch.expiryDate > now && batch.expiryDate <= in30Days
            )
            .map((batch) => ({
            id: product.id,
            name: capitalLetter(product.product_name),
            expiryDate: batch.expiryDate.toISOString(),
            quantity: batch.quantity,
            batch_number:batch.batchNumber,
            category: capitalLetter(product.category?.name || "")
            })) || []
        );

        return NextResponse.json(formattedProducts, {status:200})

    } catch (error) {
        console.error("Error fetching expiry products:", error);
        return NextResponse.json(
            {
                message: "Failed to fetch expiry products",
                error: error instanceof Error ? error.message : "Unknown error",
            },
            { status: 500 }
        )
    }
}