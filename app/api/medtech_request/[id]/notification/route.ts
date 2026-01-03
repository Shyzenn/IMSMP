import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { auth } from "@/auth";

export async function GET(
  _req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();

    if (!session || !session.user?.id) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { id } = await context.params;
    const numericId = parseInt(id.replace("REQ-", ""));
    if (!numericId) {
      return NextResponse.json({ message: "Invalid ID" }, { status: 400 });
    }

    const order = await db.medTechRequest.findUnique({
      where: { id: numericId },
      include: {
        receivedBy: true,
        approvedBy: true,
        requestedBy: true,
        items: {
          include: {
            product: true,
          },
        },
      },
    });

    if (!order) {
      return NextResponse.json({ error: "Request not found" }, { status: 404 });
    }

    const response = {
      id: order.id,
      status: order.status,
      remarks: order.remarks,
      notes: order.notes ?? "",
      price: 0,
      requestedBy: order.requestedBy
        ? { username: order.requestedBy.username }
        : null,
      receivedBy: order.receivedBy
        ? { username: order.receivedBy.username }
        : null,
      approvedBy: order.approvedBy
        ? { username: order.approvedBy.username }
        : null,
      createdAt: order.createdAt.toISOString(),
      items: (order.items || []).map((item) => ({
        productName: item.product?.product_name ?? "Unknown",
        quantity: item.quantityOrdered?.toNumber() ?? 0,
        pricePerUnit: item.product?.price?.toNumber() ?? 0,
      })),
    };

    return NextResponse.json(response, { status: 200 });
  } catch (error) {
    console.error("Error fetching medtech request:", error);
    return NextResponse.json(
      { error: "Failed to fetch request" },
      { status: 500 }
    );
  }
}
