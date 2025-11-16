import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { Decimal } from "@prisma/client/runtime/library";
import { Prisma } from "@prisma/client";
import { auth } from "@/auth";

export async function GET(req: NextRequest) {

  const session = await auth();

  if (!session || !session.user?.id) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(req.url);
    const type = searchParams.get("type") || "all";
    const filter = searchParams.get("filter") || "all"; // Category names comma-separated
    const query = searchParams.get("query") || "";
    const stockFilter = searchParams.get("stockFilter") || "all";

    // Build the where clause based on filters
    const whereClause: Prisma.ProductWhereInput  = {
      status: "ACTIVE",
    };

    // Category filter - handle comma-separated category names like your getProductList
    const selectedCategories = filter?.split(",") || [];
    if (selectedCategories.length > 0 && selectedCategories[0] !== "all") {
      whereClause.category = {
        name: {
          in: selectedCategories,
        },
      };
    }

    // Search filter
    if (query) {
      whereClause.product_name = {
        contains: query,
      };
    }

    // Fetch products with their batches to calculate total quantity
    const products = await db.product.findMany({
      where: whereClause,
      include: {
        category: true,
        batches: {
          where: {
            type: { not: "ARCHIVED" }, // Match your InventoryTable logic
          },
          orderBy: { expiryDate: "asc" },
        },
      },
      orderBy: { product_name: "asc" },
    });

    // Calculate total quantities - only count batches with quantity > 0
    let filteredProducts = products.map((product) => {
      const validBatches = product.batches.filter(
        (b) => b.quantity > 0 && b.type !== "ARCHIVED"
      );
      const totalQuantity = validBatches.reduce(
        (sum, batch) => sum + batch.quantity,
        0
      );

       const price = product.price instanceof Decimal 
        ? product.price.toNumber() 
        : Number(product.price);

      return {
        id: product.id,
        product_name: product.product_name,
        category: product.category?.name || "Uncategorized",
        batches: validBatches.length,
        totalQuantity,
        price: price
      };
    });

    // Apply stock filter (matching your InventoryTable's logic)
    const LOW_STOCK_THRESHOLD = 6; // Match your table: totalQuantity <= 6
    
    if (stockFilter === "inStock") {
      filteredProducts = filteredProducts.filter((p) => p.totalQuantity > 0);
    } else if (stockFilter === "outOfStock") {
      filteredProducts = filteredProducts.filter((p) => p.totalQuantity === 0);
    } else if (stockFilter === "lowStock") {
      filteredProducts = filteredProducts.filter(
        (p) => p.totalQuantity > 0 && p.totalQuantity <= LOW_STOCK_THRESHOLD
      );
    }

    // Override with export type
    if (type === "lowStock") {
      filteredProducts = filteredProducts.filter(
        (p) => p.totalQuantity > 0 && p.totalQuantity <= LOW_STOCK_THRESHOLD
      );
    }

    if (filteredProducts.length === 0) {
      return NextResponse.json(
        { error: "No products found with current filters" },
        { status: 404 }
      );
    }

    // Return data for client-side PDF generation
    return NextResponse.json({
      products: filteredProducts,
      meta: {
        type,
        category: selectedCategories[0] !== "all" ? selectedCategories.join(", ") : "All",
        query,
        stockFilter,
        lowStockThreshold: LOW_STOCK_THRESHOLD,
      },
    });
  } catch (error) {
    console.error("Error fetching products for export:", error);
    return NextResponse.json(
      {
        error: "Failed to fetch products",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}