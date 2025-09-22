import { db } from "@/lib/db";
import { addDays } from "date-fns";
import { NextResponse } from "next/server";

export async function GET() {
    try{
        const products = await db.product.findMany({
            include: {
                batches: true
            }
        })

            const now = new Date()
            const in30Days = addDays(now, 30)

            const totalProduct = products.length;
            let lowStock = 0;
            let highStock = 0;
            let expiring = 0;


            products.forEach((product) => {
            const totalQuantity = product.batches?.reduce((acc, b) => acc + b.quantity, 0) ?? 0;
            if (totalQuantity <= 6) lowStock++;
            else highStock++;

            if (
                product.batches?.some(
                (batch) => batch.expiryDate > now && batch.expiryDate <= in30Days
                )
            ) {
                expiring++;
            }
            });

            const data = await Promise.all([
                totalProduct,
                lowStock,
                highStock,
                expiring,
            ])

        return NextResponse.json(data, {status: 200});

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