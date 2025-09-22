import { WalkInOrderSchema } from "@/lib/types";
import { db } from "@/lib/db";
import { NextResponse } from "next/server";
import { auth } from "@/auth";
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

    const newOrder = await db.$transaction(async (tx) => {
      let grandTotal = 0;
      const today = new Date()

      const orderItems = await Promise.all(
        products.map(async (product) => {
          // Find product by ID
         const dbProduct = await tx.product.findUnique({
          where: { product_name: product.productId }, 
          include: { batches: true },
        });

          if (!dbProduct) throw new Error(`Product not found: ${product.productId}`);

          const itemTotal = Number(dbProduct.price) * product.quantity;
          grandTotal += itemTotal;

         // Get only non-expired batches with stock > 0
          const validBatches = dbProduct.batches
          .filter((b) => b.expiryDate >= today && b.quantity > 0)
          .sort(
            (a, b) => new Date(a.expiryDate).getTime() - new Date(b.expiryDate).getTime()
          );

          // Check stock only across valid batches
          const totalAvailable = validBatches.reduce((acc, b) => acc + b.quantity, 0);
          if (totalAvailable < product.quantity) {
            throw new Error(`Not enough stock for ${dbProduct.product_name}`);
          }

          // Deduct from batches in FEFO order
          let remainingQty = product.quantity;
          for (const batch of validBatches) {
            if (remainingQty <= 0) break;
            

            const deduction = Math.min(batch.quantity, remainingQty);
            await tx.productBatch.update({
              where: { id: batch.id },
              data: { quantity: batch.quantity - deduction },
            });
            remainingQty -= deduction;
          }

          return {
            quantity: product.quantity,
            price: dbProduct.price,
            total: itemTotal,
            product: { connect: { id: dbProduct.id } },
          };
        })
      );

      // Create the walk-in order
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

    // Notify all managers
    const managers = await db.user.findMany({
      where: { role: "Manager" },
    });

    if (managers.length > 0) {
      const notifications = managers.map((manager) => ({
        title: "New Walk-In Order",
        message: JSON.stringify({
          customer_name,
          submittedBy: session.user.username,
          role: session.user.role,
        }),
        type: NotificationType.ORDER_REQUEST,
        senderId: userId,
        recipientId: manager.id,
        walkInOrderId: newOrder.id,
      }));

      await db.notification.createMany({ data: notifications });
    }

    console.log("Walk-in order created:", newOrder.id);
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
