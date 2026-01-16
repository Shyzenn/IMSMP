import { db } from "@/lib/db";
import { auth } from "@/auth";
import { NextRequest, NextResponse } from "next/server";
import { ITEMS_PER_PAGE } from "@/lib/utils";

export async function GET(request: NextRequest) {
  const session = await auth();

  if (!session || !session.user?.id) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    const searchParams = request.nextUrl.searchParams;
    const query = searchParams.get("query") || "";
    const filter = searchParams.get("filter") || "";

    const safeQuery = query.toLowerCase().trim();

    const batches = await db.productBatch.findMany({
      where: {
        product: {
          product_name: {
            contains: safeQuery,
          },
          status: "ACTIVE",
        },
      },
      include: { product: true },
    });

    const now = new Date();
    const enriched = batches.map((batch) => {
      if (batch.type === "ARCHIVED") {
        return { ...batch, status: "ARCHIVED" as const };
      }

      let status: "Active" | "Expiring" | "Expired" | "Consumed" = "Active";

      if (batch.quantity === 0) {
        status = "Consumed";
      } else if (new Date(batch.expiryDate) < now) {
        status = "Expired";
      } else {
        const daysToExpire =
          (new Date(batch.expiryDate).getTime() - now.getTime()) /
          (1000 * 60 * 60 * 24);
        if (daysToExpire <= 31) status = "Expiring";
      }

      return { ...batch, status };
    });

    // Filter by status (support multiple statuses)
    const selectedStatusesParam = filter;
    const selectedStatuses = selectedStatusesParam?.split(",") || [];

    let filtered = enriched;
    if (selectedStatuses.length > 0 && selectedStatuses[0] !== "all") {
      filtered = enriched.filter((batch) =>
        selectedStatuses.includes(batch.status)
      );
    }

    const totalBatches = filtered.length;
    const totalPages = Math.ceil(totalBatches / ITEMS_PER_PAGE);

    return NextResponse.json({ totalPages, totalBatches }, { status: 200 });
  } catch (error) {
    console.error("Error fetching batch pages:", error);
    return NextResponse.json(
      {
        message: "Failed to fetch total number of batches",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
