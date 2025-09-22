import { auth } from "@/auth";
import { db } from "@/lib/db";
import { replenishProductSchema } from "@/lib/types";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const session = await auth();

    if (!session || !session.user?.id) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;
    const body = await req.json();

    // Validate with zod
    const result = replenishProductSchema.safeParse(body);
    if (!result.success) {
      const zodErrors: Record<string, string> = {};
      result.error.issues.forEach((issue) => {
        zodErrors[issue.path[0]] = issue.message;
      });
      return NextResponse.json({ errors: zodErrors }, { status: 400 });
    }

    const { productId, quantity, releaseDate, expiryDate } = result.data;

    // Ensure product exists
    const product = await db.product.findUnique({
      where: { id: productId },
    });
    if (!product) {
      return NextResponse.json(
        { message: "Product not found" },
        { status: 404 }
      );
    }

    const batchCount = await db.productBatch.count({
      where: { productId },
    });
    const nextBatchNumber = batchCount + 1;

    // Create new batch
    const newBatch = await db.productBatch.create({
      data: {
        productId,
        batchNumber: nextBatchNumber,
        quantity,
        releaseDate: new Date(releaseDate),
        expiryDate: new Date(expiryDate),
      },
    });

    // Audit log
    await db.auditLog.create({
      data: {
        userId,
        action: "Product Replenished",
        entityType: "Product",
        entityId: newBatch.id,
        description: `User ${session.user.username} (${session.user.role}) replenished ${quantity} of "${product.product_name}" (Batch ID: ${newBatch.id}).`,
      },
    });

    return NextResponse.json({ success: true, batch: newBatch });
  } catch (error) {
    console.error("Error replenishing product:", error);
    return NextResponse.json(
      { message: "Failed to replenish product" },
      { status: 500 }
    );
  }
}
