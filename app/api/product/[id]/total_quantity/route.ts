import { auth } from "@/auth";
import { db } from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET(
  _req: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();

    if (!session || !session.user.id) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { id } = await context.params;
    const productId = Number(id);

    const totalQuantity = await db.productBatch.aggregate({
      where: {
        productId: productId,
        type: "ACTIVE",
      },
      _sum: {
        quantity: true,
      },
    });

    return NextResponse.json({
      totalQuantity: totalQuantity._sum.quantity || 0,
    });
  } catch (error) {
    console.error("Error fetching total quantity:", error);
    return NextResponse.json(
      { message: "Failed to fetch total quantity" },
      { status: 500 }
    );
  }
}
