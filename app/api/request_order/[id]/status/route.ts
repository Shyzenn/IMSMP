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

  if (!status || !["for_payment", "canceled", "refunded"].includes(status)) {
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

    const updatedOrder = await db.orderRequest.update({
      where: { id: numericId },
      data: dataToUpdate,
      include: {
        user: true,
        receivedBy: true,
        items: { include: { product: true } },
        patient: {
          select: {
            patientName: true,
            roomNumber: true,
          },
        },
      },
    });

    if (status === "for_payment") {
      const cashiers = await db.user.findMany({
        where: { role: "Cashier" },
      });

      for (const cashier of cashiers) {
        const notification = await db.notification.create({
          data: {
            title: "Order Prepared",
            senderId: session.user.id,
            recipientId: cashier.id,
            orderId: updatedOrder.id,
            type: NotificationType.ORDER_RECEIVED,
            patientName: updatedOrder.patient.patientName ?? "",
            roomNumber: updatedOrder.patient.roomNumber?.toString() ?? "",
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

    // Get final order status for audit log
    const finalOrder = await db.orderRequest.findUnique({
      where: { id: numericId },
      include: { items: true },
    });

    const allItemsRefunded = finalOrder?.items.every(
      (item) =>
        item.refundedQuantity.toNumber() >= item.quantityOrdered.toNumber()
    );

    const auditDescription =
      status === "refunded"
        ? `ORD-0${updatedOrder.id} ${
            allItemsRefunded ? "fully" : "partially"
          } refunded by ${session.user.username}. Reason: ${
            reason || "No reason provided"
          }`
        : `ORD-0${updatedOrder.id} marked as ${status.toUpperCase()} by ${
            session.user.username
          }`;

    await db.auditLog.create({
      data: {
        userId,
        action: status === "refunded" ? "Refund" : "Status Update",
        entityType: "OrderRequest",
        entityId: updatedOrder.id,
        description: auditDescription,
      },
    });

    return NextResponse.json({
      success: true,
      message:
        status === "refunded"
          ? allItemsRefunded
            ? "Order fully refunded successfully"
            : "Partial refund successful"
          : `Order marked as ${status}`,
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
