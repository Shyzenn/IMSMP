import { auth } from "@/auth";
import { db } from "@/lib/db";
import { pusherServer } from "@/lib/pusher/server";
import { NotificationType } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";

type UpdateRemarksData = {
  remarks: "processing" | "ready" | "released";
  receivedById?: string;
  receivedAt?: Date;
  approvedById?: string;
  approvedAt?: Date;
};

export async function PUT(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id)
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    const userId = session.user.id;

    const { id } = await context.params;
    const numericId = parseInt(id.replace("REQ-", ""));
    if (!numericId)
      return NextResponse.json({ message: "Invalid ID" }, { status: 400 });

    const { remarks } = await req.json();
    const validRemarks = ["processing", "ready", "released"] as const;
    if (!validRemarks.includes(remarks))
      return NextResponse.json({ error: "Invalid remarks" }, { status: 400 });

    const updateData: UpdateRemarksData = { remarks };

    if (remarks === "ready") {
      updateData.receivedById = userId;
      updateData.receivedAt = new Date();
    }

    const updatedOrder = await db.medTechRequest.update({
      where: { id: numericId },
      data: updateData,
    });

    const orderWithItems = await db.medTechRequest.findUnique({
      where: { id: numericId },
      include: {
        items: {
          include: {
            product: true,
          },
        },
      },
    });

    // Decrement stock if released
    if (remarks === "released") {
      const requestItems = await db.medTechRequestItem.findMany({
        where: { medTechRequestId: numericId },
        include: { product: true },
      });

      for (const item of requestItems) {
        let remainingQty = Number(item.quantityOrdered);

        const batches = await db.productBatch.findMany({
          where: {
            productId: item.productId,
            quantity: { gt: 0 },
            type: "ACTIVE",
          },
          orderBy: { expiryDate: "asc" },
        });

        for (const batch of batches) {
          if (remainingQty <= 0) break;
          const deduct = Math.min(batch.quantity, remainingQty);
          await db.productBatch.update({
            where: { id: batch.id },
            data: { quantity: { decrement: deduct } },
          });
          remainingQty -= deduct;
        }

        if (remainingQty > 0)
          throw new Error(
            `Insufficient stock for product ${item.product.product_name}`
          );
      }
    }

    // Notify MedTech users if ready
    if (remarks === "ready") {
      const medTechs = await db.user.findMany({ where: { role: "MedTech" } });

      for (const medTech of medTechs) {
        const notification = await db.notification.create({
          data: {
            title: "Request is ready to pick up",
            senderId: userId,
            recipientId: medTech.id,
            medTechRequestId: updatedOrder.id,
            type: NotificationType.MT_REQUEST_READY,
            submittedBy: session.user.username ?? "",
            role: session.user.role ?? "",
          },
          include: { sender: true },
        });

        await pusherServer.trigger(
          `private-user-${medTech.id}`,
          "new-notification",
          {
            id: notification.id,
            title: notification.title,
            createdAt: notification.createdAt,
            type: notification.type,
            notes: orderWithItems?.notes || "",
            sender: {
              username: notification.sender.username,
              role: notification.sender.role,
            },
            medTechRequestId: updatedOrder.id,
            submittedBy: notification.submittedBy,
            role: notification.role,
            order: {
              id: updatedOrder.id,
              products:
                orderWithItems?.items.map((item) => ({
                  productName: item.product.product_name,
                  quantity: item.quantityOrdered,
                })) || [],
            },
          }
        );
      }
    }

    if (remarks === "released") {
      const managers = await db.user.findMany({ where: { role: "Manager" } });

      for (const manager of managers) {
        const notification = await db.notification.create({
          data: {
            title: "Request has been released",
            senderId: userId,
            recipientId: manager.id,
            medTechRequestId: updatedOrder.id,
            type: NotificationType.MT_REQUEST_RELEASED,
            submittedBy: session.user.username ?? "",
            role: session.user.role ?? "",
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
            notes: orderWithItems?.notes || "",
            sender: {
              username: notification.sender.username,
              role: notification.sender.role,
            },
            medTechRequestId: updatedOrder.id,
            submittedBy: notification.submittedBy,
            role: notification.role,
            order: {
              id: updatedOrder.id,
              products:
                orderWithItems?.items.map((item) => ({
                  productName: item.product.product_name,
                  quantity: item.quantityOrdered,
                })) || [],
            },
          }
        );
      }
    }

    await db.auditLog.create({
      data: {
        userId,
        action: "Remarks Update",
        entityType: "OrderRequest",
        entityId: numericId,
        description: `Request ${numericId} marked as ${remarks.toUpperCase()} by ${
          session.user.username
        }`,
      },
    });

    return NextResponse.json({
      success: true,
      message: `Request marked as ${remarks}`,
      data: updatedOrder,
    });
  } catch (error) {
    console.error("Error updating remarks:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
