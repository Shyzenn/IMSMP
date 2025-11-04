import { addRequestOrderSchema } from "@/lib/types";
import { db } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";
import  { capitalLetter } from "@/lib/utils";
import { auth } from "@/auth";
import { $Enums, NotificationType } from "@prisma/client";
import { pusherServer } from "@/lib/pusher/server";

export async function POST(req: Request) {
  try {
    const session = await auth();

    if (!session || !session.user?.id) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 400 });
    }

    const userId = session.user.id;
    const body = await req.json();
    const result = addRequestOrderSchema.safeParse(body);

    if (!result.success) {
      const zodErrors: Record<string, string> = {};
      result.error.issues.forEach((issue) => {
        const field = issue.path.join(".");
        zodErrors[field] = issue.message;
      });
      return NextResponse.json({ errors: zodErrors }, { status: 400 });
    }

    const { room_number, patient_name, status, products, type, notes, remarks } = result.data;

    const newOrder = await db.orderRequest.create({
      data: {
        room_number,
        patient_name,
        status,
        userId,
        type,
        remarks,
        notes,
        items: {
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

    if (type === "EMERGENCY") {
      const today = new Date();

      for (const item of newOrder.items) {
        const dbProduct = await db.product.findUnique({
          where: { id: item.product.id },
          include: {
            batches: {
              where: {
                expiryDate: { gte: today },
                quantity: { gt: 0 },
              },
              orderBy: { expiryDate: "asc" },
            },
          },
        });

        if (!dbProduct) continue;

        let remainingQty = item.quantity;

        for (const batch of dbProduct.batches) {
          if (remainingQty <= 0) break;

          const deduction = Math.min(batch.quantity, remainingQty);

          await db.productBatch.update({
            where: { id: batch.id },
            data: { quantity: batch.quantity - deduction },
          });

          remainingQty -= deduction;
        }

        if (remainingQty > 0) {
          console.warn(`⚠️ Not enough stock for ${dbProduct.product_name}`);
        }
      }
    }

    // Send notification to the Pharmacist Staff
    const pharmacists = await db.user.findMany({
      where: { role: "Pharmacist_Staff" }
    });

    const notificationData = newOrder.type === "EMERGENCY" 
      ? {
          title: "Pay Later Order Request!",
          type: NotificationType.EMERGENCY_ORDER,
        }
      : {
          title: "New order request",
          type: NotificationType.ORDER_REQUEST,
        };

    for (const pharmacist of pharmacists) {
      const notification = await db.notification.create({
        data: {
          title: notificationData.title,
          type: notificationData.type,
          senderId: session.user.id,
          recipientId: pharmacist.id,
          orderId: newOrder.id,
          patientName: patient_name,
          roomNumber: room_number,
          submittedBy: session.user.username,
          role: session.user.role,
        },
        include: { sender: true },
      });

      await pusherServer.trigger(
        `private-user-${pharmacist.id}`,
        "new-notification",
        {
          id: notification.id,
          title: notification.title,
          orderType: newOrder.type,
          createdAt: notification.createdAt,
          type: notification.type,
          notes: newOrder.notes || "",
          read: false,
          sender: {
            username: notification.sender.username,
            role: notification.sender.role,
          },
         order: {
          id: newOrder.id,
          patient_name: patient_name,
          room_number: room_number,
          products: newOrder.items.map((item) => ({
            productName: item.product.product_name,
            quantity: item.quantity,
            price: item.product.price
          })), 
        },
        }
      );
    }
    
    await db.auditLog.create({
      data: {
        userId: session.user.id,
        action: "Requested",
        entityType: "OrderRequest",
        entityId: newOrder.id,
        description: `User ${session.user.username} (${session.user.role}) created an order (${type === "EMERGENCY" ? "Pay Later" : "Regular"}) for patient "${patient_name}" in room ${room_number} with ${products.length} item(s).`,
      },
    });

    console.log("Order and notifications successfully created:", newOrder);

    return NextResponse.json({ success: true, orderId: newOrder.id });
  } catch (error) {
    if (error instanceof Error) {
      console.error("Error in POST /api/request_order:", error.message);
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

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "5", 10);
    const filter = searchParams.get("filter") || "all";
    const validStatuses: $Enums.Status[] = ["pending", "for_payment", "paid", "canceled", "refunded"];
    const whereClause = {
        isArchived: false, 
        ...(validStatuses.includes(filter.toLowerCase() as $Enums.Status)
          ? { status: filter.toLowerCase() as $Enums.Status }
          : {}),
      };

    const [orders, total] = await Promise.all([
      db.orderRequest.findMany({
        where: whereClause,
        include: {
          items: { include: { product: true } },
          user: true,
          receivedBy: true,
          processedBy: true,
        },
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
      db.orderRequest.count({ where: whereClause }),
    ]);

    const formattedOrders = orders.map((order) => {
      const totalItems = order.items.reduce((sum, item) => sum + item.quantity, 0);

      return {
        id: order.id,
        requestedBy: order.user?.username
          ? capitalLetter(order.user.username)
          : "Unknown",
        receivedBy: order.receivedBy?.username
          ? capitalLetter(order.receivedBy.username)
          : "Unknown",
        processedBy: order.processedBy?.username
          ? capitalLetter(order.processedBy.username)
          : "Unknown",
        patient_name: order.patient_name
          ? capitalLetter(order.patient_name)
          : "Unknown",
        room_number: order.room_number,
        createdAt: order.createdAt,
        status: order.status,
        remarks: order.remarks,
        type: order.type,
        notes: order.notes,
        items: `${totalItems} item${totalItems !== 1 ? "s" : ""}`,
        itemDetails: order.items.map((item) => ({
          productName: item.product.product_name,
          quantity: item.quantity,
          price: item.product.price,
        })),
      };
    });

    return NextResponse.json({
      data: formattedOrders,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    console.error("Error fetching order requests:", error);
    return NextResponse.json(
      {
        message: "Failed to fetch order requests",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

