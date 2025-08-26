import { auth } from "@/auth";
import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function POST(req: Request) {
  const session = await auth();

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = session.user?.id;
  if (!userId) {
    return NextResponse.json({ error: "Invalid session" }, { status: 401 });
  }

  const body = await req.json();

  if (!body || typeof body !== "object") {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  const { action, entityType, entityId, description } = body;

  const numericEntityId =
    typeof entityId === "string" && entityId.startsWith("ORD-")
      ? parseInt(entityId.replace("ORD-", ""), 10)
      : entityId;

  const log = await db.auditLog.create({
    data: {
      userId,
      action,
      entityType,
      entityId: numericEntityId ?? null,
      description: description ?? null,
    },
  });

  return NextResponse.json(log);
}
