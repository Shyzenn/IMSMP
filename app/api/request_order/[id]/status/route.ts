import { auth } from "@/auth";
import { db } from "@/lib/db";
import { NotificationType, Prisma } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";
import { pusherServer } from "@/lib/pusher/server";

export async function PUT(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
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

  const { status, reason } = await req.json();
  if (!status || !["for_payment", "paid", "canceled", "refunded"].includes(status)) {
    return NextResponse.json(
      { message: "Invalid or missing status" },
      { status: 400 }
    );
  }

  try {
    const dataToUpdate: Prisma.OrderRequestUpdateInput = { status };

    if (status === "for_payment") {
      dataToUpdate.receivedBy = { connect: { id: userId } };
      dataToUpdate.receivedAt = new Date();
    }

    if (status === "paid") {
      dataToUpdate.processedBy = { connect: { id: userId } };
      dataToUpdate.processedAt = new Date();
    }

    if (status === "refunded") {
      dataToUpdate.refundedAt = new Date();
      dataToUpdate.refundedBy = { connect: { id: userId } }
      dataToUpdate.refundReason = reason
    }

    const updatedOrder = await db.orderRequest.update({
      where: { id: numericId },
      data: dataToUpdate,
      include: {
        user: true,
        receivedBy: true,
        processedBy: true,
        items: { include: { product: true } },
      },
    });

    // Adjust inventory only when moving to "for_payment"
    if (status === "for_payment") {
      for (const item of updatedOrder.items) {
        let remainingQty = item.quantity;
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

    // Handle refund - restore inventory
    if (status === "refunded") {
      for (const item of updatedOrder.items) {
        let remainingQty = item.quantity;

        // Get batches that were deducted (prioritize recently updated batches)
        const batches = await db.productBatch.findMany({
          where: {
            productId: item.productId,
            type: "ACTIVE",
          },
          orderBy: { updatedAt: "desc" },
        });

        for (const batch of batches) {
          if (remainingQty <= 0) break;

          const incrementQty = remainingQty;

          await db.productBatch.update({
            where: { id: batch.id },
            data: { quantity: { increment: incrementQty } },
          });

          remainingQty -= incrementQty;
        }

        if (remainingQty > 0) {
          // If no existing batches, create a new batch for returned items
          await db.productBatch.create({
            data: {
              productId: item.productId,
              batchNumber: `REFUND-${updatedOrder.id}-${item.id}`,
              quantity: remainingQty,
              releaseDate: new Date(),
              expiryDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year
              type: "ACTIVE",
            },
          });
        }
      }

    }

    if (status === "paid") {
      const pharmacists = await db.user.findMany({
        where: { role: "Pharmacist_Staff" },
      });

      for (const pharmacist of pharmacists) {
        const notification = await db.notification.create({
          data: {
            title: "Payment processed",
            senderId: session.user.id,
            recipientId: pharmacist.id,
            orderId: updatedOrder.id,
            type: NotificationType.PAYMENT_PROCESSED,
            patientName: updatedOrder.patient_name ?? "",
            roomNumber: updatedOrder.room_number ?? "",
            submittedBy: session.user.username ?? "",
            role: session.user.role ?? "",
          },
          include: { sender: true },
        });

        await pusherServer.trigger(
          `private-user-${pharmacist.id}`,
          "new-notification",
          {
            id: notification.id,
            title: notification.title,
            createdAt: notification.createdAt,
            type: notification.type,
            sender: {
              username: notification.sender.username,
              role: notification.sender.role,
            },
            order: {
              patient_name: updatedOrder.patient_name,
              room_number: updatedOrder.room_number,
            },
          }
        );
      }
    }

    if (status === "for_payment") {
      const cashiers = await db.user.findMany({
        where: { role: "Cashier" },
      });

      for (const cashier of cashiers) {
        const notification = await db.notification.create({
          data: {
            title: "New order ready for payment",
            senderId: session.user.id,
            recipientId: cashier.id,
            orderId: updatedOrder.id,
            type: NotificationType.ORDER_RECEIVED,
            patientName: updatedOrder.patient_name ?? "",
            roomNumber: updatedOrder.room_number ?? "",
            submittedBy: session.user.username ?? "",
            role: session.user.role ?? "",
          },
          include: { sender: true },
        });

        await pusherServer.trigger(
          `private-user-${cashier.id}`,
          "new-notification",
          {
            id: notification.id,
            title: notification.title,
            createdAt: notification.createdAt,
            type: notification.type,
            sender: {
              username: notification.sender.username,
              role: notification.sender.role,
            },
            order: {
              patient_name: updatedOrder.patient_name,
              room_number: updatedOrder.room_number,
            },
          }
        );
      }
    }

    if (updatedOrder.userId && updatedOrder.userId !== userId && status !== "refunded") {
      let title = "";
      let notifType: NotificationType = NotificationType.ORDER_RECEIVED;

      if (status === "for_payment") {
        title = "Order received";
        notifType = NotificationType.ORDER_RECEIVED;
      }

      if (status === "paid") {
        title = "Payment processed";
        notifType = NotificationType.PAYMENT_PROCESSED;
      }

      if (title) {
        const notification = await db.notification.create({
          data: {
            title,
            senderId: session.user.id,
            recipientId: updatedOrder.userId,
            orderId: updatedOrder.id,
            type: notifType,
            patientName: updatedOrder.patient_name ?? "",
            roomNumber: updatedOrder.room_number ?? "",
            submittedBy: session.user.username ?? "",
            role: session.user.role ?? "",
          },
          include: { sender: true },
        });

        // Trigger Pusher event to recipient
        await pusherServer.trigger(
          `private-user-${updatedOrder.userId}`,
          "new-notification",
          {
            id: notification.id,
            title: notification.title,
            createdAt: notification.createdAt,
            type: notification.type,
            sender: {
              username: notification.sender.username,
              role: notification.sender.role,
            },
            order: {
              patient_name: updatedOrder.patient_name,
              room_number: updatedOrder.room_number,
            },
          }
        );
      }
    }

    await db.auditLog.create({
      data: {
        userId,
        action: status === "refunded" ? "Refund" : "Status Update",
        entityType: "OrderRequest",
        entityId: updatedOrder.id,
        description: `ORD-0${updatedOrder.id} marked as ${status.toUpperCase()} by ${session.user.username}`,
      },
    });

    return NextResponse.json({
      success: true,
      message: `Order marked as ${status}`,
      data: updatedOrder,
    });
  } catch (error) {
    console.error("Error updating status:", error);
    return NextResponse.json(
      { message: "Error updating status" },
      { status: 500 }
    );
  }
}