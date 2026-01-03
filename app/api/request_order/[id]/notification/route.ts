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

    const order = await db.orderRequest.findUnique({
      where: { id: numericId },
      include: {
        user: true,
        receivedBy: true,
        dispensedBy: true,
        preparedBy: true,
        items: {
          include: {
            product: true,
          },
        },
        patient: true,
        payments: {
          include: {
            processedBy: true,
          },
        },
      },
    });

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    const orderView: OrderView = {
      id: order.id,
      type: order.type as "REGULAR" | "EMERGENCY",
      requestedBy: order.user?.username ?? "Unknown",
      receivedBy: order.receivedBy?.username ?? "Unknown",
      patientDetails: {
        patientName: order.patient.patientName,
        roomNumber: order.patient.roomNumber ?? undefined,
        contactNumber: order.patient.contactNumber ?? undefined,
        patientNumber: order.patient.patientNumber ?? undefined,
      },
      dispensedAt: order.dispensedAt ?? undefined,
      dispensedBy: order.dispensedBy?.username,
      preparedAt: order.preparedAt ?? undefined,
      preparedBy: order.preparedBy?.username,
      notes: order.notes ?? "",
      remarks: order.remarks as
        | "preparing"
        | "prepared"
        | "dispensed"
        | undefined,
      status: order.status,
      createdAt: order.createdAt,

      paymentDetails: order.payments.map((payment) => ({
        processedBy: { username: payment.processedBy.username },
        processedAt: payment.createdAt,
        amountDue: Number(payment.amountDue),
        discountAmount: Number(payment.discountAmount),
        discountType: payment.discountType,
        discountPercent: Number(payment.discountPercent),
      })),

      itemDetails: (order.items || []).map((item) => ({
        productName: item.product?.product_name ?? "Unknown",
        strength: item.product.strength ?? "",
        dosageForm: item.product.dosageForm ?? "",
        quantityOrdered: item.quantityOrdered?.toNumber() ?? 0,
        price: item.product?.price?.toNumber() ?? 0,
      })),

      quantity: (order.items || []).reduce(
        (sum, item) => sum + (item.quantityOrdered?.toNumber() ?? 0),
        0
      ),
      price: (order.items || []).reduce(
        (sum, item) => sum + (item.product?.price?.toNumber() ?? 0),
        0
      ),
    };

    return NextResponse.json(orderView, { status: 200 });
  } catch (error) {
    console.error("Error fetching order:", error);
    return NextResponse.json(
      { error: "Failed to fetch order" },
      { status: 500 }
    );
  }
}
