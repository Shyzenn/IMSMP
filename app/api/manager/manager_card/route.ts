import { db } from "@/lib/db";
import { addDays, isAfter, isBefore } from "date-fns";
import { NextResponse } from "next/server";

export async function GET() {
    try{
        const products = await db.product.findMany()

            const now = new Date()
            const in30Days = addDays(now, 30)

            const totalProduct = products.length
            const lowStock = products.filter((p) => p.quantity <= 6)
            const highStock = products.filter((p) => p.quantity > 6)
            const expiring = products.filter(
            (p) =>
            p.expiryDate &&
            isAfter(new Date(p.expiryDate), now) &&
            isBefore(new Date(p.expiryDate), in30Days)
        ).length;

        const data = await Promise.all([
            totalProduct,
            lowStock,
            highStock,
            expiring
        ])

        return NextResponse.json(data, {status:200})

    } catch (error) {

        console.error("Error fetching cards data", error);
        return NextResponse.json(
        {
            message: "Failed to fetch cards data",
            error: error instanceof Error ? error.message : "Unknown error",
        },
        { status: 500 }
        );

    } 
}