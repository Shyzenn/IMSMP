import { db } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";

export async function PUT(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;

  const numericId = parseInt(id.replace("ORD-", ""));
  if (!numericId) {
    return NextResponse.json({ message: "Invalid ID" }, { status: 400 });
  }

  const { status } = await req.json();

  if (!status || !["for_payment", "paid"].includes(status)) {
    return NextResponse.json(
      { message: "Invalid or missing status" },
      { status: 400 }
    );
  }

  try {
    // Update order status
    const updatedOrder = await db.orderRequest.update({
      where:{id: numericId},
      data:{status},
      include:{
        items:{
          include:{
            product: true
          }
        }
      }
    })

    // Decrease product quantities if changing to "for_payment"


     if(status === "for_payment"){
        for(const item of updatedOrder.items){
          await db.product.update({
            where:{id: item.productId},
            data:{
              quantity:{
                decrement: item.quantity
              }
            }
          })
        }
      }

    // try {
    //   await db.orderRequest.update({
    //     where: { id: numericId },
    //     data: { status },
    // });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error updating status:", error);
    return NextResponse.json(
      { message: "Error updating status" },
      { status: 500 }
    );
  }
}
