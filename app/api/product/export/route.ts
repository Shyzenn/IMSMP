import { db } from "@/lib/db";
import { NextResponse } from "next/server";

const LOW_STOCK_THRESHOLD = 6;

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const type = searchParams.get("type");

    let products;

    if (type === "expiring") {
        const today = new Date();
        const next7 = new Date();
        next7.setDate(today.getDate() + 7);

        products = await db.productBatch.findMany({
            where: {
            expiryDate: { gte: today, lte: next7 },
            type: "ACTIVE",
            },
            include: {
            product: { include: { category: true } },
            },
        });
    } else if (type === "expired") {
        const today = new Date();

        products = await db.productBatch.findMany({
            where: {
            expiryDate: { lt: today },
            type: "ACTIVE",
            },
            include: {
            product: { include: { category: true } },
            },
        });
    } else if (type === "lowStock") {
        const allProducts = await db.product.findMany({
            where: { status: "ACTIVE" },
            include: {
            category: true,
            batches: {
                where: { type: "ACTIVE" },
            },
            },
        });

        products = allProducts
            .map((product) => {
            const totalQty = product.batches.reduce((sum, b) => sum + b.quantity, 0);
            return { ...product, totalQty };
            })
            .filter((p) => p.totalQty < LOW_STOCK_THRESHOLD);
    } else if (type === "all") {
        products = await db.product.findMany({
            where: { status: "ACTIVE" },
            include: {
            category: true,
            batches: true,
            },
    });
    } else if (type === "allBatches") {
        products = await db.productBatch.findMany({
            where: { type: "ACTIVE" },
            include: {
            product: { include: { category: true } },
            },
        });
    }


    return NextResponse.json(products);
  } catch (error) {
    console.error("Download API error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
