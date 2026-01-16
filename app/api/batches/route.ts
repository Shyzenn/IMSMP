import { db } from "@/lib/db";
import { auth } from "@/auth";
import { NextRequest, NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { ITEMS_PER_PAGE } from "@/lib/utils";

export async function GET(request: NextRequest) {
  const session = await auth();

  if (!session || !session.user?.id) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    const searchParams = request.nextUrl.searchParams;
    const query = searchParams.get("query") || "";
    const currentPage = Number(searchParams.get("page")) || 1;
    const filter = searchParams.get("filter") || "";
    const sortBy = searchParams.get("sortBy") || "createdAt";
    const sortOrder = (searchParams.get("sortOrder") || "desc") as
      | "asc"
      | "desc";

    const offset = (currentPage - 1) * ITEMS_PER_PAGE;
    const safeQuery = query.toLowerCase().trim();

    const where: Prisma.ProductBatchWhereInput = {
      product: {
        product_name: {
          contains: safeQuery,
        },
        status: "ACTIVE",
      },
    };

    const validSortFields: Record<
      string,
      keyof Prisma.ProductBatchOrderByWithRelationInput
    > = {
      product_name: "product",
      batchNumber: "batchNumber",
      quantity: "quantity",
      manufactureDate: "manufactureDate",
      expiryDate: "expiryDate",
      createdAt: "createdAt",
      notes: "notes",
    };

    let orderBy: Prisma.ProductBatchOrderByWithRelationInput;
    if (sortBy === "product_name") {
      orderBy = { product: { product_name: sortOrder } };
    } else {
      orderBy = { [validSortFields[sortBy] || "createdAt"]: sortOrder };
    }

    const batches = await db.productBatch.findMany({
      where,
      orderBy,
      include: {
        product: {
          select: {
            id: true,
            product_name: true,
            category: true,
            genericName: true,
            dosageForm: true,
            strength: true,
            price: true,
          },
        },
      },
    });

    const totalQuantity = batches.reduce((sum, item) => sum + item.quantity, 0);

    const enriched = batches.map((batch) => {
      const batchObj = {
        ...batch,
        product: {
          product_name: batch.product.product_name,
          productId: batch.product.id,
          category: batch.product.category,
          genericName: batch.product.genericName,
          dosageForm: batch.product.dosageForm,
          strength: batch.product.strength,
          price: batch.product.price.toNumber(),
        },
        totalQuantity: totalQuantity,
        quantity: batch.quantity,
        notes: batch.notes ? batch.notes : "N/A",
        status: (() => {
          if (batch.type === "ARCHIVED") return "ARCHIVED";

          const now = new Date();
          if (batch.quantity === 0) return "Consumed";
          if (new Date(batch.expiryDate) < now) return "Expired";

          const daysToExpire =
            (new Date(batch.expiryDate).getTime() - now.getTime()) /
            (1000 * 60 * 60 * 24);
          if (daysToExpire <= 31) return "Expiring";

          return "Active";
        })(),
      };

      return batchObj;
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

    // Apply pagination after filtering
    const paginatedBatches = filtered.slice(offset, offset + ITEMS_PER_PAGE);

    return NextResponse.json({
      data: paginatedBatches,
      meta: {
        totalBatches,
        totalPages,
        currentPage,
      },
    });
  } catch (error) {
    console.error("Error fetching batches:", error);
    return NextResponse.json(
      {
        message: "Failed to fetch batches",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
