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
      return NextResponse.json(
        { message: "Invalid order ID" },
        { status: 400 }
      );
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

    const { roomNumber, patientName, status, products, notes, contactNumber } =
      result.data;

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

    const updatedOrder = await db.$transaction(async (tx) => {
      // Adjust stock if status = for_payment
      if (status === "for_payment" || status === "paid") {
        for (const oldItem of existingOrder.items) {
          const matchingNewItem = products.find(
            (p) => p.productId === oldItem.product.id
          );

          const latestBatch = await db.productBatch.findFirst({
            where: {
              productId: oldItem.product.id,
              type: "ACTIVE",
            },
            orderBy: {
              manufactureDate: "desc",
            },
          });

          if (!latestBatch) continue;

          // Product removed → restore all
          if (!matchingNewItem) {
            await db.productBatch.update({
              where: { id: latestBatch.id },
              data: {
                quantity: { increment: oldItem.quantityOrdered.toNumber() },
              },
            });
          } else if (
            matchingNewItem.quantityOrdered !==
            oldItem.quantityOrdered.toNumber()
          ) {
            const diff =
              matchingNewItem.quantityOrdered -
              oldItem.quantityOrdered.toNumber();

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
            (item) => item.product.id === newItem.productId
          );
          if (!existing) {
            const product = await db.product.findUnique({
              where: { id: newItem.productId },
              include: { batches: true },
            });

            if (!product) continue;

            const latestBatch = await db.productBatch.findFirst({
              where: { productId: product.id, type: "ACTIVE" },
              orderBy: { manufactureDate: "desc" },
            });

            if (latestBatch) {
              await db.productBatch.update({
                where: { id: latestBatch.id },
                data: { quantity: { decrement: newItem.quantityOrdered } },
              });
            }
          }
        }
      }
      // 1. update patient name
      let patient = await tx.patient.findUnique({
        where: { id: existingOrder.patientId },
      });

      if (!patient) {
        // Create new patient
        patient = await tx.patient.create({
          data: {
            patientName: patientName.trim(),
            roomNumber: roomNumber ?? null,
            contactNumber: contactNumber,
          },
        });
      } else {
        // Update patient room number & name
        patient = await tx.patient.update({
          where: { id: patient.id },
          data: {
            patientName: patientName.trim(),
            roomNumber: roomNumber ?? null,
            contactNumber: contactNumber,
          },
        });
      }

      let totalAmount = 0;

      for (const p of products) {
        const product = await tx.product.findUnique({
          where: { id: p.productId },
          select: { price: true },
        });

        if (!product || product.price == null) {
          throw new Error("Product price not found");
        }

        totalAmount += Number(product.price) * p.quantityOrdered;
      }

      // 2. Create order
      return await tx.orderRequest.update({
        where: { id: orderId },
        data: {
          status,
          patientId: patient.id,
          totalAmount,
          notes,
          items: {
            deleteMany: {},
            create: await Promise.all(
              products.map(async (p) => {
                const product = await tx.product.findUnique({
                  where: { id: p.productId },
                  select: { price: true },
                });

                if (!product || product.price == null) {
                  throw new Error("Product price not found");
                }

                const price = product.price;
                const totalPrice = Number(price) * p.quantityOrdered;

                return {
                  refundedQuantity: 0,
                  quantityOrdered: p.quantityOrdered,
                  price,
                  totalPrice,
                  product: { connect: { id: p.productId } },
                };
              })
            ),
          },
        },
        include: {
          items: { include: { product: true } },
          patient: true,
        },
      });
    });

    // Log the edit
    await db.auditLog.create({
      data: {
        userId: session.user.id,
        action: "Edited",
        entityType: "OrderRequest",
        entityId: updatedOrder.id,
        description: `User ${session.user.username} (${
          session.user.role
        }) edited an order for patient "${patientName}" in room ${
          roomNumber || "N/A"
        }.`,
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
