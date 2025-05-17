import { db } from "@/lib/db";
import { NextResponse } from "next/server";
import { addProductSchema } from "@/lib/types";

// create product
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { product_name, category, quantity, price, releaseDate, expiryDate } = body;

    // Validate input using Zod schema
    const result = addProductSchema.safeParse({
        product_name,
        category,
        quantity,
        price,
        releaseDate: new Date(releaseDate),
        expiryDate: new Date(expiryDate),
    });

    // Create an object to store validation errors
    const zodErrors: Record<string, string> = {};
    if (!result.success) {
      result.error.issues.forEach((issue) => {
        zodErrors[issue.path[0]] = issue.message;
      });
      return NextResponse.json({ errors: zodErrors }, { status: 400 });
    }

    const existingUser = await db.product.findFirst({
      where: {product_name},
    });

    if (existingUser) {
      if (existingUser.product_name === product_name) {
        zodErrors.product_name = "Product name is already taken";
      }
    }

    if (Object.keys(zodErrors).length > 0) {
      return NextResponse.json({ errors: zodErrors }, { status: 400 });
    }

    const releaseDateUTC = new Date(releaseDate).toISOString();
    const expiryDateUTC = new Date(expiryDate).toISOString();

    // Create a new user in the database
    await db.product.create({
      data: {
        product_name,
        category,
        quantity,
        price,
        releaseDate: releaseDateUTC,
        expiryDate: expiryDateUTC
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
    const products = await db.product.findMany();

    return NextResponse.json(products, { status: 200 });
  } catch (error) {
    console.error("Error fetching products:", error);
    return NextResponse.json(
      { message: "Failed to fetch products", error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}
  