import { db } from "@/lib/db";
import { NextResponse } from "next/server";
import { editProductSchema } from "@/lib/types";
import { auth } from "@/auth";
import { toTitleCase } from "@/lib/utils";

// update product
export async function PATCH(req: Request) {
  try {
    const session = await auth();

    if (!session || !session.user?.id) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;

    const body = await req.json();

    const {
      productId,
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
    const result = editProductSchema.safeParse({
      productId,
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
        id: {
          not: productId,
        },
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

    // Edit product
    const editProduct = await db.product.update({
      where: {
        id: productId,
      },
      data: {
        product_name: normalizedName,
        categoryId: categoryRecord.id,
        price,
        genericName: toTitleCase(genericName.trim()),
        manufacturer,
        description,
        strength,
        dosageForm,
        requiresPrescription: requiresPrescription || false,
        minimumStockAlert,
        userId: session.user.id,
      },
    });

    await db.auditLog.create({
      data: {
        userId,
        action: "Product Edited",
        entityType: "Product",
        entityId: editProduct.id,
        description: `Product "${editProduct.product_name}" edited by ${session.user.username} (${session.user.role})`,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    if (error instanceof Error) {
      console.error("Error in POST /api/product:", error.message);
      return NextResponse.json(
        { message: "Failed to edit product", error: error.message },
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
