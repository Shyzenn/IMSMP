import { db } from "@/lib/db";
import { NextResponse } from "next/server";
import { addProductSchema } from "@/lib/types";
import { auth } from "@/auth";
import { toTitleCase } from "@/lib/utils";

// create product
export async function POST(req: Request) {
  try {
    const session = await auth();

    if (!session || !session.user?.id) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;

    const body = await req.json();

    const {
      product_name,
      category,
      price,
      genericName,
      manufacturer,
      description,
      strength,
      dosageForm,
      requiresPrescription,
      minimumStockAlert,
    } = body;

    // Validate input
    const result = addProductSchema.safeParse({
      product_name,
      category,
      price,
      genericName,
      manufacturer,
      description,
      strength,
      dosageForm,
      requiresPrescription,
      minimumStockAlert,
    });
    if (!result.success) {
      const zodErrors: Record<string, string> = {};
      result.error.issues.forEach((issue) => {
        zodErrors[issue.path[0]] = issue.message;
      });
      return NextResponse.json({ errors: zodErrors }, { status: 400 });
    }

    // Normalize category name
    const normalizedCategory = category.trim().toLowerCase();

    // Find category by normalized name
    const categoryRecord = await db.productCategory.findFirst({
      where: {
        name: normalizedCategory,
      },
    });

    if (!categoryRecord) {
      return NextResponse.json(
        { errors: { category: "Selected category does not exist" } },
        { status: 400 }
      );
    }

    const existingProduct = await db.product.findFirst({
      where: {
        product_name: {
          equals: product_name.trim(),
        },
        ...(strength
          ? {
              strength: {
                equals: strength.trim(),
              },
            }
          : {
              OR: [{ strength: null }, { strength: "" }],
            }),
      },
    });

    if (existingProduct) {
      return NextResponse.json(
        {
          errors: {
            product_name: strength
              ? `Product "${product_name}" with strength "${strength}" already exists.`
              : `Product "${product_name}" already exists.`,
          },
        },
        { status: 400 }
      );
    }

    const normalizedName = toTitleCase(product_name.trim());

    // Create product
    const newProduct = await db.product.create({
      data: {
        product_name: normalizedName,
        categoryId: categoryRecord.id,
        price,
        genericName,
        manufacturer,
        description,
        strength,
        dosageForm,

        requiresPrescription,
        minimumStockAlert,

        userId,
      },
    });

    await db.auditLog.create({
      data: {
        userId,
        action: "Product Created",
        entityType: "Product",
        entityId: newProduct.id,
        description: `Product "${newProduct.product_name}" created by ${session.user.username} (${session.user.role})`,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    if (error instanceof Error) {
      console.error("Error in POST /api/product:", error.message);
      return NextResponse.json(
        { message: "Failed to create product", error: error.message },
        { status: 500 }
      );
    } else {
      console.error("Unknown error:", error);
      return NextResponse.json(
        { message: "An unknown error occurred" },
        { status: 500 }
      );
    }
  }
}

// get product
export async function GET() {
  const session = await auth();

  if (!session || !session.user?.id) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    // Then fetch products with active batches
    const products = await db.product.findMany({
      include: {
        batches: {
          orderBy: {
            expiryDate: "asc", // Get batches expiring soonest first (FEFO)
          },
        },
      },
    });

    return NextResponse.json(products, { status: 200 });
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
