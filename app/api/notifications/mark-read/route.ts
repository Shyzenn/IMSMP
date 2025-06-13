import { auth } from "@/auth";
import { db } from "@/lib/db";
import { NextResponse } from "next/server";

export async function POST() {
  const session = await auth();

  if (!session || !session.user?.id) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  await db.notification.updateMany({
    where: {
      recipientId: session.user.id,
      read: false,
    },
    data: {
      read: true,
    },
  });

  return NextResponse.json({ success: true });
}
