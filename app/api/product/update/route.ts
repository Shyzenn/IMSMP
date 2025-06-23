import { db } from "@/lib/db";
import { editProductSchema } from "@/lib/types";
import { NextResponse } from "next/server";

// update new product
export async function PATCH(req: Request) {
  try {
     const body = await req.json();
    const { id, product_name, category, quantity, price, releaseDate, expiryDate } = body;

    // Validate input using Zod schema
    const result = editProductSchema.safeParse(body);

    // Create an object to store validation errors
    const zodErrors: Record<string, string> = {};
    if (!result.success) {
      result.error.issues.forEach((issue) => {
        zodErrors[issue.path[0]] = issue.message;
      });
      return NextResponse.json({ errors: zodErrors }, { status: 400 });
    }

    const existingProduct = await db.product.findFirst({
        where: {
            product_name,
            NOT: { id },
        },
    });

    if (existingProduct) {
        return NextResponse.json({
            errors: {
            product_name: "Product name is already taken",
            },
        }, { status: 400 });
    }

    const releaseDateUTC = new Date(releaseDate).toISOString();
    const expiryDateUTC = new Date(expiryDate).toISOString();

    // Update a new product in the database
    await db.product.update({
      where:{id},
      data: {
        product_name,
        category,
        quantity,
        price,
        releaseDate: releaseDateUTC,
        expiryDate: expiryDateUTC,
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