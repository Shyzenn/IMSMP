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
    orderBy: {
      createdAt: "desc",
    },
  });

  return NextResponse.json(notifications);
}
