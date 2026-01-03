import { auth } from "@/auth";
import { db } from "@/lib/db";
import { Prisma } from "@prisma/client";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const session = await auth();

  if (!session || !session.user.id) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(req.url);

    const search = searchParams.get("search") ?? "";
    const categories = searchParams.getAll("category");
    const requiresPrescription = searchParams.get("requiresPrescription");

    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "25", 10);
    const skip = (page - 1) * limit;

    const where: Prisma.ProductWhereInput = {
      status: { not: "ARCHIVED" },
    };

    if (search) {
      where.OR = [
        {
          product_name: {
            contains: search,
          },
        },
        {
          genericName: {
            contains: search,
          },
        },
      ];
    }

    if (categories.length > 0) {
      where.dosageForm = {
        in: categories,
      };
    }

    if (requiresPrescription !== null && requiresPrescription !== undefined) {
      where.requiresPrescription = requiresPrescription === "true";
    }

    const medicines = await db.product.findMany({
      where,
      select: {
        id: true,
        product_name: true,
        genericName: true,
        dosageForm: true,
        strength: true,
        price: true,
        requiresPrescription: true,
        minimumStockAlert: true,
        batches: {
          select: {
            quantity: true,
          },
          where: {
            type: { notIn: ["ARCHIVED", "EXPIRED"] },
          },
        },
      },
      orderBy: {
        product_name: "asc",
      },
      skip,
      take: limit,
    });

    const totalCount = await db.product.count({ where });
    const nextPage = skip + medicines.length < totalCount ? page + 1 : null;

    return NextResponse.json({ items: medicines, nextPage });
  } catch (error) {
    console.error("GET /api/product/medicines", error);
    return NextResponse.json(
      { message: "Failed to fetch medicines" },
      { status: 500 }
    );
  }
}
