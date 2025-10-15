import { auth } from "@/auth";
import { db } from "@/lib/db";
import { replenishProductSchema } from "@/lib/types";
import { NextResponse } from "next/server";
import { format } from "date-fns";

export async function POST(req: Request) {
  try {
    const session = await auth();

    if (!session || !session.user?.id) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;
    const body = await req.json();

    const result = replenishProductSchema.safeParse(body);
    if (!result.success) {
      const zodErrors: Record<string, string> = {};
      result.error.issues.forEach((issue) => {
        zodErrors[issue.path[0]] = issue.message;
      });
      return NextResponse.json({ errors: zodErrors }, { status: 400 });
    }

    const { productId, quantity, releaseDate, expiryDate } = result.data;

    const product = await db.product.findUnique({
      where: { id: productId },
    });

    if (!product) {
      return NextResponse.json(
        { message: "Product not found" },
        { status: 404 }
      );
    }

    const rd = new Date(releaseDate);
    if (isNaN(rd.getTime())) {
      return NextResponse.json(
        { message: "Invalid releaseDate" },
        { status: 400 }
      );
    }

    const countForProduct = await db.productBatch.count({
      where: { productId },
    });

    const paddedCount = String(countForProduct + 1).padStart(2, "0");

    const dateCode = format(rd, "ddMMyyyy");
    const batchNumber = `${dateCode}B${paddedCount}`;

    const newBatch = await db.productBatch.create({
      data: {
        productId,
        batchNumber,
        quantity,
        releaseDate: new Date(releaseDate),
        expiryDate: new Date(expiryDate),
      },
    });

    await db.auditLog.create({
      data: {
        userId,
        action: "Product Replenished",
        entityType: "Product",
        entityId: newBatch.id,
        description: `User ${session.user.username} (${session.user.role}) replenished ${quantity} of "${product.product_name}" (Batch: ${batchNumber}).`,
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
