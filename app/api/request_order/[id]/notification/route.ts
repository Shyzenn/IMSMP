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

    const order = await db.orderRequest.findUnique({
      where: { id: numericId },
      include: {
        user: true,
        receivedBy: true,
        processedBy: true,
        items: {
          include: {
            product: true,
          },
        },
      },
    });

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    return NextResponse.json(order, { status: 200 });
  } catch (error) {
    console.error("Error fetching order:", error);
    return NextResponse.json({ error: "Failed to fetch order" }, { status: 500 });
  }
}
