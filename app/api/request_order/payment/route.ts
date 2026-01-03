import { auth } from "@/auth";
import { db } from "@/lib/db";
import { pusherServer } from "@/lib/pusher/server";
import { NextResponse } from "next/server";
import { NotificationType, Prisma } from "@prisma/client";

export async function POST(req: Request) {
  const session = await auth();
  if (!session || !session.user?.id) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    const {
      amountPaid,
      orderIds,
      payableItems,
      discountAmount,
      discountPercent,
    } = await req.json();

    if (!Array.isArray(orderIds) || orderIds.length === 0) {
      return NextResponse.json(
        { message: "Order must be a non-empty array" },
        { status: 400 }
      );
    }

    if (typeof amountPaid !== "number") {
      return NextResponse.json(
        { message: "Total Paid must be a number" },
        { status: 400 }
      );
    }

    if (!Array.isArray(payableItems) || payableItems.length === 0) {
      return NextResponse.json(
        { message: "Order must be for payment" },
        { status: 400 }
      );
    }

    const result = await db.$transaction(
      async (tx: Prisma.TransactionClient) => {
        // Update all selected orders to 'paid'
        const updatedOrders = await Promise.all(
          orderIds.map((id) =>
            tx.orderRequest.update({
              where: { id },
              data: { status: "paid" },
              include: {
                user: true,
                patient: { select: { patientName: true, roomNumber: true } },
                items: {
                  include: { product: { select: { product_name: true } } },
                },
              },
            })
          )
        );

        // Total amount of all selected orders
        const totalOrdersAmount = updatedOrders.reduce(
          (sum, order) => sum + Number(order.totalAmount),
          0
        );

        // Determine if VAT exempt based on discount type
        const isVatExempt = discountPercent === 20; // PWD/Senior discount

        // Create payment records for each order with proportional discount
        const payments = await Promise.all(
          updatedOrders.map((order) => {
            const orderSubTotal = Number(order.totalAmount);
            const orderProportion = orderSubTotal / totalOrdersAmount;

            // Calculate proportional VAT
            const orderVatExclusiveAmount = orderSubTotal / 1.12;
            const orderVatAmount = isVatExempt
              ? 0
              : orderVatExclusiveAmount * 0.12;
            const orderVatExempt = isVatExempt ? orderVatExclusiveAmount : 0;

            // Calculate discount based on whether VAT exempt
            // For PWD/Senior: discount applies to VAT-exclusive amount
            // For others: discount applies to full amount
            const discountBase = isVatExempt
              ? orderVatExclusiveAmount
              : orderSubTotal;
            const orderDiscountAmount = orderProportion * (discountAmount || 0);

            // Amount due calculation
            // For PWD/Senior: VAT-exclusive amount minus discount
            // For others: Full amount minus discount
            const orderAmountDue = discountBase - orderDiscountAmount;

            // For multi-order payments:
            // - All orders record the same amountTendered (actual cash received)
            // - Only the first order records the change
            const isFirstOrder = order.id === updatedOrders[0].id;

            // Calculate total amount due across all orders (after discount)
            const totalAmountDueAllOrders = updatedOrders.reduce((sum, o) => {
              const oSubTotal = Number(o.totalAmount);
              const oVatExclusive = oSubTotal / 1.12;
              const oDiscountBase = isVatExempt ? oVatExclusive : oSubTotal;
              const oProportion = oSubTotal / totalOrdersAmount;
              const oDiscountAmount = oProportion * (discountAmount || 0);
              return sum + (oDiscountBase - oDiscountAmount);
            }, 0);

            // All orders record the same amount tendered
            const orderAmountTendered = amountPaid;

            // Only first order records the change
            const orderChange = isFirstOrder
              ? Math.max(amountPaid - totalAmountDueAllOrders, 0)
              : 0;

            return tx.payment.create({
              data: {
                orderRequest: { connect: { id: order.id } },
                subTotal: new Prisma.Decimal(orderSubTotal),
                discountAmount: new Prisma.Decimal(orderDiscountAmount),
                discountPercent: new Prisma.Decimal(discountPercent || 0),
                discountType:
                  discountPercent === 20
                    ? isVatExempt
                      ? "PWD"
                      : "SENIOR"
                    : discountPercent > 0
                    ? "CUSTOM"
                    : "NONE",
                vatRate: new Prisma.Decimal(12),
                vatAmount: new Prisma.Decimal(orderVatAmount),
                vatExempt: new Prisma.Decimal(orderVatExempt),
                zeroRated: new Prisma.Decimal(0),
                amountDue: new Prisma.Decimal(orderAmountDue),
                amountTendered: new Prisma.Decimal(orderAmountTendered),
                change: new Prisma.Decimal(orderChange),
                processedBy: { connect: { id: session.user.id } },
              },
              include: {
                processedBy: true,
              },
            });
          })
        );

        return { updatedOrders, payments };
      }
    );

    const pharmacists = await db.user.findMany({
      where: { role: "Pharmacist_Staff" },
    });

    // Send notifications and audit logs
    for (const order of result.updatedOrders) {
      for (const pharmacist of pharmacists) {
        const notification = await db.notification.create({
          data: {
            title: "Payment processed",
            senderId: session.user.id,
            recipientId: pharmacist.id,
            orderId: order.id,
            type: NotificationType.PAYMENT_PROCESSED,
            patientName: order.patient.patientName ?? "",
            roomNumber: order.patient.roomNumber?.toString() ?? "",
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
            orderType: order.type,
            createdAt: notification.createdAt,
            type: notification.type,
            notes: order.notes || "",
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
              id: order.id,
              patientName: order.patient.patientName ?? "",
              roomNumber: order.patient.roomNumber?.toString() ?? "",
              products: order.items.map((item) => ({
                productName: item.product.product_name,
              })),
            },
          }
        );
      }

      await db.auditLog.create({
        data: {
          userId: session.user.id,
          action: "Payment Processed",
          entityType: "OrderRequest",
          entityId: order.id,
          description: `User ${session.user.username} (${
            session.user.role
          }) processed payment for patient "${order.patient.patientName}" ${
            order.patient.roomNumber
              ? `in room ${order.patient.roomNumber}`
              : ""
          }.`,
        },
      });
    }

    return NextResponse.json({
      success: true,
      paymentsCreated: result.payments.length,
      totalAmountPaid: amountPaid,
    });
  } catch (error) {
    console.error("❌ Payment process error:", error);
    return NextResponse.json(
      { message: "Internal server error", error: String(error) },
      { status: 500 }
    );
  }
}
