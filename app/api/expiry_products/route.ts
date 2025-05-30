import { db } from "@/lib/db";
import { capitalLetter } from "@/lib/utils";
import { NextResponse } from "next/server";

export async function GET() {
    try {

        const now = new Date();
        const in30Days = new Date();
        in30Days.setDate(now.getDate() + 30)

        const expiryProducts = await db.product.findMany({
            where: {
               expiryDate:{
                gt:now,
                lte: in30Days
               }
            },
            orderBy: {
                expiryDate: 'asc'
            }
        })

        const formattedProducts = expiryProducts.map((product) => ({
            id: product.id,
            name:capitalLetter(product.product_name),
            expiryDate: product.expiryDate?.toLocaleDateString("en-GB"),
            quantity: product.quantity,
            category: capitalLetter(product.category)
        }))

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