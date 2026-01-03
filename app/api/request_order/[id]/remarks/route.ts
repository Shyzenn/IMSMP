import { auth } from "@/auth";
import { db } from "@/lib/db";
import { pusherServer } from "@/lib/pusher/server";
import { NotificationType, Prisma } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";

export async function PUT(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session || !session.user?.id) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }
    const userId = session.user.id;

    const { id } = await context.params;
    const numericId = parseInt(id.replace("ORD-", ""));
    if (!numericId) {
      return NextResponse.json({ message: "Invalid ID" }, { status: 400 });
    }

    const { remarks } = await req.json();
    const validRemarks = ["preparing", "prepared", "dispensed"] as const;

    if (!validRemarks.includes(remarks)) {
      return NextResponse.json({ error: "Invalid remarks" }, { status: 400 });
    }

    const updateData: Prisma.OrderRequestUpdateInput = { remarks };

    if (remarks === "prepared") {
      updateData.preparedAt = new Date();
      updateData.preparedBy = { connect: { id: userId } };
    }

    if (remarks === "dispensed") {
      updateData.dispensedAt = new Date();
      updateData.dispensedBy = { connect: { id: userId } };
    }

    const updatedOrder = await db.orderRequest.update({
      where: { id: numericId },
      data: updateData,
      include: {
        user: true,
        preparedBy: true,
        dispensedBy: true,
        patient: {
          select: {
            patientName: true,
            roomNumber: true,
          },
        },
        items: {
          include: {
            product: true,
          },
        },
      },
    });

    const orderWithItems = await db.orderRequest.findUnique({
      where: { id: numericId },
      include: {
        items: {
          include: {
            product: true,
          },
        },
      },
    });

    // Adjust inventory only when moving to "dispensed"
    if (remarks === "dispensed") {
      for (const item of orderWithItems?.items ?? []) {
        let remainingQty = item.quantityOrdered.toNumber();
        const today = new Date();

        const batches = await db.productBatch.findMany({
          where: {
            productId: item.productId,
            quantity: { gt: 0 },
            expiryDate: { gte: today },
          },
          orderBy: { expiryDate: "asc" },
        });

        for (const batch of batches) {
          if (remainingQty <= 0) break;

          const decrementQty = Math.min(batch.quantity, remainingQty);

          await db.productBatch.update({
            where: { id: batch.id },
            data: { quantity: { decrement: decrementQty } },
          });

          remainingQty -= decrementQty;
        }

        if (remainingQty > 0) {
          console.warn(`Not enough stock for order item ${item.id}`);
        }
      }
    }

    if (remarks === "prepared") {
      const nurses = await db.user.findMany({
        where: { role: "Nurse" },
      });

      for (const nurse of nurses) {
        const notification = await db.notification.create({
          data: {
            title: "Order Prepared",
            senderId: session.user.id,
            recipientId: nurse.id,
            orderId: updatedOrder.id,
            type: NotificationType.REMARKS,
            patientName: updatedOrder.patient.patientName ?? "",
            roomNumber: updatedOrder.patient.roomNumber?.toString() ?? "",
            submittedBy: session.user.username ?? "",
            role: session.user.role ?? "",
          },
          include: { sender: true },
        });

        await pusherServer.trigger(
          `private-user-${nurse.id}`,
          "new-notification",
          {
            id: notification.id,
            title: notification.title,
            orderType: updatedOrder.type,
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
            patientName: notification.patientName,
            roomNumber: notification.roomNumber,
            order: {
              id: updatedOrder.id,
              patientName: updatedOrder.patient.patientName ?? "",
              roomNumber: updatedOrder.patient.roomNumber?.toString() ?? "",
              products: updatedOrder.items.map((item) => ({
                productName: item.product.product_name,
              })),
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
        entityId: updatedOrder.id,
        description: `Order ${
          updatedOrder.id
        } marked as ${remarks.toUpperCase()} by ${session.user.username}`,
      },
    });

    return NextResponse.json({
      success: true,
      message: `Order marked as ${remarks}`,
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
