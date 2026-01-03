import { WalkInPaymentSchema } from "@/lib/types";
import { db } from "@/lib/db";
import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { pusherServer } from "@/lib/pusher/server";
import { NotificationType } from "@prisma/client";

export async function POST(req: Request) {
  try {
    const session = await auth();

    if (!session || !session.user?.id) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;
    const body = await req.json();
    const result = WalkInPaymentSchema.safeParse(body);

    if (!result.success) {
      const zodErrors: Record<string, string> = {};
      result.error.issues.forEach((issue) => {
        const field = issue.path.join(".");
        zodErrors[field] = issue.message;
      });
      return NextResponse.json({ errors: zodErrors }, { status: 400 });
    }

    const {
      customer_name,
      items,
      discountType,
      amountTendered,
      change,
      discountPercent = 0,
    } = result.data;

    const newOrder = await db.$transaction(
      async (tx) => {
        let subtotal = 0;
        const today = new Date();

        const orderItems = await Promise.all(
          items.map(async (item) => {
            const dbProduct = await tx.product.findUnique({
              where: { id: Number(item.productId) },
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

            if (!dbProduct)
              throw new Error(`Product not found: ${item.productId}`);

            const itemTotal = Number(dbProduct.price) * item.quantity;
            subtotal += itemTotal;

            const validBatches = dbProduct.batches;
            const totalAvailable = validBatches.reduce(
              (acc, b) => acc + b.quantity,
              0
            );
            if (totalAvailable < item.quantity)
              throw new Error(`Not enough stock for ${dbProduct.product_name}`);

            let remainingQty = item.quantity;
            const updates = [];

            for (const batch of validBatches) {
              if (remainingQty <= 0) break;

              const deduction = Math.min(batch.quantity, remainingQty);
              updates.push(
                tx.productBatch.update({
                  where: { id: batch.id },
                  data: { quantity: batch.quantity - deduction },
                })
              );
              remainingQty -= deduction;
            }

            await Promise.all(updates);

            return {
              quantity: item.quantity,
              price: dbProduct.price,
              total: itemTotal,
              product: { connect: { id: dbProduct.id } },
            };
          })
        );

        const VAT_RATE = 0.12;

        // Check if PWD or Senior Citizen (VAT-exempt)
        const isPWDOrSenior =
          discountType === "PWD" || discountType === "SENIOR";

        let vatAmount = 0;
        let vatExempt = 0;
        let vatableSales = 0;
        let netOfVAT = subtotal;

        if (isPWDOrSenior) {
          // PWD/Senior: Remove VAT first, then apply 20% discount
          // Formula: Net of VAT = Gross / 1.12
          netOfVAT = subtotal / (1 + VAT_RATE);
          vatExempt = netOfVAT; // The VAT amount being exempted
          vatAmount = 0; // No VAT charged

          // Apply 20% discount on the net of VAT amount
          const computedDiscount = (netOfVAT * discountPercent) / 100;
          const finalTotal = netOfVAT - computedDiscount;
          const amountDue = finalTotal;

          const order = await tx.walkInTransaction.create({
            data: {
              customer_name,
              totalAmount: finalTotal,
              userId,
              status: "paid",
              items: { create: orderItems },
            },
          });

          await tx.payment.create({
            data: {
              walkInOrder: { connect: { id: order.id } },

              subTotal: subtotal,
              discountAmount: computedDiscount,
              discountType,
              discountPercent,

              vatAmount: 0, // No VAT
              vatExempt: vatExempt, // VAT amount exempted
              zeroRated: 0,

              amountDue,
              amountTendered: amountTendered,
              change,

              processedBy: { connect: { id: session.user.id } },
            },
          });

          return order;
        } else {
          // Regular customer or custom discount: VAT is included
          const computedDiscount = (subtotal * discountPercent) / 100;
          const finalTotal = subtotal - computedDiscount;

          // Calculate VAT (it's already included in the price)
          vatableSales = finalTotal;
          vatAmount = Number(
            ((vatableSales / (1 + VAT_RATE)) * VAT_RATE).toFixed(2)
          );
          const amountDue = finalTotal;

          const order = await tx.walkInTransaction.create({
            data: {
              customer_name,
              totalAmount: finalTotal,
              userId,
              status: "paid",
              items: { create: orderItems },
            },
          });

          await tx.payment.create({
            data: {
              walkInOrder: { connect: { id: order.id } },

              subTotal: subtotal,
              discountAmount: computedDiscount,
              discountType,
              discountPercent,

              vatAmount,
              vatExempt: 0,
              zeroRated: 0,

              amountDue,
              amountTendered: amountTendered,
              change,

              processedBy: { connect: { id: session.user.id } },
            },
          });

          return order;
        }
      },
      { timeout: 15000 }
    );

    const cashiers = await db.user.findMany({
      where: { role: "Cashier" },
    });

    for (const cashier of cashiers) {
      const notification = await db.notification.create({
        data: {
          title: "New walk in order",
          type: NotificationType.WALK_IN,
          walkInOrderId: newOrder.id,
          senderId: session.user.id,
          recipientId: cashier.id,
          submittedBy: session.user.username,
          role: session.user.role,
        },
        include: { sender: true, recipient: true },
      });

      await pusherServer.trigger(
        `private-user-${cashier.id}`,
        "new-notification",
        {
          id: notification.id,
          title: notification.title,
          createdAt: notification.createdAt,
          type: notification.type,
          read: false,
          submittedBy: notification.submittedBy,
          role: notification.role,
          walkInOrderId: newOrder.id,
          order: {
            id: newOrder.id,
            products: items.map((item) => ({
              productName: item.productId,
              quantity: item.quantity,
              price: Number(
                items.find((p) => p.productId === item.productId)?.price ?? 0
              ),
            })),
          },
        }
      );
    }

    await db.auditLog.create({
      data: {
        userId,
        action: "Walk-in Paid",
        entityType: "WalkInOrder",
        entityId: newOrder.id,
        description: `User ${session.user.username} (${session.user.role}) created an order for "${customer_name}" with ${items.length} item(s).`,
      },
    });

    return NextResponse.json({ success: true, orderId: newOrder.id });
  } catch (error) {
    if (error instanceof Error) {
      console.error("Error in POST /api/walkin_order:", error.message);
      return NextResponse.json(
        { message: "Failed to create walk-in order", error: error.message },
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
