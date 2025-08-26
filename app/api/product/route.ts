import { db } from "@/lib/db";
import { NextResponse } from "next/server";
import { addProductSchema } from "@/lib/types";
import { auth } from "@/auth";
import { NotificationType } from "@prisma/client";
import { sendNotification } from "@/server";

// create product
export async function POST(req: Request) {

  try {

    const session = await auth()

     if (!session || !session.user?.id) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 400 });
    }

    const userId = session.user.id; 

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

    const existingProduct = await db.product.findFirst({
      where: {product_name},
    });

    if (existingProduct) {
      if (existingProduct.product_name === product_name) {
        zodErrors.product_name = "Product name is already taken";
      }
    }

    if (Object.keys(zodErrors).length > 0) {
      return NextResponse.json({ errors: zodErrors }, { status: 400 });
    }

    const releaseDateUTC = new Date(releaseDate).toISOString();
    const expiryDateUTC = new Date(expiryDate).toISOString();

    // Create a new product in the database
   const newProduct = await db.product.create({
      data: {
        product_name,
        category,
        quantity,
        price,
        releaseDate: releaseDateUTC,
        expiryDate: expiryDateUTC,
        userId
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

     const managers = await db.user.findMany({
      where: {role: "Manager"}
    })

    const notifications = managers.map((manager) => ({
      title: "New Product Added",
      message: JSON.stringify({
        productName: product_name,
        submittedBy: session.user.username,
        role: session.user.role
      }),
      type: NotificationType.ADD_PRODUCT,
      senderId: session.user.id,
      recipientId: manager.id,
    }))

    await db.notification.createMany({data: notifications})

     for (const notification of notifications) {
        sendNotification(notification.recipientId, {
          title: notification.title,
          message: notification.message,
          type: notification.type,
        });
      }

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
  