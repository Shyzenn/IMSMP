import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { auth } from "@/auth";

export async function GET(
   _req: NextRequest, 
    context: {params: Promise<{id: string}>}
) {

  const session = await auth();

  if (!session || !session.user?.id) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id } = await context.params
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
        processedBy: {
          select: { username: true },
        },
      },
    });

    if (!walkInOrder) {
      return NextResponse.json({ error: "Walk-in order not found" }, { status: 404 });
    }

    return NextResponse.json({
      id: walkInOrder.id,
      customer_name: walkInOrder.customer_name,
      status: walkInOrder.status,
      createdAt: walkInOrder.createdAt,
      items: walkInOrder.items.map((item) => ({
        quantity: item.quantity,
        product: {
          product_name: item.product?.product_name,
          price: item.product?.price,
        },
      })),
      user: walkInOrder.user,
      processedBy: walkInOrder.processedBy,
    });
  } catch (error) {
    console.error("Error fetching walk-in order notification:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
