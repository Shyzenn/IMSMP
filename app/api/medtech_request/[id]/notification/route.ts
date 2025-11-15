import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(
   _req: NextRequest, 
    context: {params: Promise<{id: string}>}
) {
  try {
    const { id } = await context.params
    const numericId = parseInt(id.replace("REQ-", ""));
    if (!numericId) {
        return NextResponse.json({ message: "Invalid ID" }, { status: 400 });
    }

    const order = await db.medTechRequest.findUnique({
      where: { id: numericId },
      include: {
        receivedBy: true,
        approvedBy: true,
        requestedBy:true,
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

    return NextResponse.json(order, { status: 200 });
  } catch (error) {
    console.error("Error fetching order:", error);
    return NextResponse.json({ error: "Failed to fetch order" }, { status: 500 });
  }
}
