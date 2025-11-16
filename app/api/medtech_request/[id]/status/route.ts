import { auth } from "@/auth";
import { db } from "@/lib/db";
import { pusherServer } from "@/lib/pusher/server";
import { NotificationType } from "@prisma/client";
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

    const { id } = await context.params;
    const userId = session.user.id;

    const numericId = parseInt(id.replace("REQ-", ""));
    if (!numericId) {
      return NextResponse.json({ message: "Invalid ID" }, { status: 400 });
    }

    const { status } = await req.json();
    const validRemarks = ["approved", "declined"] as const;

    if (!validRemarks.includes(status)) {
      return NextResponse.json({ error: "Invalid remarks" }, { status: 400 });
    }

    // Update order
    const updatedOrder = await db.medTechRequest.update({
      where: { id: numericId },
      data: {
        status,
        approvedById: status === "approved" ? userId : null,
      },
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

    const notifTitle =
      status === "approved"
        ? "MedTech Request Approved"
        : "MedTech Request Declined";

    const notifType =
      status === "approved"
        ? NotificationType.MT_REQUEST_APPROVED
        : NotificationType.MT_REQUEST_DECLINED;

    const recipients = await db.user.findMany({
      where: {
        role: { in: ["Pharmacist_Staff", "MedTech"] },
      },
    });

    for (const user of recipients) {
      const notification = await db.notification.create({
        data: {
          title: notifTitle,
          senderId: userId,
          recipientId: user.id,
          medTechRequestId: updatedOrder.id,
          type: notifType,
          submittedBy: session.user.username ?? "",
          role: session.user.role ?? "",
        },
        include: { sender: true },
      });

     await pusherServer.trigger(`private-user-${user.id}`, "new-notification", {
          id: notification.id,
          title: notification.title,
          createdAt: notification.createdAt,
          type: notification.type,
          notes: orderWithItems?.notes || "",
          sender: { username: notification.sender.username, role: notification.sender.role },
          medTechRequestId: updatedOrder.id,
          submittedBy: notification.submittedBy,
           role: notification.role,
          order: {
            id: updatedOrder.id,
            products: orderWithItems?.items.map((item) => ({
              productName: item.product.product_name,
              quantity: item.quantity,
            })) || [],
          },
        });
    }

    await db.auditLog.create({
      data: {
        userId,
        action: "MedTech Remarks Update",
        entityType: "MedTechRequest",
        entityId: updatedOrder.id,
        description: `Request ${updatedOrder.id} status as ${status.toUpperCase()} by ${session.user.username}`,
      },
    });

    return NextResponse.json({
      success: true,
      message: `Request status as ${status}`,
      data: updatedOrder,
    });
  } catch (error) {
    console.error("Error updating remarks:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
