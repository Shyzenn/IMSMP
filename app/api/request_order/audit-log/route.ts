import { db } from "@/lib/db";
import { NextResponse } from "next/server";
import { startOfDay, subDays } from "date-fns";
import { Prisma } from "@prisma/client";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const filter = searchParams.get("filter");
  const page = Number(searchParams.get("page")) || 1;
  const pageSize = 4;

  const now = new Date();
  let fromDate: Date | undefined;

  if (filter === "Today") {
    fromDate = startOfDay(now);
  } else if (filter === "Yesterday") {
    fromDate = startOfDay(subDays(now, 1));
  } else if (filter === "Last 7 days") {
    fromDate = subDays(now, 6);
  }

  const where: Prisma.AuditLogWhereInput = { entityType: "OrderRequest" };
  if (fromDate) {
    where.createdAt = { gte: fromDate, lte: now };
  }

  const total = await db.auditLog.count({ where });

  const logs = await db.auditLog.findMany({
    where,
    include: { user: true },
    orderBy: { createdAt: "desc" },
    skip: (page - 1) * pageSize,
    take: pageSize,
  });

  return NextResponse.json({ logs, total });
}
