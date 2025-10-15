import { auth } from "@/auth";
import { db } from "@/lib/db";
import { editProductSchema } from "@/lib/types";
import { NextResponse } from "next/server";

// update new product
export async function PATCH(req: Request) {
  try {

     const session = await auth()

     if (!session || !session.user?.id) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 400 });
    }

    const userId = session.user.id; 

    const body = await req.json();
    const { productId, product_name, category, price } = body;

    // Validate input using Zod schema
   const result = editProductSchema.safeParse({ productId, product_name, category, price });
    if (!result.success) {
      const zodErrors: Record<string, string> = {};
      result.error.issues.forEach((issue) => {
        zodErrors[issue.path[0]] = issue.message;
      });
      return NextResponse.json({ errors: zodErrors }, { status: 400 });
    }

    const normalizedCategory = category.trim().toLowerCase();

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
        product_name: product_name.trim(), 
        NOT: {id: productId} 
      },
    });

    if (existingProduct) {
        return NextResponse.json({
            errors: {
            product_name: "Product name is already taken",
            },
        }, { status: 400 });
    }

    // Update a new product in the database
    const editProduct = await db.product.update({
      where: {
        id: productId,
      },
      data: {
        product_name: product_name.trim(),
        price,
        userId: session.user.id,
        categoryId: categoryRecord.id,
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