import { auth } from "@/auth";
import { db } from "@/lib/db";
import { NotificationType, Prisma } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";
import { pusherServer } from "@/lib/pusher/server";

type RefundItem = {
  productName: string;
  quantity: number;
  price?: number;
};

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

  const { status, reason, items, patient_name, room_number } = await req.json();
  
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
      dataToUpdate.refundedBy = { connect: { id: userId } };
      dataToUpdate.refundReason = reason || "No reason provided";
    }

    const updatedOrder = await db.orderRequest.update({
      where: { id: numericId },
      data: dataToUpdate,
      include: {
        user: true,
        receivedBy: true,
        processedBy: true,
        refundedBy: true,
        items: { include: { product: true } },
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

    // Handle refund - restore inventory based on refund items
    if (status === "refunded") {
      // Filter items - only process items with quantity > 0
      const refundItems: RefundItem[] = (items || []).filter(
        (item: RefundItem) => item.quantity > 0
      );

      if (refundItems.length === 0) {
        return NextResponse.json(
          { message: "No items to refund" },
          { status: 400 }
        );
      }


      let totalRefundAmount = 0;

      for (const refundItem of refundItems) {
        console.log(
          `Processing refund: ${refundItem.quantity} units of ${refundItem.productName}`
        );

        // Find matching order item
        const matchingItem = updatedOrder.items.find(
          (item) => item.product.product_name === refundItem.productName
        );

        if (!matchingItem) {
          console.warn(`Product ${refundItem.productName} not found in order`);
          continue;
        }

        // Validate refund quantity doesn't exceed original quantity
        if (refundItem.quantity > matchingItem.quantity) {
          console.warn(
            `Refund quantity (${refundItem.quantity}) exceeds original quantity (${matchingItem.quantity}) for ${refundItem.productName}`
          );
          continue;
        }

        // Calculate refund amount for this item
        const itemRefundAmount =
          refundItem.quantity * Number(matchingItem.product.price);
        totalRefundAmount += itemRefundAmount;

        console.log(`Item refund amount: ${itemRefundAmount}`);

        // Update the order item with refunded quantity
        await db.orderItem.update({
          where: { id: matchingItem.id },
          data: {
            refundedQuantity: { increment: refundItem.quantity },
          },
        });

        let remainingQty = refundItem.quantity;

        // Get batches that were deducted (prioritize recently updated batches)
        const batches = await db.productBatch.findMany({
          where: {
            productId: matchingItem.productId,
            type: "ACTIVE",
          },
          orderBy: { updatedAt: "desc" },
        });

        console.log(
          `Found ${batches.length} batches for product ${matchingItem.productId}`
        );

        // If batches exist, increment their quantity
        if (batches.length > 0) {
          const targetBatch = batches[0];

          await db.productBatch.update({
            where: { id: targetBatch.id },
            data: { quantity: { increment: remainingQty } },
          });

          console.log(`Added ${remainingQty} units to batch ${targetBatch.id}`);
          remainingQty = 0;
        }

        // If no existing batches, create a new batch
        if (remainingQty > 0) {
          const newBatch = await db.productBatch.create({
            data: {
              productId: matchingItem.productId,
              batchNumber: `REFUND-ORD-${updatedOrder.id}-${matchingItem.id}`,
              quantity: remainingQty,
              releaseDate: new Date(),
              expiryDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year
              type: "ACTIVE",
            },
          });

          console.log(
            `Created new batch ${newBatch.id} with ${remainingQty} units`
          );
        }
      }

      console.log(`Total refund amount: ${totalRefundAmount}`);

      // Check if all items are fully refunded
      const orderWithItems = await db.orderRequest.findUnique({
        where: { id: numericId },
        include: { items: true },
      });

      const allItemsRefunded = orderWithItems?.items.every(
        (item) => item.refundedQuantity >= item.quantity
      );

      // Update order status based on refund completeness
      if (!allItemsRefunded) {
        await db.orderRequest.update({
          where: { id: numericId },
          data: {
            status: "paid", // Keep as paid if partial refund
          },
        });
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
          `private-user-${updatedOrder.userId}`,
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
                    patient_name: updatedOrder.patient_name ?? "",  
                    room_number: updatedOrder.room_number ?? "",   
                    products: orderWithItems?.items.map((item) => ({
                      productName: item.product.product_name,
                      quantity: item.quantity,
                      price: item.product.price
                    })) || [],
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
          orderType: updatedOrder.type,
          createdAt: notification.createdAt,
          type: notification.type,
          notes: updatedOrder.notes || "",
          read: false,
          sender: {
            username: notification.sender.username,
            role: notification.sender.role,
          },
         order: {
          id: updatedOrder.id,
          patient_name: patient_name,
          room_number: room_number,
          products: orderWithItems?.items.map((item) => ({
            productName: item.product.product_name,
            quantity: item.quantity,
            price: item.product.price
          })), 
        },
        }
      );
      }
    }

    if (
      updatedOrder.userId &&
      updatedOrder.userId !== userId &&
      status !== "refunded"
    ) {
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
            orderType: updatedOrder.type,
            createdAt: notification.createdAt,
            type: notification.type,
            notes: updatedOrder.notes || "",
            submittedBy: notification.submittedBy,
            role: notification.role,
            patientName: updatedOrder.patient_name ?? "",
            roomNumber: updatedOrder.room_number ?? "",
            read: false,
            sender: {
              username: notification.sender.username,
              role: notification.sender.role,
            },
           order: {
              id: updatedOrder.id,
              patient_name: updatedOrder.patient_name ?? "",
              room_number: updatedOrder.room_number ?? "",
              products: orderWithItems?.items.map((item) => ({
                productName: item.product.product_name,
                quantity: item.quantity,
                price: item.product.price
              })) || [],
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
      (item) => item.refundedQuantity >= item.quantity
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