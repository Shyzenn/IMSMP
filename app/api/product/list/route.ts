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

    const where: Prisma.ProductWhereInput = {
      status: "ACTIVE",
      OR: [
        {
          product_name: {
            contains: query,
          },
        },
        {
          id: !isNaN(Number(query)) ? Number(query) : undefined,
        },
      ],
    };

    const selectedCategoriesParam = filter;
    const selectedCategories = selectedCategoriesParam?.split(",") || [];

    if (selectedCategories.length > 0 && selectedCategories[0] !== "all") {
      where.category = {
        name: {
          in: selectedCategories,
        },
      };
    }

    const databaseSortFields = ["id", "product_name", "price", "createdAt"];
    const isDatabaseSort = databaseSortFields.includes(sortBy);

    // Get total count for pagination
    const totalProducts = await db.product.count({ where });

    const products = await db.product.findMany({
      where,
      include: {
        batches: {
          where: {
            type: { not: "ARCHIVED" },
          },
          orderBy: { expiryDate: "asc" },
        },
        category: true,
      },
      ...(isDatabaseSort && {
        orderBy: {
          [sortBy]: sortOrder,
        },
      }),
      ...(isDatabaseSort
        ? {
            take: ITEMS_PER_PAGE,
            skip: offset,
          }
        : {}),
    });

    let mappedProducts = products.map((p) => {
      const validBatches = p.batches
        .filter((b) => b.quantity > 0 && b.type !== "ARCHIVED")
        .map((b) => ({
          ...b,
        }));
      const totalQuantity = validBatches.reduce(
        (sum, b) => sum + b.quantity,
        0
      );
      const totalBatches = p.batches.length;

      const now = new Date();
      const threshold = new Date();
      threshold.setDate(now.getDate() + 31);

      const expiringSoonCount = validBatches.filter((b) => {
        const expiry = new Date(b.expiryDate);
        return expiry > now && expiry <= threshold;
      }).length;

      return {
        id: p.id,
        product_name: p.product_name,
        genericName: p.genericName,
        manufacturer: p.manufacturer,
        description: p.description,
        requiresPrescription: p.requiresPrescription,
        minimumStockAlert: p.minimumStockAlert?.toNumber(),
        strength: p.strength,
        dosageForm: p.dosageForm,
        category: p.category?.name ?? "Uncategorized",
        createdAt: p.createdAt,
        totalQuantity,
        price: p.price.toNumber(),
        totalBatches,
        expiringSoonCount,
        batches: validBatches,
        batchQuantity: validBatches.map((b) => b.quantity),
        status: p.status as "ACTIVE" | "ARCHIVED",
        archiveReason: p.archiveReason,
        icon: [],
      };
    });

    // Handle non-database sorts (computed fields)
    if (!isDatabaseSort) {
      if (sortBy === "expiringSoon") {
        mappedProducts = mappedProducts.sort((a, b) =>
          sortOrder === "asc"
            ? a.expiringSoonCount - b.expiringSoonCount
            : b.expiringSoonCount - a.expiringSoonCount
        );
      } else if (sortBy === "totalQuantity") {
        mappedProducts = mappedProducts.sort((a, b) =>
          sortOrder === "asc"
            ? a.totalQuantity - b.totalQuantity
            : b.totalQuantity - a.totalQuantity
        );
      } else if (sortBy === "totalBatches") {
        mappedProducts = mappedProducts.sort((a, b) =>
          sortOrder === "asc"
            ? a.totalBatches - b.totalBatches
            : b.totalBatches - a.totalBatches
        );
      }

      // Paginate after sorting for non-database sorts
      const paginatedProducts = mappedProducts.slice(
        offset,
        offset + ITEMS_PER_PAGE
      );

      return NextResponse.json({
        data: paginatedProducts,
        meta: {
          totalProducts,
          totalPages: Math.ceil(totalProducts / ITEMS_PER_PAGE),
          currentPage,
        },
      });
    }

    // For database sorts, products are already paginated
    return NextResponse.json({
      data: mappedProducts,
      meta: {
        totalProducts,
        totalPages: Math.ceil(totalProducts / ITEMS_PER_PAGE),
        currentPage,
      },
    });
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
