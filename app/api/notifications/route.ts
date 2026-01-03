import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { db } from "@/lib/db";

export async function GET() {
  const session = await auth();

  if (!session || !session.user?.id) {
    return NextResponse.json([], { status: 401 });
  }

  const notifications = await db.notification.findMany({
    where: {
      recipientId: session.user.id,
    },
    include: {
      sender: {
        select: {
          username: true,
          role: true,
        },
      },
      order: {
        select: {
          id: true,
          patient: {
            select: {
              patientName: true,
              roomNumber: true,
            },
          },
        },
      },
      walkInOrder: {
        select: {
          id: true,
          customer_name: true,
        },
      },
      medTechRequest: {
        select: {
          id: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
    take: 20,
  });

  const formattedNotifications = notifications.map((notif) => ({
    ...notif,
    patientName: notif.patientName || notif.order?.patient?.patientName || "",
    roomNumber: notif.roomNumber || notif.order?.patient?.roomNumber || null,
    medTechRequestId: notif.medTechRequest?.id || null,
    walkInOrderId: notif.walkInOrder?.id || null,
  }));

  return NextResponse.json(formattedNotifications);
}
