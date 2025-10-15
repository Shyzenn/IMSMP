import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { db } from "@/lib/db";
import { editRequestOrderSchema } from "@/lib/types";

export async function PATCH(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();

    if (!session || !session.user?.id) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { id } = await context.params;
    const orderId = parseInt(id.replace(/^ORD-/, ""), 10);

    if (isNaN(orderId)) {
      return NextResponse.json({ message: "Invalid order ID" }, { status: 400 });
    }

    const body = await req.json();
    const result = editRequestOrderSchema.safeParse(body);
    if (!result.success) {
      const zodErrors: Record<string, string> = {};
      result.error.issues.forEach((issue) => {
        const field = issue.path.join(".");
        zodErrors[field] = issue.message;
      });
      return NextResponse.json({ errors: zodErrors }, { status: 400 });
    }

    const { room_number, patient_name, status, products } = result.data;

    // 1️Fetch the existing order and its items
    const existingOrder = await db.orderRequest.findUnique({
      where: { id: orderId },
      include: {
        items: {
          include: {
            product: {
              include: { batches: true },
            },
          },
        },
      },
    });

    if (!existingOrder) {
      return NextResponse.json({ message: "Order not found" }, { status: 404 });
    }

    // Adjust stock if status = for_payment
    if (status === "for_payment" || status === "paid") {
      for (const oldItem of existingOrder.items) {
        const productName = oldItem.product.product_name;
        const matchingNewItem = products.find(
          (p) => p.productId === productName
        );

        const latestBatch = await db.productBatch.findFirst({
          where: {
            productId: oldItem.product.id,
            type: "ACTIVE",
          },
          orderBy: {
            releaseDate: "desc",
          },
        });

        if (!latestBatch) continue;

        // Product removed → restore all
        if (!matchingNewItem) {
          await db.productBatch.update({
            where: { id: latestBatch.id },
            data: { quantity: { increment: oldItem.quantity } },
          });
        } else if (matchingNewItem.quantity !== oldItem.quantity) {
          const diff = matchingNewItem.quantity - oldItem.quantity;

          if (diff > 0) {
            // Increased → deduct stock
            await db.productBatch.update({
              where: { id: latestBatch.id },
              data: { quantity: { decrement: diff } },
            });
          } else if (diff < 0) {
            // Decreased → add back stock
            await db.productBatch.update({
              where: { id: latestBatch.id },
              data: { quantity: { increment: Math.abs(diff) } },
            });
          }
        }
      }

      // Check if new products were added
      for (const newItem of products) {
        const existing = existingOrder.items.find(
          (item) => item.product.product_name === newItem.productId
        );
        if (!existing) {
          const product = await db.product.findUnique({
            where: { product_name: newItem.productId },
            include: { batches: true },
          });

          if (!product) continue;

          const latestBatch = await db.productBatch.findFirst({
            where: { productId: product.id, type: "ACTIVE" },
            orderBy: { releaseDate: "desc" },
          });

          if (latestBatch) {
            await db.productBatch.update({
              where: { id: latestBatch.id },
              data: { quantity: { decrement: newItem.quantity } },
            });
          }
        }
      }
    }

    const updatedOrder = await db.orderRequest.update({
      where: { id: orderId },
      data: {
        room_number,
        patient_name,
        ...(status && { status }),
        items: {
          deleteMany: {},
          create: products.map((product) => ({
            quantity: product.quantity,
            product: {
              connect: { product_name: product.productId },
            },
          })),
        },
      },
      include: {
        items: { include: { product: true } },
      },
    });

    // Log the edit
    await db.auditLog.create({
      data: {
        userId: session.user.id,
        action: "Edited",
        entityType: "OrderRequest",
        entityId: updatedOrder.id,
        description: `User ${session.user.username} (${session.user.role}) edited an order for patient "${patient_name}" in room ${room_number}.`,
      },
    });

    return NextResponse.json({ success: true, orderId: updatedOrder.id });
  } catch (error) {
    console.error("Error in PATCH /api/request_order/[id]/update:", error);
    return NextResponse.json(
      { message: "Failed to update request order", error: String(error) },
      { status: 500 }
    );
  }
}
