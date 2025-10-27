import { auth } from "@/auth";
import { db } from "@/lib/db";
import { pusherServer } from "@/lib/pusher/server";
import { NotificationType } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";

export async function PUT(
    req: NextRequest, 
    context: {params: Promise<{id: string}>}
) {
    try{
        const session = await auth();
        if (!session || !session.user?.id) {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }
        const userId = session.user.id;
        
        const { id } = await context.params
        const numericId = parseInt(id.replace("ORD-", ""));
        if (!numericId) {
            return NextResponse.json({ message: "Invalid ID" }, { status: 400 });
        }

        const { remarks } = await req.json();
        const validRemarks = ["preparing", "prepared", "dispensed"] as const;

        if (!validRemarks.includes(remarks)) {
        return NextResponse.json({ error: "Invalid remarks" }, { status: 400 });
        } 

        const updatedOrder = await db.orderRequest.update({
            where: { id: numericId },
            data: { remarks },
        });

        if (remarks === "prepared") {
            const nurses = await db.user.findMany({
            where: { role: "Nurse" },
            });
        
            for (const nurse of nurses) {
                const notification = await db.notification.create({
                    data: {
                      title: "Order Prepared",
                      senderId: session.user.id,
                      recipientId: nurse.id,
                      orderId: updatedOrder.id,
                      type: NotificationType.REMARKS,
                      patientName: updatedOrder.patient_name ?? "",
                      roomNumber: updatedOrder.room_number ?? "",
                      submittedBy: session.user.username ?? "",
                      role: session.user.role ?? "",
                    },
                      include: { sender: true },
                });
            
                await pusherServer.trigger(
                  `private-user-${nurse.id}`,
                  "new-notification",
                  {
                        id: notification.id,
                        title: notification.title,
                        createdAt: notification.createdAt,
                        type: notification.type,
                        sender: {
                          username: notification.sender.username,
                          role: notification.sender.role,
                        },
                        order: {
                          patient_name: updatedOrder.patient_name,
                          room_number: updatedOrder.room_number,
                        },
                      }
                    );
              }
         }

        await db.auditLog.create({
          data: {
            userId,
            action: "Remarks Update",
            entityType: "OrderRequest",
            entityId: updatedOrder.id,
            description: `Order ${updatedOrder.id} marked as ${remarks.toUpperCase()} by ${session.user.username}`,
          },
        });

        return NextResponse.json({
            success: true,
            message: `Order marked as ${remarks}`,
            data: updatedOrder,
        });
    
    } catch (error) {
        console.error("Error updating remarks:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
    
}