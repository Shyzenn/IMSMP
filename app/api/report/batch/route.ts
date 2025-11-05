import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const type = searchParams.get("type")?.toLowerCase() || "all";
    const now = new Date();

    const batches = await db.productBatch.findMany({
      where: {
        type: { not: "ARCHIVED" },
      },
      include: {
        product: {
          include: { category: true },
        },
      },
      orderBy: { expiryDate: "asc" },
    });

    let filteredBatches = batches.filter((b) => b.product.status === "ACTIVE");

    // Apply filter by type
    if (type === "expiring") {
      const soon = new Date();
      soon.setDate(now.getDate() + 31);
      filteredBatches = filteredBatches.filter(
        (b) =>
          b.expiryDate && b.expiryDate > now && b.expiryDate <= soon && b.quantity > 0
      );
    } else if (type === "expired") {
      filteredBatches = filteredBatches.filter(
        (b) => b.expiryDate && b.expiryDate < now && b.quantity > 0
      );
    } else if (type === "consumed") {
      // consumed = quantity === 0
      filteredBatches = filteredBatches.filter((b) => b.quantity === 0);
    } else if (type === "all") {
      // keep all except archived
      filteredBatches = filteredBatches.filter((b) => b.type !== "ARCHIVED");
    }

    if (filteredBatches.length === 0) {
      return NextResponse.json(
        { error: "No batch data found" },
        { status: 404 }
      );
    }

    // Determine status correctly
    const formatted = filteredBatches.map((b) => {
      let status = "Active";

      if (b.quantity === 0) {
        status = "Consumed";
      } else if (b.expiryDate && b.expiryDate < now) {
        status = "Expired";
      } else if (
        b.expiryDate &&
        b.expiryDate <= new Date(now.getTime() + 31 * 86400000)
      ) {
        status = "Expiring Soon";
      }

      return {
        batchNumber: b.batchNumber,
        productName: b.product.product_name,
        category: b.product.category?.name || "Uncategorized",
        quantity: b.quantity,
        expiryDate: b.expiryDate
          ? new Date(b.expiryDate).toLocaleDateString("en-PH")
          : "N/A",
        status,
      };
    });

    return NextResponse.json({
      batches: formatted,
      meta: {
        type,
        generatedAt: now.toISOString(),
      },
    });
  } catch (error) {
    console.error("Batch export error:", error);
    return NextResponse.json(
      { error: "Failed to fetch batches" },
      { status: 500 }
    );
  }
}
