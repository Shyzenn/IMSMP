import { auth } from "@/auth";
import { db } from "@/lib/db";
import { editBatchSchema } from "@/lib/types";
import { NextResponse } from "next/server";
import { format } from "date-fns";

export async function PATCH(req: Request) {
  try {
    const session = await auth();

    if (!session || !session.user?.id) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;
    const body = await req.json();

    const result = editBatchSchema.safeParse(body);
    if (!result.success) {
      const zodErrors: Record<string, string> = {};
      result.error.issues.forEach((issue) => {
        zodErrors[issue.path[0]] = issue.message;
      });
      return NextResponse.json({ errors: zodErrors }, { status: 400 });
    }

    const { id, quantity, releaseDate, expiryDate } = result.data;

    if (isNaN(releaseDate.getTime()) || isNaN(expiryDate.getTime())) {
      return NextResponse.json(
        { message: "Invalid date format" },
        { status: 400 }
      );
    }

    const existingBatch = await db.productBatch.findUnique({
      where: { id },
      include: { product: true },
    });

    if (!existingBatch) {
      return NextResponse.json({ message: "Batch not found" }, { status: 404 });
    }

    const oldBatchSuffix = existingBatch.batchNumber.split("B")[1] ?? "01";

    const newDateCode = format(releaseDate, "ddMMyyyy");
    const newBatchNumber = `${newDateCode}B${oldBatchSuffix}`;
    function normalizeDate(date: Date) {
      const d = new Date(date);
      d.setHours(12, 0, 0, 0); 
      return d;
    }

    const updatedBatch = await db.productBatch.update({
      where: { id },
      data: {
        quantity,
        releaseDate: normalizeDate(releaseDate),
        expiryDate: normalizeDate(expiryDate),
        batchNumber: newBatchNumber, 
      },
      include: {
        product: { select: { product_name: true } },
      },
    });

    await db.auditLog.create({
      data: {
        userId,
        action: "Product Batch Edited",
        entityType: "Product",
        entityId: updatedBatch.id,
        description: `Batch #${updatedBatch.batchNumber} of "${updatedBatch.product.product_name}" edited by ${session.user.username} (${session.user.role}).`,
      },
    });

    return NextResponse.json({ success: true, batch: updatedBatch });
  } catch (error) {
    console.error("Error editing batch:", error);
    return NextResponse.json(
      { message: "Failed to edit batch" },
      { status: 500 }
    );
  }
}
