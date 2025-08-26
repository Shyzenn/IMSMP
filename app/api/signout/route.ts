import { db } from "@/lib/db";
import { getToken } from "next-auth/jwt";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
  if (!token?.sub) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await db.user.update({
    where: { id: token.sub },
    data: {
      isOnline: false,
      lastSeen: new Date(),
    },
  });

  return NextResponse.json({ success: true });
}
