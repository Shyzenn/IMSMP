import { db } from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET() {
    try {
        const products = await db.product.findMany({
            take:15,
            orderBy:{
                releaseDate: 'desc'
            }
        })

        return NextResponse.json(products, {status: 200})
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