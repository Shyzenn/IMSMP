import { db } from "@/lib/db";
import { NextResponse } from "next/server";
import { auth } from "@/auth";

import { editMedTechRequestSchema } from "@/lib/types";
import { NotificationType } from "@prisma/client";
import { pusherServer } from "@/lib/pusher/server";

export async function PATCH(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();

    if (!session || !session.user?.id) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const result = editMedTechRequestSchema.safeParse(body);
    const { id } = await context.params;
    const requestId = parseInt(id.replace(/^ORD-/, ""), 10);

    if (!result.success) {
      const zodErrors: Record<string, string> = {};
      result.error.issues.forEach((issue) => {
        const field = issue.path.join(".");
        zodErrors[field] = issue.message;
      });
      return NextResponse.json({ errors: zodErrors }, { status: 400 });
    }

    const { products, notes, remarks } = result.data;

    // Fetch the existing request and its items
    const existingRequest = await db.medTechRequest.findUnique({
      where: { id: requestId },
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

    if (!existingRequest) {
      return NextResponse.json(
        { message: "Request not found" },
        { status: 404 }
      );
    }

    // Adjust stock if remarks === released
    if (remarks === "released") {
      for (const oldItem of existingRequest.items) {
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
            manufactureDate: "desc",
          },
        });

        if (!latestBatch) continue;

        // Product removed → restore all
        if (!matchingNewItem) {
          await db.productBatch.update({
            where: { id: latestBatch.id },
            data: { quantity: { increment: Number(oldItem.quantityOrdered) } },
          });
        } else if (
          matchingNewItem.quantity !== Number(oldItem.quantityOrdered)
        ) {
          const diff =
            matchingNewItem.quantity - Number(oldItem.quantityOrdered);

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
        const existing = existingRequest.items.find(
          (item) => item.product.product_name === newItem.productId
        );
        if (!existing) {
          const product = await db.product.findUnique({
            where: { id: Number(newItem.productId) },
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
              data: { quantity: { decrement: newItem.quantity } },
            });
          }
        }
      }
    }

    const updatedOrder = await db.medTechRequest.update({
      where: { id: requestId },
      data: {
        notes,
        status: "pending_for_approval",
        remarks: "processing",
        items: {
          deleteMany: {},
          create: products.map((product) => ({
            quantityOrdered: product.quantity,
            totalPrice: 2,
            product: {
              connect: { id: Number(product.productId) },
            },
          })),
        },
      },
      include: {
        items: { include: { product: true } },
      },
    });

    await db.auditLog.create({
      data: {
        userId: session.user.id,
        action: "Requested",
        entityType: "MedTechRequest",
        entityId: updatedOrder.id,
        description: `User ${session.user.username} (${session.user.role}) created a request with ${products.length} item(s).`,
      },
    });

    // Send notification to all Managers
    const managers = await db.user.findMany({
      where: { role: "Manager" },
    });

    for (const manager of managers) {
      const notification = await db.notification.create({
        data: {
          title: "MedTech edited the request",
          type: NotificationType.MEDTECH_REQUEST_EDIT,
          senderId: session.user.id,
          recipientId: manager.id,
          medTechRequestId: updatedOrder.id,
          submittedBy: session.user.username,
          role: session.user.role,
        },
        include: { sender: true },
      });

      await pusherServer.trigger(
        `private-user-${manager.id}`,
        "new-notification",
        {
          id: notification.id,
          title: notification.title,
          createdAt: notification.createdAt,
          type: notification.type,
          notes: updatedOrder.notes || "",
          read: false,
          sender: {
            username: notification.sender.username,
            role: notification.sender.role,
          },
          submittedBy: notification.submittedBy,
          role: notification.role,
          medTechRequestId: updatedOrder.id,
          order: {
            id: updatedOrder.id,
            products: updatedOrder.items.map((item) => ({
              productName: item.product.product_name,
              quantity: item.quantityOrdered,
            })),
          },
        }
      );
    }

    console.log("MedTech request successfully updated:", updatedOrder);

    return NextResponse.json({ success: true, orderId: updatedOrder.id });
  } catch (error) {
    if (error instanceof Error) {
      console.error(
        "Error in POST /api/medtech_request/[id]/update:",
        error.message
      );
      return NextResponse.json(
        { message: "Failed to create request order", error: error.message },
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
