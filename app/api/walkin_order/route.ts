import { WalkInOrderSchema } from "@/lib/types";
import { db } from "@/lib/db";
import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { NotificationType } from "@prisma/client";

export async function POST(req: Request) {
  try {
    const session = await auth();

    if (!session || !session.user?.id) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 400 });
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

    const newOrder = await db.$transaction(async (tx) => {
      let grandTotal = 0;

      const orderItems = await Promise.all(
        products.map(async (product) => {
          const dbProduct = await tx.product.findUnique({
            where: { product_name: product.productId },
          });

          if (!dbProduct) throw new Error(`Product ${product.productId} not found`);

          const itemTotal = Number(dbProduct.price) * product.quantity;
          grandTotal += itemTotal;

          if (dbProduct.quantity < product.quantity) {
            throw new Error(`Not enough stock for ${product.productId}`);
          }

          // Decrease the stock
          await tx.product.update({
            where: { id: dbProduct.id },
            data: { quantity: dbProduct.quantity - product.quantity },
          });

          return {
            quantity: product.quantity,
            price: dbProduct.price,
            total: itemTotal,
            product: { connect: { id: dbProduct.id } },
          };
        })
      );

      // Create walk-in order with items
      return await tx.walkInTransaction.create({
        data: {
          customer_name,
          totalAmount: grandTotal,
          userId,
          status: "paid",
          items: { create: orderItems },
        },
      });
    });

    await db.auditLog.create({
      data: {
        userId: session.user.id,
        action: "Walkin Paid",
        entityType: "WalkInOrder",
        entityId: newOrder.id,
        description: `User ${session.user.username} (${session.user.role}) created an order for walk in customer "${customer_name}" with ${products.length} item(s).`,
      },
    });

    // Notify all managers (outside transaction)
    const managers = await db.user.findMany({
      where: { role: "Manager" },
    });

    const notifications = managers.map((manager) => ({
      title: "New Walk In Order",
      message: JSON.stringify({
        customer_name,
        submittedBy: session.user.username,
        role: session.user.role,
      }),
      type: NotificationType.ORDER_REQUEST,
      senderId: session.user.id,
      recipientId: manager.id,
      walkInOrderId: newOrder.id,
    }));

    await db.notification.createMany({ data: notifications });

    console.log("Order and notifications successfully created:", newOrder);
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
