import { WalkInOrderSchema } from "@/lib/types";
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
    const result = WalkInOrderSchema.safeParse(body);

    if (!result.success) {
      const zodErrors: Record<string, string> = {};
      result.error.issues.forEach((issue) => {
        const field = issue.path.join(".");
        zodErrors[field] = issue.message;
      });
      return NextResponse.json({ errors: zodErrors }, { status: 400 });
    }

    const { customer_name, products } = result.data;

    const newOrder = await db.$transaction(
      async (tx) => {
        let grandTotal = 0;
        const today = new Date();

        const orderItems = await Promise.all(
          products.map(async (product) => {
            const dbProduct = await tx.product.findUnique({
              where: { product_name: product.productId },
              include: {
                batches: {
                  where: {
                    expiryDate: { gte: today },
                    quantity: { gt: 0 },
                  },
                  orderBy: { expiryDate: 'asc' }, 
                },
              },
            });

            if (!dbProduct) throw new Error(`Product not found: ${product.productId}`);

            const itemTotal = Number(dbProduct.price) * product.quantity;
            grandTotal += itemTotal;

            const validBatches = dbProduct.batches; 
            const totalAvailable = validBatches.reduce((acc, b) => acc + b.quantity, 0);
            if (totalAvailable < product.quantity)
              throw new Error(`Not enough stock for ${dbProduct.product_name}`);

            let remainingQty = product.quantity;
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
              quantity: product.quantity,
              price: dbProduct.price,
              total: itemTotal,
              product: { connect: { id: dbProduct.id } },
            };
          })
        );

            

        return await tx.walkInTransaction.create({
          data: {
            customer_name,
            totalAmount: grandTotal,
            userId,
            status: "paid",
            items: { create: orderItems },
          },
        });
      },
      { timeout: 15000 }
    );

    const cashiers = await db.user.findMany({
              where: { role: "Cashier" }
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
                  products: products.map((item) => ({
                    productName: item.productId,
                    quantity: item.quantity,
                    price: item.price,
                  })),
                },
              }
            );

            }

    // Create audit log
    await db.auditLog.create({
      data: {
        userId,
        action: "Walk-in Paid",
        entityType: "WalkInOrder",
        entityId: newOrder.id,
        description: `User ${session.user.username} (${session.user.role}) created an order for "${customer_name}" with ${products.length} item(s).`,
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
