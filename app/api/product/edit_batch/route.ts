import { auth } from "@/auth";
import { db } from "@/lib/db";
import { editBatchSchema } from "@/lib/types";
import { NextResponse } from "next/server";

// edit batch
export async function PATCH(req: Request) {
  try {

     const session = await auth()

     if (!session || !session.user?.id) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 400 });
    }

    const userId = session.user.id; 

    const body = await req.json();
    const { id, quantity, releaseDate, expiryDate } = body;

    // Validate input using Zod schema
    const result = editBatchSchema.safeParse(body);

    // Create an object to store validation errors
    const zodErrors: Record<string, string> = {};
    if (!result.success) {
      result.error.issues.forEach((issue) => {
        zodErrors[issue.path[0]] = issue.message;
      });
      return NextResponse.json({ errors: zodErrors }, { status: 400 });
    }

    // Update a new batch in the database
    const editBatch = await db.productBatch.update({
      where: { id },
      data: {
        quantity,
        releaseDate,
        expiryDate,
      },
      include: {
        product: { select : {product_name : true } }
      }
    });

    await db.auditLog.create({
      data: {
        userId,
        action: "Product Batch Edited",
        entityType: "Product",
        entityId: editBatch.id,
        description: `Batch #${editBatch.batchNumber} of "${editBatch.product.product_name}" edited by ${session.user.username} (${session.user.role}).`
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    if (error instanceof Error) {
      console.error("Error in POST /api/product/edit_batch:", error.message);
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