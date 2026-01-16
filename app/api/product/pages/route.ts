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
    const filter = searchParams.get("filter") || "";

    const where: Prisma.ProductWhereInput = {
      product_name: {
        contains: query,
      },
      status: "ACTIVE",
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

    const totalProducts = await db.product.count({ where });
    const totalPages = Math.ceil(totalProducts / ITEMS_PER_PAGE);

    return NextResponse.json({ totalPages, totalProducts }, { status: 200 });
  } catch (error) {
    console.error("Error fetching product pages:", error);
    return NextResponse.json(
      {
        message: "Failed to fetch total number of products",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
