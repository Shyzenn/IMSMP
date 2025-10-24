import { db } from "@/lib/db";
import { NextResponse } from "next/server";
import { addProductSchema } from "@/lib/types";
import { auth } from "@/auth";

// create product
export async function POST(req: Request) {

  try {

    const session = await auth()

     if (!session || !session.user?.id) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 400 });
    }

    const userId = session.user.id; 

    const body = await req.json();

   const { product_name, category, price } = body;

    // Validate input
    const result = addProductSchema.safeParse({ product_name, category, price });
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
        name: normalizedCategory, // make sure stored category names are also normalized
      },
    });

    if (!categoryRecord) {
      return NextResponse.json(
        { errors: { category: "Selected category does not exist" } },
        { status: 400 }
      );
    }

    // Check if product already exists
    const existingProduct = await db.product.findFirst({
      where: { product_name: product_name.trim() },
    });

    if (existingProduct) {
      return NextResponse.json(
        { errors: { product_name: "Product name is already exists." } },
        { status: 400 }
      );
    }

    // Create product
    const newProduct = await db.product.create({
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
  try {
    const products = await db.product.findMany({
      include: {batches: true}
    });

    return NextResponse.json(products, { status: 200 });
  } catch (error) {
    console.error("Error fetching products:", error);
    return NextResponse.json(
      { message: "Failed to fetch products", error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}
  