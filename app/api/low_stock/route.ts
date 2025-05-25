import { db } from "@/lib/db";
import { capitalLetter } from "@/lib/utils";
import { NextResponse } from "next/server";

export async function GET() {
    try {
        const lowStock = await db.product.findMany({
            where:{
                quantity:{
                    lte: 6
                }
            },
            orderBy:{
                quantity: 'asc'
            }
        })

        const formattedProducts = lowStock.map((products) => ({
            id: products.id,
            productName: capitalLetter(products.product_name),
            quantity: products.quantity
        }))

        return NextResponse.json(formattedProducts, {status: 200})
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