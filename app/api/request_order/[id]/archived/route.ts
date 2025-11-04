import { auth } from "@/auth";
import { createAuditLog } from "@/lib/action/product";
import { db } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";

export async function PUT(
  _req: NextRequest, 
  context: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session || !session.user?.id) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { id: idParam } = await context.params;
    const id = Number(idParam);
    
    if (isNaN(id)) {
      return NextResponse.json(
        { success: false, message: "Invalid order ID" },
        { status: 400 }
      );
    }

    const orderRequest = await db.orderRequest.findUnique({
      where: { id },
    });

    if (!orderRequest) {
      return NextResponse.json(
        { success: false, message: "Order request not found" },
        { status: 404 }
      );
    }

    await db.orderRequest.update({
      where: { id },
      data: { isArchived: true, archivedById: session.user.id },
    });

    await createAuditLog(
      session.user.id,
      "ARCHIVE_ORDER_REQUEST",
      "OrderRequest",
      id,
      `Order Request ORD-${id.toString().padStart(4, "0")} (${orderRequest.status}) archived by ${session.user.username}`
    );

    return NextResponse.json({
      success: true,
      message: "Order request archived successfully",
    });
  } catch (error) {
    console.error("Error archiving order request:", error);
    return NextResponse.json(
      {
        success: false,
        message:
          error instanceof Error
            ? error.message
            : "Failed to archive order request",
      },
      { status: 500 }
    );
  }
}