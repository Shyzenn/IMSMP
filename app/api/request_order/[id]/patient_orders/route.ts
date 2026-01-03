import { auth } from "@/auth";
import { db } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";

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

    if (!id) {
      return NextResponse.json({ message: "Invalid ID" }, { status: 400 });
    }

    const orders = await db.orderRequest.findMany({
      where: {
        patientId: id,
        status: { in: ["for_payment", "pending"] },
      },
      include: {
        items: {
          include: {
            product: {
              select: {
                id: true,
                product_name: true,
                price: true,
                dosageForm: true,
                strength: true,
              },
            },
          },
        },
      },
      orderBy: {
        id: "desc",
      },
    });

    const formattedOrders = orders.map((order) => ({
      ...order,
      itemDetails: order.items.map((item) => ({
        id: item.id,
        productName: item.product.product_name,
        dosageForm: item.product.dosageForm,
        strength: item.product.strength,
        price: item.product.price,
        quantityOrdered: item.quantityOrdered,
        subTotal: item.totalPrice,
      })),
    }));

    return NextResponse.json({
      patientId: id,
      orders: formattedOrders,
    });
  } catch (error) {
    console.error("❌ Error fetching patient orders:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
