import { db } from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const logs = await db.auditLog.findMany({
      include: { user: { select: { username: true } } },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(logs);
  } catch (error) {
    console.error("Audit export failed:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
