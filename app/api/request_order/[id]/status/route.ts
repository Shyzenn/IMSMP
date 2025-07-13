import { db } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";

export async function PUT(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params; 

  const numericId = parseInt(id.replace("ORD-", ""));
  if (!numericId) {
    return NextResponse.json({ message: "Invalid ID" }, { status: 400 });
  }

  const { status } = await req.json();

  if (!status || !["for_payment", "paid"].includes(status)) {
    return NextResponse.json({ message: "Invalid or missing status" }, { status: 400 });
  }

  try {
    await db.orderRequest.update({
      where: { id: numericId },
      data: { status },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error updating status:", error);
    return NextResponse.json({ message: "Error updating status" }, { status: 500 });
  }
}
