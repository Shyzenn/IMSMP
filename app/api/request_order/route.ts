import { addRequestOrderSchema } from "@/lib/types";
import { db } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";
import { toTitleCase } from "@/lib/utils";
import { auth } from "@/auth";
import { $Enums, NotificationType } from "@prisma/client";
import { pusherServer } from "@/lib/pusher/server";

export async function POST(req: Request) {
  try {
    const session = await auth();

    if (!session || !session.user?.id) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
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

    const {
      roomNumber,
      patientName,
      status,
      products,
      type,
      notes,
      remarks,
      contactNumber,
    } = result.data;

    const patientNameNormalized = toTitleCase(patientName.trim());

    const newOrder = await db.$transaction(async (tx) => {
      // 1. Find or create patient
      let patient = await tx.patient.findFirst({
        where: {
          patientName: {
            equals: patientNameNormalized,
          },
        },
      });

      if (!patient) {
        patient = await tx.patient.create({
          data: {
            patientName: patientNameNormalized,
            roomNumber: roomNumber ?? null,
            contactNumber: contactNumber ?? null,
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
      return await tx.orderRequest.create({
        data: {
          status,
          userId,
          type,
          remarks,
          totalAmount,
          notes,
          patientId: patient.id,
          items: {
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

        let remainingQty = item.quantityOrdered.toNumber();

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
      where: { role: "Pharmacist_Staff" },
    });

    const notificationData =
      newOrder.type === "EMERGENCY"
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
          senderId: session.user.id,
          recipientId: pharmacist.id,
          orderId: newOrder.id,
          type: notificationData.type,
          patientName: newOrder.patient.patientName ?? "",
          roomNumber: newOrder.patient.roomNumber?.toString() ?? "",
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
          orderType: newOrder.type,
          createdAt: notification.createdAt,
          type: notification.type,
          notes: newOrder.notes || "",
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
            id: newOrder.id,
            patientName: newOrder.patient.patientName ?? "",
            roomNumber: newOrder.patient.roomNumber?.toString() ?? "",
            products: newOrder.items.map((item) => ({
              productName: item.product.product_name,
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
        description: `User ${session.user.username} (${
          session.user.role
        }) created an order (${
          type === "EMERGENCY" ? "Pay Later" : "Regular"
        }) for patient "${patientName}" in room ${roomNumber} with ${
          products.length
        } item(s).`,
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
  const session = await auth();

  if (!session || !session.user?.id) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "5", 10);
    const filter = searchParams.get("filter") || "all";
    const validStatuses: $Enums.Status[] = [
      "pending",
      "for_payment",
      "paid",
      "canceled",
      "refunded",
    ];
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
          preparedBy: true,
          dispensedBy: true,
          patient: true,
          payments: {
            include: {
              processedBy: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
      db.orderRequest.count({ where: whereClause }),
    ]);

    const formattedOrders = orders.map((order) => {
      return {
        id: order.id,
        requestedBy: order.user?.username
          ? toTitleCase(order.user.username)
          : "Unknown",
        receivedBy: order.receivedBy?.username
          ? toTitleCase(order.receivedBy.username)
          : "Unknown",
        preparedBy: order.preparedBy?.username
          ? toTitleCase(order.preparedBy.username)
          : "Unknown",
        dispensedBy: order.dispensedBy?.username
          ? toTitleCase(order.dispensedBy.username)
          : "Unknown",

        preparedAt: order.preparedAt,
        dispensedAt: order.dispensedAt,
        receivedAt: order.receivedAt,
        patientName: order.patient.patientName,

        paymentDetails: order.payments.map((payment) => ({
          processedBy: { username: payment.processedBy.username },
          processedAt: payment.createdAt,
          amountDue: Number(payment.amountDue),
          discountAmount: Number(payment.discountAmount),
          discountType: payment.discountType,
          discountPercent: Number(payment.discountPercent),
        })),

        patientDetails: {
          patientName: order.patient.patientName,
          roomNumber: order.patient.roomNumber ?? undefined,
          contactNumber: order.patient.contactNumber ?? undefined,
          patientNumber: order.patient.patientNumber ?? undefined,
        },

        archiveReason: order.archiveReason,
        createdAt: order.createdAt,
        status: order.status,
        remarks: order.remarks,
        type: order.type,
        notes: order.notes,
        products: order.items.length,

        itemDetails: order.items.map((item) => ({
          productName: item.product.product_name,
          quantityOrdered: item.quantityOrdered,
          price: item.product.price,
          dosageForm: item.product.dosageForm,
          strength: item.product.strength,
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
