import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { auth } from "@/auth";
import { OrderView } from "@/lib/interfaces";

export async function GET(
  _req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const session = await auth();

  if (!session || !session.user?.id) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id } = await context.params;
    const numericId = parseInt(id.replace("ORD-", ""));

    if (!numericId) {
      return NextResponse.json({ message: "Invalid ID" }, { status: 400 });
    }

    const walkInOrder = await db.walkInTransaction.findUnique({
      where: { id: numericId },
      include: {
        items: {
          include: {
            product: true,
          },
        },
        user: {
          select: { username: true },
        },
        payments: {
          select: {
            processedBy: true,
            createdAt: true,
            amountDue: true,
            discountAmount: true,
            discountType: true,
            discountPercent: true,
          },
        },
      },
    });

    if (!walkInOrder) {
      return NextResponse.json(
        { error: "Walk-in order not found" },
        { status: 404 }
      );
    }

    const response: OrderView = {
      id: walkInOrder.id,
      type: "Walk In",
      customer: walkInOrder.customer_name ?? "Unknown",
      status: walkInOrder.status,
      createdAt: walkInOrder.createdAt,
      quantity: walkInOrder.items.reduce((sum, item) => sum + item.quantity, 0),
      price: walkInOrder.items.reduce(
        (sum, item) => sum + Number(item.price),
        0
      ),
      paymentDetails: walkInOrder.payments.map((payment) => ({
        processedBy: { username: payment.processedBy.username },
        processedAt: payment.createdAt,
        amountDue: Number(payment.amountDue),
        discountAmount: Number(payment.discountAmount),
        discountType: payment.discountType,
        discountPercent: Number(payment.discountPercent),
      })),

      itemDetails: (walkInOrder.items || []).map((item) => ({
        productName: item.product?.product_name ?? "Unknown",
        strength: item.product.strength ?? "",
        dosageForm: item.product.dosageForm ?? "",
        quantityOrdered: item.quantity ?? 0,
        price: item.product?.price?.toNumber() ?? 0,
      })),
    };

    return NextResponse.json(response, { status: 200 });
  } catch (error) {
    console.error("Error fetching walk-in order:", error);
    return NextResponse.json(
      { error: "Failed to fetch order" },
      { status: 500 }
    );
  }
}
